import { browser } from '$app/environment'
import { error, fail, type ActionFailure, type RequestEvent } from '@sveltejs/kit'
import { stream as eventStream } from 'fetch-event-stream'
import { apiStatus } from '$lib/stores/apiStatus.svelte'
import { getSocketId } from './stores/socket.svelte'

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

type ReturnDataWithHeaders<T> = T & {
	success: boolean
	headers: Headers
}

type ReturnData<T> = T & {
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
		if (method !== 'GET') {
			apiStatus.saving = true
		}

		const socketId = getSocketId()
		if (socketId && !('x-socket-id' in headers)) headers['x-socket-id'] = socketId

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
				if (method !== 'GET') {
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
			return { ...({} as T), success: false }
		} finally {
			setTimeout(() => (apiStatus.saving = false), 300)
		}
	}

	// --- Public Methods ---
	// Overloads for GET method
	get<T>(
		endpoint: string,
		headers: Record<string, string>,
		returnHeaders: true
	): Promise<ReturnDataWithHeaders<T>>

	get<T>(
		endpoint: string,
		headers?: Record<string, string>,
		returnHeaders?: false
	): Promise<ReturnData<T>>

	get<T>(
		endpoint: string,
		headers: Record<string, string> = {},
		returnHeaders: boolean = false
	): Promise<ReturnData<T> | ReturnDataWithHeaders<T>> {
		if (returnHeaders) {
			return this.#request<T>('GET', endpoint, undefined, headers, true)
		}
		return this.#request<T>('GET', endpoint, undefined, headers, false)
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

	async *socketStream<T>(
		endpoint: string,
		data?: unknown,
		_headers: Record<string, string> = {},
		signal?: AbortSignal
	): AsyncGenerator<StreamEvent<T>, void, unknown> {
		const wsUrl = `${this.#baseURL.replace(/^http/, 'ws')}/${endpoint}`
		
		const ws = new WebSocket(wsUrl)
		const messageQueue: StreamEvent<T>[] = []
		let isConnected = false
		let error: Error | null = null
		let isComplete = false

		// Setup WebSocket event handlers
		const onOpen = () => {
			isConnected = true
			
			// Send initial data if provided
			if (data) ws.send(JSON.stringify(data))
		}

		const onMessage = (event: MessageEvent) => {
			try {
				const parsed = JSON.parse(event.data)
				messageQueue.push({
					data: parsed.data as T,
					event: parsed.event
				})
			} catch (err) {
				console.error('Failed to parse WebSocket message:', err)
			}
		}

		const onError = (_event: Event) => {
			error = new Error('WebSocket error')
			isComplete = true
		}

		const onClose = () => isComplete = true

		// Setup abort signal handling
		const abortHandler = () => {
			ws.close()
			isComplete = true
		}

		signal?.addEventListener('abort', abortHandler)

		ws.addEventListener('message', onMessage)
		ws.addEventListener('open', onOpen)
		ws.addEventListener('error', onError)
		ws.addEventListener('close', onClose)

		try {
			// Wait for connection
			while (!isConnected && !error && !isComplete)
				await new Promise(resolve => setTimeout(resolve, 50))

			if (error) throw error

			// Yield messages as they arrive
			while (!isComplete) {
				if (messageQueue.length > 0)
					yield messageQueue.shift()!
				else
					await new Promise(resolve => setTimeout(resolve, 10))
			}

			// Yield any remaining messages
			while (messageQueue.length > 0)
				yield messageQueue.shift()!
		} finally {
			// Cleanup
			signal?.removeEventListener('abort', abortHandler)
			
			if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING)
				ws.close()
		}
	}
}
