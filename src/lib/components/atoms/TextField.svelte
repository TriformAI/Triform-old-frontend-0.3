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
	<span class="mb-2 block text-sm font-medium">{label}</span>

	<textarea
		style={`min-height:${rows}lh;tab-size: 2;`}
		{id}
		{placeholder}
		{rows}
		bind:value
		class={[
			'bg-zinc-850 w-full rounded-md border border-zinc-800 px-3 py-3 text-slate-200 transition outline-none',
			useMonoFont && 'font-mono'
		]}
	></textarea>
</label>
