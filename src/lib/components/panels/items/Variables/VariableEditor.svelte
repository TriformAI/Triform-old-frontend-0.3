<script lang="ts">
	import InputField from '$lib/components/atoms/InputField.svelte'

	let {
		key = $bindable(),
		value = $bindable(),
		onEnter
	}: {
		key: string
		value: string
		onEnter?: () => void
	} = $props()

	let valueEl = $state<HTMLInputElement>()
</script>

<div class="contents [&>*]:transition-all [&>*]:starting:opacity-0">
	<InputField
		bind:value={() => key, value => (key = value.toUpperCase().replace(/\s/g, '_'))}
		placeholder="key"
		class="font-mono"
		onkeydown={e => {
			if (e.key !== '=') return
			e.preventDefault()
			valueEl?.focus()
		}}
	/>
	<span class="text-main-400">=</span>
	<InputField
		bind:value
		placeholder="value"
		class="font-mono"
		onkeydown={e => e.key === 'Enter' && onEnter?.()}
		bind:el={valueEl}
	/>
</div>
