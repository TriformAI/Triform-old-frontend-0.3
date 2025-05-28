import type { Component } from '$lib/types/agent'

export const components = $state<Component['meta'][]>([])

export const loadComponents = (comps: Component['meta'][]) => {
	components.length = 0
	components.push(...comps)
	console.log(components)
}
