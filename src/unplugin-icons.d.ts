// Type declarations for unplugin-icons virtual modules
declare module '~icons/*' {
	import { SvelteComponent } from 'svelte'
	export default class extends SvelteComponent<{
		class?: string
		width?: string | number
		height?: string | number
	}> {}
}

