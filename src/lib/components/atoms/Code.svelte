<script lang="ts">
	const {
		code
	}: {
		code: string
	} = $props()
</script>

<pre
	class="border-main-700 bg-main-900 text-main-200 overflow-x-auto rounded-md border p-4 font-mono">{code}</pre>
