<script lang="ts">
	import type { Snippet } from 'svelte'

	const {
		body
	}: {
		body: Snippet
	} = $props()
</script>

<div
	class="w-56 divide-y divide-zinc-700 rounded-sm bg-[#252627] text-sm text-white shadow focus:outline-none
      [&>ul]:z-50 [&>ul]:my-2
      [&>ul>li]:my-2 [&>ul>li]:flex [&>ul>li]:items-center [&>ul>li]:gap-4 [&>ul>li]:p-3
      [&>ul>li]:transition-colors [&>ul>li]:duration-200 [&>ul>li]:ease-in-out
      [&>ul>li:hover]:bg-zinc-600 [&>ul>li>button]:w-full
      [&>ul>li>button]:text-left"
>
	<!-- Render the body snippet -->
	{@render body()}
</div>
