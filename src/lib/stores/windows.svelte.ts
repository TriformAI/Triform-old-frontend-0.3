import type { Component } from 'svelte'

import { SvelteMap } from 'svelte/reactivity'

import Execution from '../components/panels/items/Execute.svelte'

export interface Window {
	// Some id that's unique to the window
	id: string
	// The actual component instance that'll be rendered
	component: Component
	// You can have multiple windows open of the same type
	// (eg multiple code editors but with different files)
	// so we'll need to store the actual contents of the window
	// (ie the props that'll be passed to the component)
	// though this is really dependent on the type of window
	// so we probably don't want to type it here
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	customProps?: any
	// relative in % from the top & left edges
	posX: number
	posY: number
	width?: number
	height?: number
	isClosing?: boolean
	// windows can overlap & stack
	zIndex: number
}

// @hmr:keep
export const openWindows = $state<Map<Window['id'], Window>>(new SvelteMap())

export const openWindow = (window: Window) => {
	// Some windows should only have one instance, and for those
	// we just select a specific id to ensure that only one instance
	// exists at once
	if (openWindows.has(window.id)) return
	openWindows.set(window.id, {
		...window,
		zIndex: openWindows.size + 1,
		posX: window.posX,
		posY: window.posY
	})
	// saveWindowsToLocalStorage()
}

export const closeWindowById = (id: string) => {
	updateWindowById(id, { isClosing: true })
	setTimeout(() => {
		openWindows.delete(id)
	}, 250)
	// saveWindowsToLocalStorage()
}

export const unloadWindows = () => {
	openWindows.clear()
}

export const updateWindowById = (id: string, update: Partial<Window>) => {
	if (!openWindows.has(id)) return
	openWindows.set(id, {
		...openWindows.get(id)!,
		...update
	})
	// saveWindowsToLocalStorage()
}

export const windowIsOpen = (id: string) => {
	const window = openWindows.get(id)
	return !!window && !window.isClosing
}

// TODO: Add all components that need to be saved to local storage here.
// They need to be mapped to strings so that they can be saved and recreated
// from local storage.
const stringToComponentMap = (): { str: string; cmp: Component }[] => [
	{ str: 'Execution', cmp: Execution }
]

const mapStringToComponent = (str: string): Component | undefined => {
	return stringToComponentMap().find(pair => pair.str === str)?.cmp
}
// const mapComponentToString = (cmp: Component): string | undefined => {
// 	return stringToComponentMap().find(pair => pair.cmp === cmp)?.str
// }

type StoredWindow = Omit<Window, 'component'> & { component: string }
const LOCAL_STORAGE_KEY = 'open-windows-state'

// const saveWindowsToLocalStorage = () => {
// 	const mappedState = openWindows.map((w: Window) => {
// 		const componentLocalStorageId = mapComponentToString(w.component)
// 		if (componentLocalStorageId === undefined) {
// 			throw new Error(
// 				`Unable to store component with name ${w.component.name} because it isnt mapped to a local storage id`
// 			)
// 		}
// 		return {
// 			...w,
// 			component: componentLocalStorageId
// 		}
// 	})
// 	localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(mappedState))
// }

export const loadWindowsFromLocalStorage = () => {
	const windowsState: Record<string, StoredWindow> = JSON.parse(
		localStorage.getItem(LOCAL_STORAGE_KEY) ?? '{}'
	)

	openWindows.clear()
	for (const [id, window] of Object.entries(windowsState)) {
		const component = mapStringToComponent(window.component)
		if (typeof component === 'undefined') {
			throw new Error(
				`Unable to load window from local storage. Couldnt map component id "${window.component}" to a component.`
			)
		}
		openWindows.set(id, {
			...window,
			component: component
		})
	}
}

const loadFromLocalStorageUpdateEvent = (event: StorageEvent) => {
	if (event.storageArea === localStorage && event.key === LOCAL_STORAGE_KEY) {
		// loadWindowsFromLocalStorage()
	}
}

export const createLocalStorageListener = () => {
	window.addEventListener('storage', loadFromLocalStorageUpdateEvent)
}

export const removeLocalStorageListener = () => {
	window.removeEventListener('storage', loadFromLocalStorageUpdateEvent)
}

export const clearLocalStorage = () => {
	localStorage.removeItem(LOCAL_STORAGE_KEY)
}

export const bringWindowToFront = (id: string) => {
	if (!openWindows.has(id)) return
	// Recalculate all z-indexes so the window is on top
	openWindows.set(id, {
		...openWindows.get(id)!,
		zIndex: openWindows.size + 1
	})
	const zOrder = [...openWindows.entries()].sort((a, b) => a[1].zIndex - b[1].zIndex).map(e => e[0])
	for (const [windowId, window] of openWindows) {
		if (windowId === id) continue
		openWindows.set(windowId, {
			...window,
			zIndex: zOrder.indexOf(windowId) + 1
		})
	}
}
