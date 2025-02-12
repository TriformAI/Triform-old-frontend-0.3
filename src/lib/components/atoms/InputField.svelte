<script lang="ts">
	let {
		value = $bindable(),
		label,
		placeholder,
		type = 'text'
	}: {
		value?: string
		label: string
		placeholder?: string
		type?: string
	} = $props()

	const id = Math.random().toString(36).substring(2, 15)
</script>

<div>
	<label for={id} class="mb-2 text-sm font-medium">{label}</label>
	<input
		{id}
		{type}
		{placeholder}
		bind:value
		class="w-full rounded-md border border-zinc-700 bg-transparent px-5 py-3 text-zinc-200 transition outline-none hover:border-zinc-600 focus:border-zinc-500"
	/>
</div>
