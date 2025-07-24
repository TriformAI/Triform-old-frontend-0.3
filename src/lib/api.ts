import { browser } from '$app/environment'
import { getRequestEvent } from '$app/server'
import { error, fail, type ActionFailure } from '@sveltejs/kit'

type RequestMethod = 'GET' | 'POST' | 'PUT' | 'DELETE'

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
	headers: Headers
}

type ReturnData<T> = {
	data: T
}

export class API {
	#baseURL: string
	#fetchFunc: typeof fetch

	constructor(baseURL: string = '/api', fetchFunc = fetch) {
		this.#fetchFunc = fetchFunc
		this.#baseURL = baseURL
	}

	// Overloads based on returnOnlyPromise and returnHeaders
	async #request<T>(
		method: RequestMethod,
		endpoint: string,
		data: unknown,
		headers: Record<string, string>,
		returnOnlyPromise: true,
		returnHeaders: true
	): Promise<ReturnDataWithHeaders<T>>

	async #request<T>(
		method: RequestMethod,
		endpoint: string,
		data: unknown,
		headers: Record<string, string>,
		returnOnlyPromise: true,
		returnHeaders?: false
	): Promise<ReturnData<T>>

	async #request<T>(
		method: RequestMethod,
		endpoint: string,
		data: unknown,
		headers: Record<string, string>,
		returnOnlyPromise: false,
		returnHeaders: true
	): Promise<ReturnDataWithHeaders<T> | ActionFailure>

	async #request<T>(
		method: RequestMethod,
		endpoint: string,
		data: unknown,
		headers: Record<string, string>,
		returnOnlyPromise: false,
		returnHeaders?: false
	): Promise<ReturnData<T> | ActionFailure>

	// Base overload
	async #request<T>(
		method: RequestMethod,
		endpoint: string,
		data?: unknown,
		headers?: Record<string, string>,
		returnOnlyPromise?: boolean,
		returnHeaders?: boolean
	): Promise<ReturnData<T> | ReturnDataWithHeaders<T> | ActionFailure>

	// --- Implementation ---
	async #request<T>(
		method: RequestMethod,
		endpoint: string,
		data?: unknown,
		headers: Record<string, string> = {},
		returnOnlyPromise = false,
		returnHeaders = false
	): Promise<ReturnData<T> | ReturnDataWithHeaders<T> | ActionFailure> {
		let cookie = undefined

		if (!browser) {
			const { request } = getRequestEvent()
			cookie = this.#baseURL !== '/	api' ? (request.headers.get('cookie') ?? '') : ''
		}

		const response = await this.#fetchFunc(`${this.#baseURL}/${endpoint}`, {
			method,
			headers: {
				'Content-Type': 'application/json',
				cookie,
				...headers
			},
			body: data ? JSON.stringify(data) : undefined
		})

		// Check if response is JSON
		const contentType = response.headers.get('content-type')
		let result: any

		if (contentType && contentType.includes('application/json')) {
			result = await response.json()
		} else {
			// If not JSON, read as text and wrap in an object
			const text = await response.text()
			result = { message: text }
		}

		if (returnOnlyPromise) {
			if (returnHeaders) {
				return { data: result as T, headers: response.headers }
			}
			return result as ReturnData<T>
		}

		if (!response.ok) {
			console.error('API error: ', result)
			if (['POST', 'PUT', 'DELETE'].includes(method)) {
				return fail(response.status, result)
			}

			error(response.status, result)
		}

		if (returnHeaders) {
			return { data: result as T, headers: response.headers }
		}

		return result as ReturnData<T>
	}

	// --- Public Methods ---
	get<T>(
		endpoint: string,
		headers?: Record<string, string>,
		returnHeaders?: false
	): Promise<ReturnData<T>>
	get<T>(
		endpoint: string,
		headers: Record<string, string>,
		returnHeaders: true
	): Promise<ReturnDataWithHeaders<T>>
	get<T>(
		endpoint: string,
		headers: Record<string, string> = {},
		returnHeaders: boolean = false
	): Promise<ReturnData<T> | ReturnDataWithHeaders<T>> {
		return this.#request<T>('GET', endpoint, undefined, headers, false, returnHeaders as any) as any
	}

	getRaw<T>(
		endpoint: string,
		headers?: Record<string, string>,
		returnHeaders?: false
	): Promise<ReturnData<T>>
	getRaw<T>(
		endpoint: string,
		headers: Record<string, string>,
		returnHeaders: true
	): Promise<ReturnDataWithHeaders<T>>
	getRaw<T>(
		endpoint: string,
		headers: Record<string, string> = {},
		returnHeaders: boolean = false
	): Promise<ReturnData<T> | ReturnDataWithHeaders<T>> {
		return this.#request<T>('GET', endpoint, undefined, headers, true, returnHeaders as any) as any
	}

	post<T>(
		endpoint: string,
		data: unknown,
		headers: Record<string, string> = {}
	): Promise<ReturnData<T> | ActionFailure> {
		return this.#request<T>('POST', endpoint, data, headers, false)
	}

	postRaw<T>(
		endpoint: string,
		data: unknown,
		headers: Record<string, string> = {}
	): Promise<ReturnData<T>> {
		return this.#request<T>('POST', endpoint, data, headers, true)
	}

	put<T>(
		endpoint: string,
		data: unknown,
		headers: Record<string, string> = {}
	): Promise<ReturnData<T> | ActionFailure> {
		return this.#request<T>('PUT', endpoint, data, headers, false)
	}

	putRaw<T>(
		endpoint: string,
		data: unknown,
		headers: Record<string, string> = {}
	): Promise<ReturnData<T>> {
		return this.#request<T>('PUT', endpoint, data, headers, true)
	}

	delete<T>(
		endpoint: string,
		data?: unknown,
		headers: Record<string, string> = {}
	): Promise<ReturnData<T> | ActionFailure> {
		return this.#request<T>('DELETE', endpoint, data, headers, false)
	}

	deleteRaw<T>(
		endpoint: string,
		data?: unknown,
		headers: Record<string, string> = {}
	): Promise<ReturnData<T>> {
		return this.#request<T>('DELETE', endpoint, data, headers, true)
	}
}
