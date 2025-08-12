<script lang="ts">
	import {
		getVisibleComponent,
		refreshFlow,
		getCurrentContainer,
		getEdges,
		deleteEdge,
		saveContainer
	} from '$lib/stores/canvas.svelte'
	import { jsonSchemaTypeModel, pythonTypeToJsonSchema } from '$lib/schemas'
	import * as z from 'zod'
	import { debounce } from '$lib/utils/debounce'
	import { updateComponent } from '$lib/actions/components'
	import { toast } from 'svelte-sonner'
	import type { resolvedComponentModel } from '$lib/schemas'
	import TypeEditor from './TypeEditor.svelte'
	import IconDelete from '~icons/material-symbols/delete-rounded'
	import { clone } from '$lib/utils/clone'
	import { confirmStore } from '$lib/stores/confirm.svelte'
	import IconAdd from '~icons/mdi/plus-circle-outline'
	import InputField from '$lib/components/atoms/InputField.svelte'
	import IconCreate from '~icons/material-symbols/check-rounded'
	import { tick } from 'svelte'

	let {
		nodeId,
		type,
		readonly = false
	}: { nodeId: string; type: 'input' | 'output'; readonly?: boolean } = $props()

	const component = $derived(getVisibleComponent(nodeId) as z.infer<typeof resolvedComponentModel>)
	const ports = $derived(
		type === 'input'
			? 'inputs' in component?.spec
				? Object.entries(component.spec.inputs)
				: []
			: 'outputs' in component?.spec
				? Object.entries(component.spec.outputs)
				: []
	)

	const saveComponent = async () => {
		const res = await updateComponent(component)
		if (!res.success) toast.error(`Failed saving ${component.meta.name}`)
		return res
	}
	const debouncedSaveComponent = debounce(saveComponent, 500)

	const deletePort = async (key: string) => {
		const confirmed = await confirmStore.show({
			title: 'Are you sure?',
			message: 'This will delete the port and all its connections immediately'
		})

		if (!confirmed) return
		const oldPort = clone(ports.find(([k]) => k === key)?.[1])
		if (!oldPort) return void toast.error('You cannot delete a non-existent port')

		const container = getCurrentContainer()
		const containerSnapshot = clone($state.snapshot(container))

		delete component.spec[`${type}s`][key]

		// first, try and save just the component
		const componentRes = await saveComponent()
		if (!componentRes.success) {
			component.spec[`${type}s`][key] = oldPort
			return
		}

		// if the comopnent saving succeeded, try and remove the edges that targeted this port
		// and then save the entire container (rolling back if needed)
		const edges = getEdges().filter(e => e.target === nodeId && e.targetHandle === key)
		for (const edge of edges) {
			await deleteEdge(edge.id, false)
		}

		await saveContainer(containerSnapshot)
		await refreshFlow()
	}

	let isAddingPort = $state(false)
	let newPortName = $state('')
	let newPortType = $state(pythonTypeToJsonSchema('str') as z.infer<typeof jsonSchemaTypeModel>)

	const startAddingPort = async () => {
		if (isAddingPort) {
			isAddingPort = false
			return
		}
		isAddingPort = true
		newPortName = ''
		newPortType = pythonTypeToJsonSchema('str') as z.infer<typeof jsonSchemaTypeModel>
		await tick()
		newPortNameEl?.focus()
	}

	const addPort = async () => {
		component.spec[`${type}s`][newPortName] = {
			type: newPortType,
			description: ''
		}
		isAddingPort = false
		const res = await saveComponent()
		if (!res.success) {
			isAddingPort = true
			delete component.spec[`${type}s`][newPortName]
			toast.error('Failed to add port')
		}
	}

	let newPortNameEl = $state<HTMLInputElement>()
</script>

<div>
	<h4 class="text-main-400 flex flex-row items-center gap-2 text-xs font-bold uppercase">
		{type}s
		<button class="icon-btn hover:text-main-200" disabled={readonly} onclick={startAddingPort}>
			<IconAdd class="size-4" />
		</button>
		<div class="bg-main-700/80 ml-1 h-px w-full"></div>
	</h4>

	<div class="mt-1 grid w-full grid-cols-[1fr_1.5fr] items-center gap-2">
		{#if ports.length || isAddingPort}
			<p class="text-main-400 text-sm">Port name</p>
			<p class="text-main-400 text-sm">Type</p>
		{/if}

		{#each ports as [key, port]}
			<div
				class="text-main-300 bg-main-950/70 flex w-fit items-center rounded-md px-3 py-1.5 font-mono text-sm"
			>
				<span>{key}</span>
			</div>

			<div class="flex flex-row items-center gap-3">
				<TypeEditor
					bind:typeValue={port.type as z.infer<typeof jsonSchemaTypeModel>}
					onblur={debouncedSaveComponent}
					{readonly}
				/>
				{#if !readonly}
					<IconDelete
						class="icon-btn hover:text-danger-400 shrink-0"
						onclick={() => deletePort(key)}
					/>
				{/if}
			</div>
		{/each}

		{#if !ports.length && !isAddingPort}
			<p class="text-main-500 col-span-2 mt-4 w-full text-center">
				No {type}s defined yet
			</p>
		{/if}

		{#if isAddingPort}
			<form class="contents" onsubmit={addPort}>
				<InputField
					required
					bind:el={newPortNameEl}
					bind:value={() => newPortName, value => (newPortName = value.replace(/\s+/g, '_'))}
					placeholder={`new_${type}`}
					class="font-mono"
				/>
				<div class="flex flex-row items-center gap-3">
					<TypeEditor bind:typeValue={newPortType} />
					<button class="icon-btn hover:text-main-200" type="submit">
						<IconCreate />
					</button>
				</div>
			</form>
		{/if}
	</div>
</div>
