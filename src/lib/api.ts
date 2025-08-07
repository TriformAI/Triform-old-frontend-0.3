import { browser } from '$app/environment'
import { error, fail, type ActionFailure, type RequestEvent } from '@sveltejs/kit'
import { stream as eventStream } from 'fetch-event-stream'

type RequestMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

type StreamEvent<T> = {
	data: T
	event?: string
}

export class ApiError extends Error {
	status: number
	data: Record<string, string>

	constructor(status: number, data: Record<string, string>) {
		super('Request failed')
		this.status = status
		this.data = data
	}
}

export type ApiErrorType = InstanceType<typeof ApiError>

type ReturnDataWithHeaders<T> = {
	data: T
	success: boolean
	headers: Headers
}

type ReturnData<T> = {
	data: T
	success: boolean
}

// Helper type to determine if we're on server based on RequestEvent presence
type IsServerSide<T> = T extends RequestEvent ? true : false

// Conditional return types
type MutationResult<T, TEvent = undefined> =
	IsServerSide<TEvent> extends true ? ReturnData<T> | ActionFailure : ReturnData<T>

export class API<TEvent extends RequestEvent | undefined = undefined> {
	#baseURL: string
	#fetch: typeof fetch
	#cookie: string

	constructor(baseURL: string = '/api', event?: TEvent) {
		this.#fetch = event?.fetch ?? fetch
		this.#baseURL = baseURL
		this.#cookie = event?.request.headers.get('cookie') ?? ''
	}

	// Overloads based on returnOnlyPromise and returnHeaders
	async #request<T>(
		method: RequestMethod,
		endpoint: string,
		data: unknown,
		headers: Record<string, string>,
		returnHeaders: true
	): Promise<ReturnDataWithHeaders<T>>

	async #request<T>(
		method: RequestMethod,
		endpoint: string,
		data: unknown,
		headers: Record<string, string>,
		returnHeaders?: false
	): Promise<ReturnData<T>>

	async #request<T>(
		method: RequestMethod,
		endpoint: string,
		data: unknown,
		headers: Record<string, string>,
		returnHeaders: true
	): Promise<ReturnDataWithHeaders<T> | ActionFailure>

	async #request<T>(
		method: RequestMethod,
		endpoint: string,
		data: unknown,
		headers: Record<string, string>,
		returnHeaders?: false
	): Promise<ReturnData<T> | ActionFailure>

	// Base overload
	async #request<T>(
		method: RequestMethod,
		endpoint: string,
		data?: unknown,
		headers?: Record<string, string>,
		returnHeaders?: boolean
	): Promise<ReturnData<T> | ReturnDataWithHeaders<T> | ActionFailure>

	// --- Implementation ---
	async #request<T>(
		method: RequestMethod,
		endpoint: string,
		data?: unknown,
		headers: Record<string, string> = {},
		returnHeaders = false
	): Promise<ReturnData<T> | ReturnDataWithHeaders<T> | ActionFailure> {
		try {
			console.log(`--> ${method} ${this.#baseURL}/${endpoint}`)
			const response = await this.#fetch(`${this.#baseURL}/${endpoint}`, {
				method,
				headers: {
					'Content-Type': 'application/json',
					cookie: this.#cookie,
					...headers
				},
				body: data ? JSON.stringify(data) : undefined
			})

			const result = await response.json()

			if (browser) {
				return {
					...result,
					success: response.ok,
					status: response.status
				}
			}

			// Return fail or error if response not ok and if we're on server
			if (!response.ok) {
				console.error('API error: ', result)
				if (['POST', 'PUT', 'DELETE'].includes(method)) {
					return fail(response.status, result)
				}

				error(response.status, result)
			}

			const returnData = {
				...result,
				success: response.ok,
				status: response.status
			}

			if (returnHeaders) {
				return {
					...returnData,
					headers: response.headers
				}
			}

			return returnData
		} catch (error) {
			console.error('API error: ', error)
			return { success: false, status: 500, message: 'Server error' }
		}
	}

	// --- Public Methods ---
	get<T>(
		endpoint: string,
		headers: Record<string, string> = {},
		returnHeaders: boolean = false
	): Promise<ReturnData<T> | ReturnDataWithHeaders<T>> {
		return this.#request<T>('GET', endpoint, undefined, headers, returnHeaders as any)
	}

	post<T>(
		endpoint: string,
		data: unknown,
		headers: Record<string, string> = {}
	): Promise<MutationResult<T, TEvent>> {
		return this.#request<T>('POST', endpoint, data, headers)
	}

	put<T>(
		endpoint: string,
		data: unknown,
		headers: Record<string, string> = {}
	): Promise<MutationResult<T, TEvent>> {
		return this.#request<T>('PUT', endpoint, data, headers)
	}

	patch<T>(
		endpoint: string,
		data: unknown,
		headers: Record<string, string> = {}
	): Promise<MutationResult<T, TEvent>> {
		return this.#request<T>('PATCH', endpoint, data, headers)
	}

	delete<T>(
		endpoint: string,
		data?: unknown,
		headers: Record<string, string> = {}
	): Promise<MutationResult<T, TEvent>> {
		return this.#request<T>('DELETE', endpoint, data, headers)
	}

	async *stream<T>(
		endpoint: string,
		data?: unknown,
		method?: RequestMethod,
		headers: Record<string, string> = {},
		signal?: AbortSignal
	): AsyncGenerator<StreamEvent<T>, void, unknown> {
		const url = `${this.#baseURL}/${endpoint}`

		const requestInit: RequestInit = {
			method: method ?? (data ? 'POST' : 'GET'),
			headers: {
				cookie: this.#cookie,
				...headers
			},
			signal
		}

		if (data) {
			requestInit.headers = {
				...requestInit.headers,
				'Content-Type': 'application/json'
			}
			requestInit.body = JSON.stringify(data)
		}

		const events = await eventStream(url, requestInit)

		for await (const event of events) {
			if (event.data) {
				yield {
					data: JSON.parse(event.data) as T,
					event: event.event
				}
			}
		}
	}
}
