let headerAreaRefState: HTMLElement | null = $state(null)
let mainAreaRefState: HTMLElement | null = $state(null)
let footerAreaRefState: HTMLElement | null = $state(null)

export const headerAreaRef = () => headerAreaRefState
export const mainAreaRef = () => mainAreaRefState
export const footerAreaRef = () => footerAreaRefState

export const setHeaderAreaRef = (ref: HTMLElement) => {
	headerAreaRefState = ref
}

export const setMainAreaRef = (ref: HTMLElement) => {
	mainAreaRefState = ref
}

export const setFooterAreaRef = (ref: HTMLElement) => {
	footerAreaRefState = ref
}
