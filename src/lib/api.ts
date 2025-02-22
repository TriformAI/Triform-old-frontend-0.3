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
		console.debug(`Sending ${method} ${this.#baseURL}/${endpoint}`, data)
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
}
