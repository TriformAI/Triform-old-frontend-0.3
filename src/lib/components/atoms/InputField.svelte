<script lang="ts">
	let {
		value = $bindable(),
		label,
		name,
		placeholder,
		type = 'text'
	}: {
		value?: string
		label: string
		name?: string
		placeholder?: string
		type?: string
	} = $props()

	const id = Math.random().toString(36).substring(2, 15)
</script>

<div>
	<label for={id} class="text-sm font-medium">{label}</label>
	<input
		{name}
		{id}
		{type}
		{placeholder}
		bind:value
		class="mt-2 w-full rounded-md border border-zinc-700 bg-transparent px-5 py-3 text-zinc-200 transition outline-none hover:border-zinc-600 focus:border-zinc-500"
	/>
</div>
