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
		class="border-main-700 text-main-200 hover:border-main-600 focus:border-main-500 mt-2 w-full rounded-md border bg-transparent px-5 py-3 transition outline-none"
	/>
</div>
