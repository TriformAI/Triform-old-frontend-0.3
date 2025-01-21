<script lang="ts">
	import type { Snippet } from 'svelte'

	const {
		body
	}: {
		body: Snippet
	} = $props()
</script>

<div
	class="w-56 text-sm text-white bg-[#252627] divide-y divide-zinc-700 rounded-sm shadow focus:outline-none
      [&>ul]:my-2 [&>ul]:z-50
      [&>ul>li]:flex [&>ul>li]:items-center [&>ul>li]:p-3 [&>ul>li]:my-2 [&>ul>li]:gap-4
      [&>ul>li]:transition-colors [&>ul>li]:duration-200 [&>ul>li]:ease-in-out
      [&>ul>li>button]:w-full [&>ul>li>button]:text-left
      [&>ul>li:hover]:bg-zinc-600"
>
	<!-- Render the body snippet -->
	{@render body()}
</div>
