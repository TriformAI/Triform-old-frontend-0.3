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
		required,
		readonly,
		class: classProp,
		containerClass,
		onblur,
		onkeydown,
		oninput,
		onpaste,
		use = () => {},
		validationFn = () => true
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
		required?: boolean
		readonly?: boolean
		class?: string
		containerClass?: string
		onblur?: (e: FocusEvent) => void
		onkeydown?: (e: KeyboardEvent) => void
		oninput?: (e: Event) => void
		onpaste?: (e: ClipboardEvent) => void
		use?: (el: HTMLInputElement) => void
		validationFn?: (value: string) => boolean | string | undefined
	} = $props()

	const id = Math.random().toString(36).substring(2, 15)

	const validation = $derived.by(() => {
		const res = validationFn(value ?? '')
		if (typeof res === 'boolean') return { success: res, error: undefined }
		return { success: !res, error: res }
	})
</script>

<div class={['grid gap-1', containerClass]}>
	{#if label}
		<label data-label for={id} class="text-sm font-medium">{label}</label>
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
