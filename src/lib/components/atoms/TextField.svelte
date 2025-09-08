<script lang="ts">
	interface Props {
		name?: string
		value?: string
		label: string
		placeholder?: string
		class?: string
		type?: string
		rows?: number
		required?: boolean
		readonly?: boolean
		useMonoFont?: boolean
		oninput?: (e: Event) => void
		id?: string
	}

	let {
		name,
		value = $bindable(),
		label,
		placeholder,
		class: classes,
		rows = 4,
		useMonoFont = false,
		required,
		readonly,
		oninput,
		id: customId
	}: Props = $props()

	const id = customId ?? Math.random().toString(36).substring(2, 15)
</script>

<label class={['grid gap-1', classes]}>
	<span class="input-title">{label}</span>

	<textarea
		{name}
		style={`min-height:${rows}lh;tab-size: 2;`}
		{id}
		{placeholder}
		{rows}
		{required}
		{readonly}
		bind:value
		{oninput}
		class={['input-text', useMonoFont && 'font-mono']}
	></textarea>
</label>
