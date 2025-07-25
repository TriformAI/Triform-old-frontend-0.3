<script lang="ts">
	import { breadcrumbs } from '$lib/stores/canvas.svelte'
	import { page } from '$app/state'
	import { fly } from 'svelte/transition'

	const projectUrl = $derived(`/project/${page.data.project?.id}`)

	const crumbs = $derived(breadcrumbs())
</script>

{#if crumbs}
	<ul class="flex gap-2 font-medium">
		{#each crumbs as { path, name }, idx (path)}
			<li in:fly={{ duration: 300, opacity: 0, x: -5 }}>
				{#if idx === crumbs.length - 1}
					<span>
						{name}
					</span>
				{:else}
					<a
						href={path.startsWith('/') ? path : `${projectUrl}/${path}`}
						class="text-main-400 hover:text-main-300 transition"
					>
						{name}
					</a>
				{/if}
				{#if idx < crumbs.length - 1}
					<span class="text-main-600 px-1 transition starting:opacity-0">›</span>
				{/if}
			</li>
		{/each}
	</ul>
{/if}
