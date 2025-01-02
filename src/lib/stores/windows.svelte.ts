import type { Component } from 'svelte'

export interface Window {
  // Some id that's unique to the window
  id: string,
  // The actual component instance that'll be rendered
  component: Component,
  // You can have multiple windows open of the same type
  // (eg multiple code editors but with different files)
  // so we'll need to store the actual contents of the window
  // (ie the props that'll be passed to the component)
  // though this is really dependent on the type of window
  // so we probably don't want to type it here
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  customProps?: any,
  // relative in % from the top & left edges
  posX: number,
  posY: number,
  width: number,
  height: number,
  // windows can overlap & stack
  zIndex: number
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
    posX: window.posX ?? 10,
    posY: window.posY ?? 20,
  })
}

export const closeWindowById = (id: string) => {
  openWindowsState = openWindowsState.filter(window => window.id !== id)
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
      zIndex: window.zIndex > openWindowsState.find(w => w.id === id)!.zIndex 
        ? window.zIndex - 1 
        : window.zIndex
    }
  })
}