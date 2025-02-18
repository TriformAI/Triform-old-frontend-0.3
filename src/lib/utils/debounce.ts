export const debounce = (fn: () => void, delay: number) => {
	let timer: NodeJS.Timeout
	return () => {
		clearTimeout(timer)
		timer = setTimeout(() => fn(), delay)
	}
}
