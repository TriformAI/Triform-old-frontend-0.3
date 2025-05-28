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
		oninput?: (e: Event) => void
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
		oninput
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
		{oninput}
		class={['input-text', useMonoFont && 'font-mono']}
	></textarea>
</label>
