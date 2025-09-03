interface Props {
	title: string
	message: string
	btnLabel?: string
}

class Confirm {
	active = $state(false)
	#title = $state('')
	#message = $state('')
	#btnLabel = $state('')
	#resolver: ((value: boolean) => void) | undefined = undefined

	constructor() {}

	get title() {
		return this.#title
	}

	get message() {
		return this.#message
	}

	get btnLabel() {
		return this.#btnLabel
	}

	async show({ title, message, btnLabel = 'Confirm' }: Props) {
		this.active = true
		this.#title = title
		this.#message = message
		this.#btnLabel = btnLabel

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
			this.#btnLabel = ''
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
