import { stream } from 'fetch-event-stream'

type RequestMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'

export class API {
	#baseURL: string
	#authToken?: string
	#fetchFunc: typeof fetch

	// This API class can be used for both internal requests and to our external API
	constructor(baseURL: string = '/api', authToken?: string, fetchFunc = fetch) {
		this.#fetchFunc = fetchFunc
		this.#baseURL = baseURL
		if (authToken) {
			this.#authToken = authToken
		} else {
			// if no auth token was provided, try to get the org token from the session storage
			if (!sessionStorage?.getItem) return
			this.#authToken = sessionStorage.getItem('activeOrgToken') ?? ''
		}
	}

	async #request<T>(
		method: RequestMethod,
		endpoint: string,
		data?: unknown,
		headers: Record<string, string> = {}
	): Promise<T> {
		//console.debug(`-> ${method} ${this.#baseURL}/${endpoint}`, data ?? '')

		const isAPIToken = this.#authToken?.startsWith('Bearer ')
		if (isAPIToken) headers['Authorization'] = this.#authToken!

		const res = await this.#fetchFunc(`${this.#baseURL}/${endpoint}`, {
			method,
			headers: {
				'Content-Type': 'application/json',
				Cookie: this.#authToken && !isAPIToken ? `triform_key=${this.#authToken}` : '',
				...headers
			},
			body: data ? JSON.stringify(data) : undefined
		})

		if (!res.ok) {
			throw new Error(`API Error: ${res.status} ${res.statusText} ${await res.text()}`)
		}

		//console.log(res)

		return res.json() as Promise<T>
	}

	get<T>(endpoint: string, headers?: Record<string, string>) {
		return this.#request<T>('GET', endpoint, undefined, headers)
	}

	post<T>(endpoint: string, data: unknown, headers?: Record<string, string>) {
		return this.#request<T>('POST', endpoint, data, headers)
	}

	put<T>(endpoint: string, data: unknown, headers?: Record<string, string>) {
		return this.#request<T>('PUT', endpoint, data, headers)
	}

	patch<T>(endpoint: string, data: unknown, headers?: Record<string, string>) {
		return this.#request<T>('PATCH', endpoint, data, headers)
	}

	delete<T>(endpoint: string, headers?: Record<string, string>) {
		return this.#request<T>('DELETE', endpoint, undefined, headers)
	}

	stream(
		endpoint: string,
		method: RequestMethod = 'GET',
		data?: unknown,
		headers?: Record<string, string>
	) {
		// Create a promise so we can return the emitter early before it's done streaming
		// eslint-disable-next-line no-async-promise-executor
		return new Promise<EventTarget>(async (resolve, reject) => {
			console.debug(`-> stream ${method} ${this.#baseURL}/${endpoint}`, data ?? '')

			const emitter = new EventTarget()

			try {
				const events = await stream(`${this.#baseURL}/${endpoint}`, {
					method,
					headers: {
						Cookie: this.#authToken ? `triform_key=${this.#authToken}` : '',
						...headers
					},
					body: data ? JSON.stringify(data) : undefined
				})

				resolve(emitter)

				for await (const event of events) {
					emitter.dispatchEvent(
						new CustomEvent('message', {
							detail: event
						})
					)
				}

				// Once we're done, emit the final close event
				console.log('emitting close event')
				emitter.dispatchEvent(new CustomEvent('close', {}))
			} catch (e) {
				// @ts-expect-error text is not in the error type
				const text = await e?.text?.()
				console.error('Failed to start stream', e, text)
				reject(new Error(text))
			}
			return
		})
	}
}
