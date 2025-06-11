import type { Component } from '$lib/types/agent'

export const components = $state<Component[]>([])

export const loadComponents = (comps: Component[]) => {
	components.length = 0
	components.push(...comps)
}
