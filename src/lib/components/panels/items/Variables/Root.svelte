<script lang="ts">
	import { page } from '$app/state'
	import PanelItem from '../../PanelItem.svelte'
	import ComboBox from '$lib/components/atoms/ComboBox.svelte'
	import {
		getProject,
		getNodePath,
		getCurrentNodePath,
		setProject
	} from '$lib/stores/canvas.svelte'
	import { saveProject } from '$lib/actions/project'
	import { clone } from '$lib/utils/clone'
	import { toast } from 'svelte-sonner'
	import { confirmStore } from '$lib/stores/confirm.svelte'
	import VariableEditor from './VariableEditor.svelte'
	import IconDelete from '~icons/material-symbols/delete-outline'
	import IconAdd from '~icons/material-symbols/check-rounded'
	import IconEdit from '~icons/material-symbols/edit-rounded'
	import IconMoreVert from '~icons/material-symbols/more-vert'
	import IconSave from '~icons/material-symbols/save-rounded'
	import IconCancel from '~icons/material-symbols/cancel-rounded'
	import Button from '$lib/components/atoms/Button.svelte'
	import Dropdown from '$lib/components/atoms/Dropdown.svelte'
	import DropdownItem from '$lib/components/atoms/DropdownItem.svelte'
	import { filterInPlace } from '$lib/utils/filterInPlace'

	const { nodeId }: { nodeId: string } = $props()

	const project = $derived(getProject())

	const variables = $derived(project.spec.environment.variables)

	let isAdding = $state(false)
	let isEditing = $state<string>()

	let newVariable = $state({
		key: '',
		value: ''
	})

	let editVariable = $state({
		key: '',
		value: '',
		originalKey: ''
	})

	const isDuplicateKey = (key: string, excludeKey?: string) =>
		variables.some(v => v.key === key && v.key !== excludeKey)

	const addVariable = async () => {
		if (!newVariable.key.trim()) return toast.error('Variable key cannot be empty')

		if (isDuplicateKey(newVariable.key))
			return toast.error(`Variable ${newVariable.key} already exists`)

		isAdding = true
		const newProject = clone(project)
		const newVar = { ...newVariable, secret: false } as const
		newProject.spec.environment.variables.push(newVar)
		const res = await saveProject(newProject)
		if (!res.success) {
			toast.error('Failed to add variable')
			isAdding = false
			return
		}
		variables.push(newVar)
		toast.success('Variable added')
		newVariable = {
			key: '',
			value: ''
		}
		isAdding = false
	}

	const deleteVariable = async (key: string) => {
		const confirmed = await confirmStore.show({
			title: 'Are you sure?',
			message: 'This will delete the variable for all nodes within the project immediately'
		})
		if (!confirmed) return

		const newProject = clone(project)
		newProject.spec.environment.variables = newProject.spec.environment.variables.filter(
			v => v.key !== key
		)
		const res = await saveProject(newProject)
		if (!res.success) {
			toast.error('Failed to delete variable')
			return
		}
		filterInPlace(variables, v => v.key !== key)
		toast.success('Variable deleted')
	}

	const startEditVariable = (key: string) => {
		if (isAdding) {
			isAdding = false
			newVariable = { key: '', value: '' }
		}

		const variable = variables.find(v => v.key === key)
		if (!variable) return

		editVariable.key = variable.key
		editVariable.value = variable.value
		editVariable.originalKey = variable.key
		isEditing = key
	}

	const saveEditVariable = async () => {
		if (!editVariable.key.trim()) return toast.error('Variable key cannot be empty')

		if (isDuplicateKey(editVariable.key, editVariable.originalKey))
			return toast.error('Variable key already exists')

		const newProject = clone(project)
		const variableIndex = newProject.spec.environment.variables.findIndex(
			v => v.key === editVariable.originalKey
		)

		if (variableIndex === -1) return toast.error('Variable not found')

		newProject.spec.environment.variables[variableIndex] = {
			...newProject.spec.environment.variables[variableIndex],
			key: editVariable.key,
			value: editVariable.value
		}

		const res = await saveProject(newProject)
		if (!res.success) {
			toast.error('Failed to save variable')
			return
		}

		setProject(res.data)

		toast.success('Variable updated')
		cancelEditVariable()
	}

	const cancelEditVariable = () => {
		isEditing = undefined
		editVariable = {
			key: '',
			value: '',
			originalKey: ''
		}
	}

	const getVariableActions = (key: string) => [
		{
			label: 'Edit',
			icon: IconEdit,
			onClick: () => startEditVariable(key)
		},
		{
			label: 'Delete',
			icon: IconDelete,
			onClick: () => deleteVariable(key)
		}
	]
</script>

<PanelItem
	{nodeId}
	title="Project Variables"
	isListContainer
	tip="Project variables are globally injected into all nodes within the project"
	onAddClick={() => {
		if (isEditing) return
		isAdding = !isAdding
	}}
>
	<div class="grid h-fit max-h-full grid-cols-[1fr_auto_1fr_auto] items-center gap-2">
		{#each variables as variable}
			{#if isEditing === variable.key}
				<div class="contents font-mono">
					<VariableEditor
						bind:key={editVariable.key}
						bind:value={editVariable.value}
						onEnter={saveEditVariable}
					/>
					<div class="flex gap-1">
						<Button
							class="p-2 transition starting:opacity-0"
							onClick={cancelEditVariable}
							variation="link"
						>
							{#snippet icon()}
								<IconCancel />
							{/snippet}
						</Button>
						<Button
							class="p-2 transition starting:opacity-0"
							onClick={saveEditVariable}
							variation="link"
							autoLoad="promise"
						>
							{#snippet icon()}
								<IconAdd />
							{/snippet}
						</Button>
					</div>
				</div>
			{:else}
				<div class="contents font-mono">
					<span
						class="bg-main-950 text-main-300 border-main-800 rounded-md border px-2 py-2 text-sm"
						ondblclick={() => startEditVariable(variable.key)}>{variable.key}</span
					>
					<span class="text-main-500">=</span>
					<span
						class="bg-main-950 text-main-300 border-main-800 rounded-md border px-2 py-2 text-sm"
						ondblclick={() => startEditVariable(variable.key)}>{variable.value}</span
					>
					<Dropdown>
						{#snippet trigger()}
							<Button variation="link" class="not-hover:text-main-500 p-2">
								{#snippet icon()}
									<IconMoreVert />
								{/snippet}
							</Button>
						{/snippet}

						{#snippet children()}
							{#each getVariableActions(variable.key) as action}
								<DropdownItem
									onSelect={action.onClick}
									class="text-main-400 flex gap-2 overflow-hidden font-sans text-sm font-medium"
								>
									<action.icon class="size-4" />
									{action.label}
								</DropdownItem>
							{/each}
						{/snippet}
					</Dropdown>
				</div>
			{/if}
		{:else}
			{#if !isAdding}
				<p class="text-main-500 mt-4 w-full text-center col-span-4 starting:opacity-0 transition">
					No variables defined yet, add one above
				</p>
			{/if}
		{/each}
		{#if isAdding}
			<VariableEditor
				bind:key={newVariable.key}
				bind:value={newVariable.value}
				onEnter={addVariable}
			/>
			<Button
				class="p-2 transition starting:opacity-0"
				onClick={addVariable}
				variation="link"
				autoLoad="promise"
			>
				{#snippet icon()}
					<IconAdd />
				{/snippet}
			</Button>
		{/if}
	</div>
</PanelItem>
