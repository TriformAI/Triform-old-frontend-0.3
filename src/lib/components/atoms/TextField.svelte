<script lang="ts">
	let {
		value = $bindable(),
		label,
		placeholder,
		class: classes,
		rows = 4,
		useMonoFont = false
	}: {
		value?: string
		label: string
		placeholder?: string
		class?: string
		type?: string
		rows?: number
		useMonoFont?: boolean
	} = $props()

	const id = Math.random().toString(36).substring(2, 15)
</script>

<label class={['grid grid-rows-[auto_1fr]', classes]}>
	<span class="mb-1 block text-xs font-bold tracking-wide uppercase opacity-65">{label}</span>

	<textarea
		style={`min-height:${rows}lh;tab-size: 2;`}
		{id}
		{placeholder}
		{rows}
		bind:value
		class={[
			'bg-main-850 border-main-800 text-main-200 w-full rounded-md border px-3 py-3 transition outline-none',
			useMonoFont && 'font-mono'
		]}
	></textarea>
</label>
