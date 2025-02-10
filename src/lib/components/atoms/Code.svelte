<script lang="ts">
	const {
		code
	}: {
		code: string
	} = $props()
</script>

<pre
	class="overflow-x-auto rounded-md border border-zinc-700 bg-zinc-900 p-4 font-mono text-zinc-200">{code}</pre>
