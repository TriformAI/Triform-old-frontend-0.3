/** Dispatch event on click outside of node */
interface ClickOutsideOptions {
	eventType?: string
	handler?: () => void
}

export function clickOutside(node: HTMLElement, options: ClickOutsideOptions = {}) {
	const { eventType = 'click', handler } = options

	const handleClick = (event: Event) => {
		const target = event.target as HTMLElement
		if (node && !node.contains(target) && !event.defaultPrevented) {
			if (handler) {
				handler()
			} else {
				node.dispatchEvent(new CustomEvent('clickOutside', { detail: node }))
			}
		}
	}

	document.addEventListener(eventType, handleClick, true)

	return {
		destroy() {
			document.removeEventListener(eventType, handleClick, true)
		}
	}
}
