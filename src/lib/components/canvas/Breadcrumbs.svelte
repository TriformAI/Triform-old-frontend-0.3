<script lang="ts">
	import { breadcrumbs } from '$lib/stores/canvas.svelte'
	import { page } from '$app/state'
	import { fly } from 'svelte/transition'
	import IconProject from '~icons/mdi/shape'
	import { nodeTypesDict, nodeTypes } from '$lib/constants/nodeTypes'
	import ChevronRight from '~icons/mdi/chevron-right'

	const projectUrl = $derived(`/project/${page.data.project?.id}`)

	const crumbs = $derived(breadcrumbs())
	$inspect(crumbs)
</script>

{#if crumbs}
	<ul class="flex gap-2.5 font-medium">
		{#each crumbs as { path, name, type }, idx (path)}
			{@const nodeType =
				type === 'project'
					? { icon: IconProject, iconClasses: '' }
					: type
						? nodeTypesDict[type]
						: undefined}

			<li class="inline-flex items-center gap-1.5" in:fly={{ duration: 300, opacity: 0, x: -5 }}>
				{#if nodeType}
					<nodeType.icon class={['size-4', nodeType.iconClasses]} />
				{/if}

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
			</li>
			<li class="flex items-center">
				{#if idx < crumbs.length - 1}
					<span class="text-main-600 transition starting:opacity-0">
						<ChevronRight />
					</span>
				{/if}
			</li>
		{/each}
	</ul>
{/if}
