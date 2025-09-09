<script lang="ts">
	import { page } from '$app/state'
	import PanelItem from '../../PanelItem.svelte'
	import Dialog from './Dialog.svelte'
	import ComboBox from '$lib/components/atoms/ComboBox.svelte'
	import { getProject, getNodePath, getCurrentNodePath } from '$lib/stores/canvas.svelte'
	import { saveProject } from '$lib/actions/project'
	import { clone } from '$lib/utils/clone'
	import { toast } from 'svelte-sonner'
	import { confirmStore } from '$lib/stores/confirm.svelte'
	import IconDetach from '~icons/mdi/link-variant-off'

	let dialog = $state<HTMLDialogElement>()

	const { nodeId }: { nodeId: string } = $props()

	const project = $derived(getProject())
	const nodePath = $derived([...getCurrentNodePath(), nodeId].join('/'))

	// Get modifiers for this node path from the project modifiers
	const modifiers = $derived.by(() => {
		if (!project?.spec.modifiers || !nodePath) {
			return []
		}

		return project.spec.modifiers[nodePath] ?? []
	})

	// Get all available variables from page data that aren't already attached
	const availableVariables = $derived.by(() => {
		const allVariables = (page.data.modifiers || []).filter(m => m.resource === 'variable/v1')
		const attachedIds = modifiers.map(m => m.modifier_id)
		return allVariables.filter(v => v.id && !attachedIds.includes(v.id))
	})

	let selectedVariable = $state('')
	let variableSearchValue = $state('')
	let isAttaching = $state(false)
	let comboBoxElement = $state<HTMLElement | null>(null)

	// Auto-attach variable when selected
	$effect(() => {
		if (selectedVariable && !modifiers.some(m => m.modifier_id === selectedVariable)) {
			attachVariable(selectedVariable)
			// Explicitly blur the ComboBox and reset values
			const input = comboBoxElement?.querySelector('input')
			if (input) {
				input.blur()
			}
			selectedVariable = ''
			variableSearchValue = ''
		}
	})

	async function attachVariable(variableId?: string) {
		const targetVariable = variableId || selectedVariable
		if (!targetVariable || !project) return

		isAttaching = true
		const snapshot = clone($state.snapshot(project))

		try {
			// Find the variable to attach
			const variableToAttach = page.data.modifiers?.find(v => v.id === targetVariable)
			if (!variableToAttach) {
				toast.error('Variable not found')
				return
			}

			// Initialize modifiers object if it doesn't exist
			if (!project.spec.modifiers) {
				project.spec.modifiers = {}
			}

			// Initialize the array for this node path if it doesn't exist
			if (!project.spec.modifiers[nodePath]) {
				project.spec.modifiers[nodePath] = []
			}

			// Add the variable to the project
			project.spec.modifiers[nodePath].push({
				modifier_id: variableToAttach.id!,
				spec: variableToAttach
			})

			// Save the project
			const res = await saveProject(project)

			if (!res.success) {
				Object.assign(project, snapshot)
				toast.error('Failed to attach variable')
				return
			}

			toast.success('Variable attached successfully')
		} catch (e) {
			Object.assign(project, snapshot)
			console.error('Failed to attach variable:', e)
			toast.error('Failed to attach variable')
		} finally {
			isAttaching = false
		}
	}

	async function detachVariable(modifierId: string) {
		if (!project) return

		// Find the variable name for the confirmation dialog
		const variable = modifiers.find(m => m.modifier_id === modifierId)
		const variableName = variable?.spec.spec.key || 'this variable'

		// Show confirmation dialog
		const confirmed = await confirmStore.show({
			title: 'Detach Variable',
			message: `Are you sure you want to detach "${variableName}"? This will remove it from this component.`
		})

		if (!confirmed) return

		const snapshot = clone($state.snapshot(project))

		try {
			// Remove the modifier from the project array
			if (project.spec.modifiers?.[nodePath]) {
				project.spec.modifiers[nodePath] = project.spec.modifiers[nodePath].filter(
					m => m.modifier_id !== modifierId
				)

				// Clean up empty arrays
				if (project.spec.modifiers[nodePath].length === 0) {
					delete project.spec.modifiers[nodePath]
				}
			}

			const res = await saveProject(project)

			if (!res.success) {
				toast.error('Failed to detach variable')
				Object.assign(project, snapshot)
			} else {
				toast.success('Variable detached successfully')
			}
		} catch (e) {
			console.error('Failed to detach variable:', e)
			toast.error('Failed to detach variable')
			Object.assign(project, snapshot)
		}
	}
</script>

<Dialog bind:dialog {nodePath} />

<PanelItem {nodeId} title="Environment Variables">
	<div>
		<div bind:this={comboBoxElement}>
			{#key modifiers.length}
				<ComboBox
					bind:value={selectedVariable}
					bind:searchValue={variableSearchValue}
					placeholder="Search variables or type to create new..."
					items={availableVariables.map(v => ({ value: v.id!, label: v.spec.key }))}
					createNew={{
						label: 'Create new environment variable',
						trigger: () => {
							dialog?.showModal()
						}
					}}
				/>
			{/key}
		</div>

		<ul class="mt-2 font-medium">
			{#each modifiers as { modifier_id, spec }}
				<li
					class="group animate-fade-in flex flex-row items-center justify-between gap-3 py-1.5 text-sm"
				>
					<div class="grid grid-cols-[auto_auto_auto] items-center gap-2">
						<span
							class={[
								'text-main-300 w-fit max-w-full truncate font-mono',
								'bg-main-800 rounded-md px-2 py-1',
								'border-main-700 border'
							]}
						>
							{spec?.spec?.key}
						</span>
						<span class="text-main-300 font-medium"> = </span>
						<span
							class={[
								'text-main-300 w-fit max-w-full truncate font-mono',
								'bg-main-800 rounded-md px-2 py-1',
								'border-main-700 border'
							]}
						>
							{spec?.spec?.value}
						</span>
					</div>

					<div
						class={[
							'pointer-events-none ms-auto flex transform items-center gap-2 opacity-50 *:transition',
							'group-hover:pointer-events-auto group-hover:opacity-100',
							'*:hover:text-main-200 text-main-500 transition *:active:scale-95'
						]}
					>
						<button
							type="button"
							title="Detach"
							onclick={() => detachVariable(modifier_id)}
							class="hover:text-danger-300"
							aria-label="Detach variable"
						>
							<IconDetach class="size-5"></IconDetach>
						</button>
					</div>
				</li>
			{:else}
				<li class="pt-2 text-sm text-main-500">No added variables</li>
			{/each}
		</ul>
	</div>
</PanelItem>
