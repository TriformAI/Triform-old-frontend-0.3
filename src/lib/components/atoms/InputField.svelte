<script lang="ts">
	import type { FullAutoFill } from 'svelte/elements'

	let {
		value = $bindable(),
		el = $bindable(),
		label,
		name,
		placeholder,
		prefix,
		variation = 'default',
		type = 'text',
		autocomplete = 'off',
		autofocus = false,
		required,
		readonly,
		class: classProp,
		containerClass,
		hideLabel = false,
		onblur,
		onkeydown,
		oninput,
		onpaste,
		use = () => {},
		validationFn = () => true,
		id: customId,
		pattern
	}: {
		value?: string
		el?: HTMLInputElement
		label?: string
		name?: string
		placeholder?: string
		prefix?: string
		variation?: 'default' | 'tight'
		type?: string
		autocomplete?: FullAutoFill
		autofocus?: boolean
		required?: boolean
		readonly?: boolean
		class?: string
		containerClass?: string
		hideLabel?: boolean
		onblur?: (e: FocusEvent) => void
		onkeydown?: (e: KeyboardEvent) => void
		oninput?: (e: Event) => void
		onpaste?: (e: ClipboardEvent) => void
		use?: (el: HTMLInputElement) => void
		validationFn?: (value: string) => boolean | string | undefined
		id?: string
		pattern?: string
	} = $props()

	const id = customId ?? Math.random().toString(36).substring(2, 15)

	const validation = $derived.by(() => {
		const res = validationFn(value ?? '')
		if (typeof res === 'boolean') return { success: res, error: undefined }
		return { success: !res, error: res }
	})

	function focus(el: HTMLInputElement) {
		if (autofocus) {
			el.focus()
		}
	}
</script>

<div class={['grid gap-1', containerClass]}>
	{#if label}
		<label data-label for={id} class={['input-title', hideLabel && 'sr-only']}>{label}</label>
	{/if}

	<div class="group flex flex-row-reverse items-center">
		<input
			{name}
			{id}
			{type}
			{placeholder}
			{autocomplete}
			{required}
			{readonly}
			disabled={readonly}
			bind:this={el}
			bind:value
			use:focus
			class={[
				'input-text peer',
				'disabled:text-main-400',
				prefix && 'rounded-l-none border-l-0',
				variation === 'default' && 'px-3 py-2',
				variation === 'tight' && 'px-2 py-1',
				!validation.success &&
					'border-danger-400/60 bg-danger-400/5 not-disabled:focus:border-danger-400/80 not-disabled:focus:bg-danger-400/10',
				classProp
			]}
			{onblur}
			{onkeydown}
			{oninput}
			{onpaste}
			{pattern}
			use:use
		/>
		{#if prefix}
			<span
				class={[
					'text-main-300 input-text mr-0 inline-block h-full w-fit whitespace-nowrap',
					'bg-main-850 rounded-r-none',
					'peer-focus:border-main-600',
					variation === 'default' && 'px-3 py-2',
					variation === 'tight' && 'px-2 py-1'
				]}>{prefix}</span
			>
		{/if}
	</div>
	{#if validation.error}
		<p class="text-danger-400 text-sm">{validation.error}</p>
	{/if}
</div>
