import { toast } from 'svelte-sonner'

export interface FormHandlerOptions<T> {
	onSubmit: (data: T) => Promise<{ success: boolean; [key: string]: any }>

	// Messages for toasts
	successMessage?: string
	errorMessage?: string

	// Optional callbacks
	onSuccess?: (result: any) => void
	onError?: (result: any) => void
}

export function createFormHandler<T>(options: FormHandlerOptions<T>) {
	let isLoading = $state(false)
	let lastResult = $state<any>(null)

	async function handleSubmit(e: Event, formData: T) {
		e.preventDefault()
		isLoading = true
		lastResult = null

		try {
			const result = await options.onSubmit(formData)
			lastResult = result

			if (result.success) {
				if (options.successMessage) {
					toast.success(options.successMessage)
				}
				options.onSuccess?.(result)
			} else {
				if (options.errorMessage) {
					toast.error(options.errorMessage)
				}
				options.onError?.(result)
			}
		} catch (error) {
			console.error('Form submission error:', error)
			if (options.errorMessage) {
				toast.error(options.errorMessage)
			}
			options.onError?.(error)
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
		handleSubmit
	}
}
