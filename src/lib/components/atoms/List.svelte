<script lang="ts">
	import type { Snippet } from 'svelte'

	const {
		children
	}: {
		children: Snippet
	} = $props()
</script>

<div
	class="
		divide-main-700 bg-main-800 text-main-100 [&>ul>li:hover]:bg-main-700 w-56 divide-y rounded p-1 text-sm shadow
		focus:outline-none [&>ul]:z-50
		[&>ul]:my-2 [&>ul>li]:flex [&>ul>li]:items-center [&>ul>li]:gap-4 [&>ul>li]:px-5
		[&>ul>li]:py-3 [&>ul>li]:transition-colors [&>ul>li]:duration-200
		[&>ul>li]:ease-in-out [&>ul>li:hover]:font-medium
		[&>ul>li>button]:w-full [&>ul>li>button]:text-left
	"
>
	<!-- Render the body snippet -->
	{@render children()}
</div>
