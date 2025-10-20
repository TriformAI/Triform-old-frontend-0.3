<script lang="ts">
	import { breadcrumbs } from '$lib/stores/canvas.svelte'
	import { page } from '$app/state'
	import { fly } from 'svelte/transition'
	import IconProject from '~icons/material-symbols/folder-open-rounded'
	import { nodeTypesDict, nodeTypes } from '$lib/constants/nodeTypes'
	import ChevronRight from '~icons/mdi/chevron-right'
	import ChevronDown from '~icons/mdi/chevron-down'
	import Dropdown from '$lib/components/atoms/Dropdown.svelte'

	const projectUrl = $derived(`/project/${page.data.project?.id}`)

	const crumbs = $derived(breadcrumbs())
	const currentCrumb = $derived(crumbs?.[crumbs.length - 1])
	const previousCrumbs = $derived(crumbs?.slice(0, -1) ?? [])
</script>

{#if crumbs}
	<!-- Desktop: Full breadcrumbs -->
	<ul class="hidden items-center gap-2.5 font-medium md:flex">
		{#each crumbs as { path, name, type }, idx (path)}
			{@const nodeType = type ? nodeTypesDict[type] : undefined}

			<li class="group" in:fly={{ duration: 300, opacity: 0, x: -5 }}>
				<a
					href={path.startsWith('/') ? path : `${projectUrl}/${path}`}
					class="flex flex-row items-center gap-1.5"
				>
					{#if nodeType}
						<nodeType.icon
							class={[
								'size-4',
								nodeType.iconClasses,
								idx !== crumbs.length - 1 &&
									'opacity-80 saturate-0 transition group-hover:opacity-100 group-hover:saturate-100'
							].join(' ')}
						/>
					{/if}
					<span
						class={[
							idx !== crumbs.length - 1 && 'text-main-400 group-hover:text-main-300 transition'
						].join(' ')}
					>
						{name === 'Projects' ? 'Toolboxes' : name}
					</span>
				</a>
			</li>
			{#if idx < crumbs.length - 1}
				<li class="flex items-center">
					<span class="text-main-600 transition starting:opacity-0">
						<ChevronRight />
					</span>
				</li>
			{/if}
		{/each}
	</ul>

	<!-- Mobile: Dropdown with current page -->
	{#if currentCrumb}
		{@const nodeType = currentCrumb.type ? nodeTypesDict[currentCrumb.type] : undefined}
		<div class="flex min-w-0 md:hidden">
			{#if previousCrumbs.length > 0}
				<Dropdown class="max-w-3xs min-w-0 flex-1">
					{#snippet trigger()}
						<div class="flex min-w-0 items-center gap-1.5 font-medium">
							{#if nodeType}
								<nodeType.icon class={['size-4 shrink-0', nodeType.iconClasses].join(' ')} />
							{/if}
							<span class="min-w-0 truncate">{currentCrumb.name}</span>
							<ChevronDown class="text-main-400 size-4 shrink-0" />
						</div>
					{/snippet}

					{#snippet children()}
						<div class="flex flex-col">
							{#each previousCrumbs as { path, name, type }}
								{@const prevNodeType = type ? nodeTypesDict[type] : undefined}
								<a
									href={path.startsWith('/') ? path : `${projectUrl}/${path}`}
									class="hover:bg-main-900 flex items-center gap-2 px-3 py-2 text-sm transition"
								>
									{#if prevNodeType}
										<prevNodeType.icon class={['size-4', prevNodeType.iconClasses].join(' ')} />
									{/if}
									<span class="text-main-300">{name}</span>
								</a>
							{/each}
						</div>
					{/snippet}
				</Dropdown>
			{:else}
				<div class="flex min-w-0 items-center gap-1.5 font-medium">
					{#if nodeType}
						<nodeType.icon class={['size-4 shrink-0', nodeType.iconClasses].join(' ')} />
					{/if}
					<span class="min-w-0 truncate">{currentCrumb.name}</span>
				</div>
			{/if}
		</div>
	{/if}
{/if}
