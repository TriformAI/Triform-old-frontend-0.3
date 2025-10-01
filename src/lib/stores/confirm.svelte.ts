interface Props {
	title: string
	message: string
	btnLabel?: string
	danger?: boolean
}

class Confirm {
	active = $state(false)
	#title = $state('')
	#message = $state('')
	#btnLabel = $state('')
	#danger = $state(false)
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
	
	get danger() {
		return this.#danger
	}

	async show({ title, message, btnLabel = 'Confirm', danger = false }: Props) {
		this.active = true
		this.#title = title
		this.#message = message
		this.#btnLabel = btnLabel
		this.#danger = danger

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
			this.#danger = false
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
