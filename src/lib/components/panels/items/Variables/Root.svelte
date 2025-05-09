<script lang="ts">
	import { page } from '$app/state'
	import VariableForm from '$lib/components/forms/Variable.svelte'
	import { invalidate } from '$app/navigation'
	import { API } from '$lib/api'
	import Button from '$lib/components/atoms/Button.svelte'
	import { selected } from '$lib/stores/canvas.svelte'
	import Item from './Item.svelte'
	import PanelItem from '../../PanelItem.svelte'
	import ComboBox from '$lib/components/atoms/ComboBox.svelte'

	let variableDialog = $state<HTMLDialogElement>()

	let query = $state('')

	const variables = $derived.by(() => {
		const allModifiers = page.data.project?.spec.modifiers
		if (!allModifiers) {
			return []
		}

		const path = selected.node?.data.path.join('/')

		if (!path) {
			return []
		}

		const variableIds = allModifiers[path]

		if (!variableIds) {
			return []
		}

		return page.data.variables?.filter(variable => variableIds.includes(variable.meta.id)) ?? []
	})

	let newVariable = $state('')

	const projectId = page.data.project?.meta.id

	const api = new API()

	let isAttaching = $state(false)

	async function attachVariable() {
		isAttaching = true

		const result = await api.post(`projects/${projectId}/variable`, {
			nodePath: selected.node?.data.path.join('/'),
			modifierId: newVariable
		})

		isAttaching = false
		invalidate('project')
		newVariable = ''
	}
</script>

<PanelItem title="Variables">
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

		<div class={['-ms-1', newVariable && ' grid grid-cols-[1fr_auto] gap-2']}>
			{#key variables.length}
				<ComboBox
					bind:value={newVariable}
					placeholder="Add variable"
					items={page.data.variables?.map(v => ({ value: v.meta.id, label: v.spec.key })) ?? []}
					createNew={{
						label: 'Create new variable',
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
			{#each variables as variable (variable.meta.id)}
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
