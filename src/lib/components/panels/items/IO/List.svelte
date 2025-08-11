<script lang="ts">
	import {
		getVisibleComponent,
		refreshFlow,
		getCurrentContainer,
		getEdges,
		deleteEdge,
		saveContainer
	} from '$lib/stores/canvas.svelte'
	import { jsonSchemaTypeModel } from '$lib/schemas'
	import * as z from 'zod'
	import { debounce } from '$lib/utils/debounce'
	import { updateComponent } from '$lib/actions/components'
	import { toast } from 'svelte-sonner'
	import type { resolvedComponentModel } from '$lib/schemas'
	import TypeEditor from './TypeEditor.svelte'
	import IconDelete from '~icons/material-symbols/delete-rounded'
	import { clone } from '$lib/utils/clone'
	import { confirmStore } from '$lib/stores/confirm.svelte'

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
</script>

<div>
	<h4 class="text-main-300 flex flex-row items-center gap-3 text-sm capitalize">
		{type}s
		<div class="bg-main-700/80 h-px w-full"></div>
	</h4>
	<div class="mt-1 grid w-full grid-cols-[max-content_1fr] items-center gap-2">
		<p class="text-main-400 min-w-32 text-sm">Port name</p>
		<p class="text-main-400 text-sm">Type</p>
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
		{:else}
			<p class="text-main-500 text-center w-full col-span-2 mt-4">
				No {type}s defined
			</p>
		{/each}
	</div>
</div>
