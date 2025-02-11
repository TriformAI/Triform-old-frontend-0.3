import { writable } from 'svelte/store'

function writableWithLocalStorage<T>(key: string, initialValue: T) {
	if (typeof window === 'undefined') {
		// If not in the browser (SSR), fall back to initial value
		return writable(initialValue)
	}

	// Retrieve the stored value from localStorage (if available)
	const storedValue = localStorage.getItem(key)
	const value = storedValue ? JSON.parse(storedValue) : initialValue

	// Create a writable store
	const { subscribe, set, update } = writable(value)

	// Whenever the store value changes, update localStorage
	subscribe($value => {
		localStorage.setItem(key, JSON.stringify($value))
	})

	// Whenever localstorage changes update the value;
	window.addEventListener('storage', event => {
		if (event.storageArea === localStorage) {
			console.log('localStorage changed', event)
			set(JSON.parse(localStorage.getItem(key) ?? ''))
			// Handle the change, e.g., update your app's state
			// event.key is the key that was modified
			// event.newValue is the new value
			// event.oldValue is the previous value
			// event.url is the URL of the document that made the change
		}
	})
	return {
		subscribe,
		set,
		update
	}
}

if (typeof window !== 'undefined') {
	console.log('XXX adding stroage listener')
}

export default writableWithLocalStorage
