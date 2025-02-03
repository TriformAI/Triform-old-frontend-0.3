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
	<label for={id} class="block mb-2 text-sm font-medium">{label}</label>
	<input
		{id}
		{type}
		{placeholder}
		bind:value
		class="w-full px-5 py-3 transition bg-transparent border rounded-md outline-none text-slate-200 border-zinc-700 hover:border-zinc-600 focus:border-zinc-500"
	/>
</div>
