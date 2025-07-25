<script lang="ts">
	import type { Variable } from '$lib/types/resources'
	import { page } from '$app/state'
	import { confirmStore } from '$lib/stores/confirm.svelte'
	import IconDetach from '~icons/mdi/link-variant-off'
	import IconExpand from '~icons/material-symbols/expand-all-rounded'
	import IconCollapse from '~icons/material-symbols/collapse-all-rounded'
	import { toast } from 'svelte-sonner'
	import { invalidate } from '$app/navigation'
	import { API } from '$lib/api'
	import { getNodePath } from '$lib/stores/canvas.svelte'
	import { Collapsible } from 'bits-ui'

	let { variable, onEdit }: { variable: Variable; onEdit: () => void } = $props()

	let isDetaching = $state(false)
	let isExpanded = $state(false)

	const projectId = page.data.project?.id
	const nodePath = getNodePath()

	async function handleDetach() {
		const confirmed = await confirmStore.show({
			title: 'Are you sure?',
			message: 'This will detach the variable from the node immediately'
		})

		if (!confirmed) return

		const api = new API()
		isDetaching = true

		try {
			await api.delete(`projects/${projectId}/variable/${variable.id}?nodePath=${nodePath}`)
			toast.success('Variable detached')
			invalidate('project')
		} catch (error) {
			toast.error('Failed to detach variable')
		} finally {
			isDetaching = false
		}
	}
</script>

<Collapsible.Root bind:open={isExpanded}>
	<li
		class={[
			'group animate-fade-in flex flex-row items-start justify-between gap-3 py-1.5 text-sm',
			isDetaching && 'animate-pulse'
		]}
	>
		<div class="grid grid-cols-[auto_auto_auto] items-center gap-2">
			<span
				class={[
					'text-main-300 w-fit max-w-full truncate font-mono',
					'bg-main-800 rounded-md px-2 py-1',
					'border-main-700 border'
				]}
			>
				{variable.spec.key}
			</span>
			<span class="text-main-300 font-medium"> = </span>
			<span
				class={[
					'text-main-300 w-fit max-w-full truncate font-mono',
					'bg-main-800 rounded-md px-2 py-1',
					'border-main-700 border'
				]}
			>
				{variable.spec.value.dev}
			</span>

			<Collapsible.Content class="contents">
				{#each Object.entries(variable.spec.value)
					.filter(([key]) => key !== 'dev')
					.sort(([a], [b]) => b.localeCompare(a)) as [key, value]}
					<span class="text-main-300 text-right capitalize">
						{key}
					</span>
					<div></div>
					<span
						class={[
							'text-main-300 w-fit max-w-full truncate font-mono',
							'bg-main-800 rounded-md px-2 py-1',
							'border-main-700 border'
						]}
					>
						{value}
					</span>
				{/each}
			</Collapsible.Content>
		</div>

		<div
			class={[
				'pointer-events-none ms-auto flex transform items-center gap-2 opacity-0 *:transition',
				'group-hover:pointer-events-auto group-hover:opacity-100',
				'*:hover:text-main-200 text-main-500 *:active:scale-95',
				'*:disabled:cursor-wait *:disabled:opacity-50'
			]}
		>
			<Collapsible.Trigger>
				<button type="button" title="Collapse">
					{#if !isExpanded}
						<IconExpand class={'size-5'} />
					{:else}
						<IconCollapse class={'size-5'} />
					{/if}
				</button>
			</Collapsible.Trigger>
			<button type="button" title="Detach" onclick={handleDetach} disabled={isDetaching}>
				<IconDetach class={'size-5'} />
			</button>
		</div>
	</li>
</Collapsible.Root>
