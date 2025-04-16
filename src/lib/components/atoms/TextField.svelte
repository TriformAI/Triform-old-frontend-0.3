<script lang="ts">
	interface Props {
		name: string
		value?: string
		label: string
		placeholder?: string
		class?: string
		type?: string
		rows?: number
		required?: boolean
		useMonoFont?: boolean
	}

	let {
		name,
		value = $bindable(),
		label,
		placeholder,
		class: classes,
		rows = 4,
		useMonoFont = false,
		required
	}: Props = $props()

	const id = Math.random().toString(36).substring(2, 15)
</script>

<label class={['grid gap-1', classes]}>
	<span class="text-sm font-medium">{label}</span>

	<textarea
		{name}
		style={`min-height:${rows}lh;tab-size: 2;`}
		{id}
		{placeholder}
		{rows}
		{required}
		bind:value
		class={[
			'border-main-700 bg-main-800 text-main-200 hover:border-main-600 focus:border-main-600 rounded-md border px-3 py-2 text-sm outline-none',
			useMonoFont && 'font-mono'
		]}
	></textarea>
</label>
