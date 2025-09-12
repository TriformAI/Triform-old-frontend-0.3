<script lang="ts">
	import {
		getVisibleComponent,
		refreshFlow,
		getCurrentContainer,
		getEdges,
		deleteEdge,
		saveContainer,
		addPort as addPortToCanvas
	} from '$lib/stores/canvas.svelte'
	import { isAgent, jsonSchemaTypeModel } from '$lib/schemas'
	import * as z from 'zod'
	import { debounce } from '$lib/utils/debounce'
	import { updateComponent } from '$lib/actions/components'
	import { toast } from 'svelte-sonner'
	import type { resolvedComponentModel } from '$lib/schemas'
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
	const sortPorts = ([a]: [string, any], [b]: [string, any]) => {
		if (isAgent(component)) {
			if (a === 'messages') return -1
			if (b === 'messages') return 1
		}
		return 0
	}
	// "messages" should be the first port for agents
	const ports = $derived(
		type === 'input'
			? 'inputs' in component?.spec
				? Object.entries(component.spec.inputs).sort(sortPorts)
				: []
			: 'outputs' in component?.spec
				? Object.entries(component.spec.outputs).sort(sortPorts)
				: []
	)

	const debouncedSaveComponent = debounce(async () => {
		const res = await updateComponent(component)
		if (!res.success) toast.error(`Failed saving ${component.meta.name}`)
		return res
	}, 500)

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
		const componentRes = await updateComponent(component)
		if (!componentRes.success) {
			component.spec[`${type}s`][key] = oldPort
			toast.error(`Failed saving ${component.meta.name}`)
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
	let newPortType = $state({ type: 'string' } as z.infer<typeof jsonSchemaTypeModel>)

	const startAddingPort = async () => {
		if (isAddingPort) {
			isAddingPort = false
			return
		}
		isAddingPort = true
		newPortName = ''
		newPortType = { type: 'string' } as z.infer<typeof jsonSchemaTypeModel>
		await tick()
		newPortNameEl?.focus()
	}

	const addPort = async () => {
		await addPortToCanvas(nodeId as any, newPortName, newPortType, type)
		isAddingPort = false
		// force refresh so the handles update properly
		refreshFlow()
	}

	let newPortNameEl = $state<HTMLInputElement>()

	const protectedPorts = $derived(
		isAgent(component)
			? { messages: { reason: `A "messages" ${type} is required for agents` } }
			: {}
	)
</script>

<div>
	<h4 class="text-main-400 flex flex-row items-center gap-1 text-xs font-bold uppercase">
		{type}s

		<button
			type="button"
			disabled={readonly}
			onclick={startAddingPort}
			class="group grid size-6 place-content-center"
			id={`add-${type}-port`}
		>
			<IconAdd
				class="group-hover:text-main-200 size-4.5 transition-all duration-200 group-hover:size-5"
			/>
		</button>

		<div class="bg-main-700/80 ml-1 h-px w-full"></div>
	</h4>

	<div class="mt-1 grid w-full grid-cols-[1fr_auto] items-center gap-2">
		{#if ports.length || isAddingPort}
			<p class="text-main-400 text-sm">Port name</p>
			<span></span>
			<!-- <p class="text-main-400 text-sm">Type</p> -->
		{/if}

		{#each ports as [key, port]}
			<div
				class="text-main-300 bg-main-950/70 flex w-fit items-center rounded-md px-3 py-1.5 font-mono text-sm"
			>
				<span>{key}</span>
			</div>

			{#if !readonly}
				<button
					class="icon-btn not-disabled:hover:text-danger-400 disabled:text-main-700 shrink-0"
					disabled={key in protectedPorts}
					onclick={() => deletePort(key)}
					aria-label={key in protectedPorts
						? protectedPorts[key as keyof typeof protectedPorts]?.reason
						: undefined}
					data-balloon-pos="left"
					data-balloon-instant
				>
					<IconDelete />
				</button>
			{:else}
				<span></span>
			{/if}
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
					id={`add-${type}-port-input`}
				/>
				<div class="flex flex-row items-center gap-3">
					<button class="icon-btn hover:text-main-200" type="submit" id={`add-${type}-port-submit`}>
						<IconCreate />
					</button>
				</div>
			</form>
		{/if}
	</div>
</div>
