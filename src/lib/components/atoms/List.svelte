<script lang="ts">
	import type { Snippet } from 'svelte'

	const {
		body
	}: {
		body: Snippet
	} = $props()
</script>

<div
	class="
		w-56 divide-y divide-zinc-700 rounded bg-zinc-800 p-1 text-sm text-zinc-100 shadow focus:outline-none
		[&>ul]:z-50 [&>ul]:my-2
		[&>ul>li]:flex [&>ul>li]:items-center [&>ul>li]:gap-4 [&>ul>li]:px-5 [&>ul>li]:py-3
		[&>ul>li]:transition-colors [&>ul>li]:duration-200 [&>ul>li]:ease-in-out
		[&>ul>li:hover]:bg-zinc-700 [&>ul>li:hover]:font-medium
		[&>ul>li>button]:w-full [&>ul>li>button]:text-left
	"
>
	<!-- Render the body snippet -->
	{@render body()}
</div>
