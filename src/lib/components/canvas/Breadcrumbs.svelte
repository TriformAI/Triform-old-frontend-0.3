<script lang="ts">
	import { getBreadcrumbs } from '$lib/stores/canvas.svelte'
	import { page } from '$app/state'
	import { fly } from 'svelte/transition'
	const projectUrl = $derived(`/project/${page.data.project?.meta.id}`)

	const breadcrumbs = $derived.by(() => {
		const project = page.data.project
		if (!project) {
			return undefined
		}

		const breadcrumbs = [
			{ name: 'Projects', id: '', path: '/project' },
			{ name: project.meta.name, id: project.meta.id, path: projectUrl }
		]

		const flowCrumbs = getBreadcrumbs()

		if (flowCrumbs) {
			breadcrumbs.push(...flowCrumbs)
		}

		return breadcrumbs
	})
</script>

{#if breadcrumbs}
	<ul class="flex gap-2 font-medium">
		{#each breadcrumbs as { path, name }, idx (path)}
			<li in:fly={{ duration: 300, opacity: 0, x: -5 }}>
				{#if idx === breadcrumbs.length - 1}
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
				{#if idx < breadcrumbs.length - 1}
					<span class="text-main-600 px-1 transition starting:opacity-0">›</span>
				{/if}
			</li>
		{/each}
	</ul>
{/if}
