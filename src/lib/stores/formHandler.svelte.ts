import { toast } from 'svelte-sonner'

type SuccessResult<T = unknown> = {
	success: true
	data: T
}

type FailureResult = {
	success: false
	issues: { message: string }[]
}

type FormResult<T = unknown> = SuccessResult<T> | FailureResult

export interface FormHandlerOptions<T, R = unknown> {
	onSubmit: (data: T) => Promise<{ success: boolean; data?: R; [key: string]: any }>

	// Messages for toasts
	successMessage?: string
	errorMessage?: string

	// Optional callbacks
	onSuccess?: (result: SuccessResult<R>) => void
	onError?: (result: FailureResult) => void
}

export function createFormHandler<T, R = unknown>(options: FormHandlerOptions<T, R>) {
	let isLoading = $state(false)
	let lastResult = $state<FormResult<R> | null>(null)

	async function handleSubmit(e: Event, formData: T) {
		e.preventDefault()
		isLoading = true
		lastResult = null

		try {
			const result = await options.onSubmit(formData)

			// Convert API result to discriminated union
			if (result.success) {
				const successResult: SuccessResult<R> = {
					success: true as const,
					data: result.data!
				}

				lastResult = successResult

				if (options.successMessage) {
					toast.success(options.successMessage)
				}

				options.onSuccess?.(successResult)
			} else {
				const failureResult: FailureResult = {
					success: false as const,
					issues: result.issues || [{ message: 'Operation failed' }]
				}
				lastResult = failureResult

				if (options.errorMessage) {
					toast.error(options.errorMessage)
				}
				options.onError?.(failureResult)
			}
		} catch (error) {
			console.error('Form submission error:', error)
			if (options.errorMessage) {
				toast.error(options.errorMessage)
			}
			const failureResult: FailureResult = {
				success: false as const,
				issues: [{ message: error instanceof Error ? error.message : 'Unknown error' }]
			}
			lastResult = failureResult
			options.onError?.(failureResult)
		} finally {
			isLoading = false
		}
	}

	return {
		get isLoading() {
			return isLoading
		},
		get lastResult() {
			return lastResult
		},
		get data() {
			return lastResult?.success === true ? lastResult.data : null
		},
		get errors() {
			return lastResult?.success === false ? lastResult.issues.map(issue => issue.message) : null
		},
		handleSubmit
	}
}
