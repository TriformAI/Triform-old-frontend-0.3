import { stream } from 'fetch-event-stream'

type RequestMethod = 'GET' | 'POST' | 'PUT' | 'DELETE'

export class API {
	#baseURL: string
	#authToken?: string

	// This API class can be used for both internal requests and to our external API
	constructor(baseURL: string = '/api', authToken?: string) {
		this.#baseURL = baseURL
		if (authToken) {
			this.#authToken = authToken
		}
	}

	async #request<T>(
		method: RequestMethod,
		endpoint: string,
		data?: unknown,
		headers: Record<string, string> = {}
	): Promise<T> {
		console.debug(`-> ${method} ${this.#baseURL}/${endpoint}`, data ?? '')
		const res = await fetch(`${this.#baseURL}/${endpoint}`, {
			method,
			headers: {
				'Content-Type': 'application/json',
				Cookie: this.#authToken ? `triform_key=${this.#authToken}` : '',
				...headers
			},
			body: data ? JSON.stringify(data) : undefined
		})

		if (!res.ok) {
			throw new Error(`API Error: ${res.status} ${res.statusText} ${await res.text()}`)
		}

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
		return new Promise<EventTarget>(async resolve => {
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
			} catch (e) {
				// @ts-expect-error text is not in the error type
				console.error('Failed to start stream', e, await e?.text?.())
			}

			// Once we're done, emit the final close event
			emitter.dispatchEvent(new CustomEvent('close', {}))
			return
		})
	}
}
