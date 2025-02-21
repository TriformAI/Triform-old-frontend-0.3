interface Props {
	title: string
	message: string
}

class Confirm {
	active = $state(false)
	#title = $state('')
	#message = $state('')
	#resolver: ((value: boolean) => void) | undefined = undefined

	constructor() {}

	get title() {
		return this.#title
	}

	get message() {
		return this.#message
	}

	async show({ title, message }: Props) {
		this.active = true
		this.#title = title
		this.#message = message

		return new Promise<boolean>(resolve => {
			this.#resolver = resolve
		})
	}

	#reset() {
		this.active = false
		// Use a timeout to reset the title and message
		// This will allow the modal to close without text disappearing
		setTimeout(() => {
			this.#title = ''
			this.#message = ''
		}, 300)
	}

	cancel() {
		if (this.#resolver) {
			this.#resolver(false)
			this.#reset()
		}
	}

	confirm() {
		if (this.#resolver) {
			this.#resolver(true)
			this.#reset()
		}
	}
}

export const confirmStore = new Confirm()
