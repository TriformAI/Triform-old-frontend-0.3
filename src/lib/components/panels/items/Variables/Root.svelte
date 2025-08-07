<script lang="ts">
	import { page } from '$app/state'
	import VariableForm from '$lib/components/forms/Variable.svelte'
	import { invalidate } from '$app/navigation'
	import { API } from '$lib/api'
	import Button from '$lib/components/atoms/Button.svelte'
	import Item from './Item.svelte'
	import PanelItem from '../../PanelItem.svelte'
	import ComboBox from '$lib/components/atoms/ComboBox.svelte'
	import { getNodePath } from '$lib/stores/canvas.svelte'
	import { type Component } from '$lib/types/resources'
	import { getVisibleComponent } from '$lib/stores/canvas.svelte'

	const { nodeId }: { nodeId: string } = $props()

	const componentData = $derived(getVisibleComponent(nodeId) as Component)

	let variableDialog = $state<HTMLDialogElement>()

	let query = $state('')

	const variables = $derived.by(() => {
		const allModifiers = page.data.project?.spec.modifiers
		if (!allModifiers) {
			return []
		}

		const path = getNodePath()

		if (!path) {
			return []
		}

		const variableIds = allModifiers[path]

		if (!variableIds) {
			return []
		}

		return page.data.variables?.filter(variable => variableIds.includes(variable.id)) ?? []
	})

	let newVariable = $state('')

	const projectId = page.data.project?.id

	const api = new API()

	let isAttaching = $state(false)

	async function attachVariable() {
		isAttaching = true

		const nodePath = getNodePath()

		const result = await api.post(`projects/${projectId}/variable`, {
			nodePath,
			modifierId: newVariable
		})

		isAttaching = false
		invalidate('project')
		newVariable = ''
	}
</script>

<PanelItem {nodeId} title="Environment Variables">
	<div>
		<!-- {#if variables.length > 0}
		<div class=" mb-2 grid grid-cols-[1fr_auto] items-end gap-4">
			<label class="-ms-3 block">
				<span class="sr-only">Filter</span>
				<input
					type="text"
					placeholder="Filter variables"
					class="bg-main-800 w-full rounded-md px-3 py-1.5 outline-0"
					bind:value={query}
				/>
			</label>
		</div>
	{/if} -->

		<div class={[newVariable && 'grid grid-cols-[1fr_auto] gap-2']}>
			{#key variables.length}
				<ComboBox
					bind:value={newVariable}
					placeholder="Attach variable"
					items={page.data.variables
						?.filter(v => !variables.includes(v))
						.map(v => ({ value: v.id, label: v.spec.key })) ?? []}
					createNew={{
						label: 'Create new environment variable',
						trigger: () => {
							variableDialog?.showModal()
						}
					}}
				/>
			{/key}

			{#if newVariable}
				<Button
					isLoading={isAttaching}
					class="py-1 text-sm font-medium"
					variation="vibrant"
					type="button"
					onClick={async () => {
						await attachVariable()
					}}
				>
					{#snippet body()}
						Add
					{/snippet}
				</Button>
			{/if}
		</div>

		<ul class="mt-2 font-medium">
			{#each variables as variable (variable.id)}
				{#if variable.spec.key.toLowerCase().includes(query.toLowerCase())}
					<Item {variable} onEdit={() => variableDialog?.showModal()} />
				{/if}
			{:else}
				<li class="pt-2 text-sm text-main-500">No added variables</li>
			{/each}
		</ul>
	</div>
</PanelItem>

<VariableForm bind:dialog={variableDialog} />
