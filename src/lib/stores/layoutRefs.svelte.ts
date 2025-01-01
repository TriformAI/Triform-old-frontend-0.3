
let headerAreaRefState: HTMLDivElement | null = $state(null)
let mainAreaRefState: HTMLDivElement | null = $state(null)
let footerAreaRefState: HTMLDivElement | null = $state(null)

export const headerAreaRef = () => headerAreaRefState
export const mainAreaRef = () => mainAreaRefState
export const footerAreaRef = () => footerAreaRefState

export const setHeaderAreaRef = (ref: HTMLDivElement) => {
  headerAreaRefState = ref
}

export const setMainAreaRef = (ref: HTMLDivElement) => {
  mainAreaRefState = ref
}

export const setFooterAreaRef = (ref: HTMLDivElement) => {
  footerAreaRefState = ref
}


