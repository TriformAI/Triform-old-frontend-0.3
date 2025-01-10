<script lang="ts">
  const {
    code
  }: {
    code: string
  } = $props()
</script>

<pre
  class="p-4 rounded-md bg-zinc-900 border border-zinc-700 text-zinc-200 font-mono overflow-x-auto"
>{code}</pre>