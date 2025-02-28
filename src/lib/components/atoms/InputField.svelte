<script lang="ts">
	import type { FullAutoFill } from 'svelte/elements'

	let {
		value = $bindable(),
		label,
		name,
		placeholder,
		variation = 'default',
		type = 'text',
		autocomplete = 'off',
		required,
		class: classProp,
		containerClass,
		onblur,
		onkeydown,
		use = () => {}
	}: {
		value?: string
		label?: string
		name?: string
		placeholder?: string
		variation?: 'default' | 'tight'
		type?: string
		autocomplete?: FullAutoFill
		required?: boolean
		class?: string
		containerClass?: string
		onblur?: (e: FocusEvent) => void
		onkeydown?: (e: KeyboardEvent) => void
		use?: (el: HTMLInputElement) => void
	} = $props()

	const id = Math.random().toString(36).substring(2, 15)
</script>

<div class={containerClass}>
	{#if label}
		<label for={id} class="text-sm font-medium">{label}</label>
	{/if}
	<input
		{name}
		{id}
		{type}
		{placeholder}
		{autocomplete}
		{required}
		bind:value
		class={[
			'border-main-700 text-main-200 hover:border-main-600 focus:border-main-500 rounded-md border bg-transparent',
			'w-full transition outline-none',
			label && 'mt-2',
			variation === 'default' && 'px-5 py-3',
			variation === 'tight' && 'px-2 py-1',
			classProp
		]}
		{onblur}
		{onkeydown}
		use:use
	/>
</div>
