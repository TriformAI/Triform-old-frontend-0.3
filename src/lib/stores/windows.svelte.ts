import type { Component } from 'svelte'
import ComponentsToolbox from '../components/windows/ComponentsToolbox.svelte'
import Execution from '../components/windows/Execution.svelte'

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
	// windows can overlap & stack
	zIndex?: number
}

let openWindowsState = $state<Window[]>([])

export const openWindows = () => openWindowsState

export const openWindow = (window: Window) => {
	// Some windows should only have one instance, and for those
	// we just select a specific id to ensure that only one instance
	// exists at once
	if (openWindowsState.some(w => w.id === window.id)) return
	openWindowsState.push({
		...window,
		zIndex: openWindowsState.length + 1,
		posX: window.posX,
		posY: window.posY
	})
	saveWindowsToLocalStorage()
}

export const closeWindowById = (id: string) => {
	openWindowsState = openWindowsState.filter(window => window.id !== id)
	saveWindowsToLocalStorage()
}

export const updateWindowById = (id: string, update: Partial<Window>) => {
	openWindowsState = openWindowsState.map(window => {
		if (window.id === id) {
			return {
				...window,
				...update
			}
		}
		return window
	})
	saveWindowsToLocalStorage()
}

// TODO: Add all components that need to be saved to local storage here.
// They need to be mapped to strings so that they can be saved and recreated
// from local storage.
const stringToComponentMap: { str: string; cmp: Component }[] = [
	{ str: 'Execution', cmp: Execution },
	{ str: 'ConponentsToolbox', cmp: ComponentsToolbox }
]
const mapStringToComponent = (str: string): Component | undefined => {
	return stringToComponentMap.find(pair => pair.str === str)?.cmp
}
const mapComponentToString = (cmp: Component): string | undefined => {
	return stringToComponentMap.find(pair => pair.cmp === cmp)?.str
}

type StoredWindow = Omit<Window, 'component'> & { component: string }
const LOCAL_STORAGE_KEY = 'open-windows-state'
const saveWindowsToLocalStorage = () => {
	const mappedState = openWindowsState.map((w: Window) => {
		const componentLocalStorageId = mapComponentToString(w.component)
		if (componentLocalStorageId === undefined) {
			throw new Error(
				`Unable to store component with name ${w.component.name} because it isnt mapped to a local storage id`
			)
		}
		return {
			...w,
			component: componentLocalStorageId
		}
	})
	localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(mappedState))
}

export const loadWindowsFromLocalStorage = () => {
	const windowsState = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) ?? '[]')

	openWindowsState = [
		...windowsState.map((w: StoredWindow) => {
			const component = mapStringToComponent(w.component)
			if (typeof component === 'undefined') {
				throw new Error(
					`Unable to load window from local storage. Couldnt map component id "${w.component}" to a component.`
				)
			}
			return {
				...w,
				component: component
			}
		})
	]
}

const loadFromLocalStorageUpdateEvent = (event: StorageEvent) => {
	if (event.storageArea === localStorage && event.key === LOCAL_STORAGE_KEY) {
		loadWindowsFromLocalStorage()
	}
}

export const createLocalStorageListener = () => {
	window.addEventListener('storage', loadFromLocalStorageUpdateEvent)
}

export const removeLocalStorageListener = () => {
	window.removeEventListener('storage', loadFromLocalStorageUpdateEvent)
}

export const bringWindowToFront = (id: string) => {
	// Recalculate all z-indexes so the window is on top
	openWindowsState = openWindowsState.map((window: Window) => {
		if (window.id === id) {
			return {
				...window,
				zIndex: openWindowsState.length + 1
			}
		}
		return {
			...window,
			// Drop the z-index by 1 but make sure it doesn't change the current order
			zIndex:
				window.zIndex > openWindowsState.find(w => w.id === id)!.zIndex
					? window.zIndex - 1
					: window.zIndex
		}
	})
}

