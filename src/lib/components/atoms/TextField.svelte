<script lang="ts">
	let {
		value = $bindable(),
		label,
		placeholder,
    rows = 4
	}: {
		value?: string
		label: string
		placeholder?: string
		type?: string
    rows?: number
	} = $props()

	const id = Math.random().toString(36).substring(2, 15)
</script>

<div>
	<label for={id} class="mb-2 text-sm font-semibold">{label}</label>
  <textarea
    {id}
    {placeholder}
    {rows}
    bind:value
    class="w-full rounded-md border border-zinc-700 bg-transparent px-5 py-3 text-slate-200 transition outline-none hover:border-zinc-600 focus:border-zinc-500"
  ></textarea>
</div>
