<script lang="ts">
	import { getProject, saveContainer } from '$lib/stores/canvas.svelte'
	import Disclosure from '$lib/components/atoms/Disclosure.svelte'
	import AddIcon from '~icons/material-symbols/add-rounded'
	import IconChevronRight from '~icons/material-symbols/chevron-right-rounded'
	import Dropdown from '$lib/components/atoms/Dropdown.svelte'
	import DropdownItem from '$lib/components/atoms/DropdownItem.svelte'
	import { nodeTypesDict, type NodeType } from '$lib/constants/nodeTypes'
	import { clone } from '$lib/utils/clone'
	import { toast } from 'svelte-sonner'
	import { objectMap } from '$lib/utils/objectMap'
	import InputField from '$lib/components/atoms/InputField.svelte'
	import Button from '$lib/components/atoms/Button.svelte'
	import { confirmStore } from '$lib/stores/confirm.svelte'
	import { slide } from 'svelte/transition'
	import IconLeftArrow from '~icons/material-symbols/arrow-back-rounded'
	import IconCopy from '~icons/material-symbols/content-copy-rounded'

	const project = getProject()

	const exposedNodes = $derived(project?.spec.triggers.endpoints.nodes)
	const availableNodes = $derived(
		Object.entries(project?.spec.nodes ?? {}).filter(([nodeId, node]) => !(nodeId in exposedNodes))
	)
	const getNode = (nodeId: string) => project?.spec.nodes[nodeId]

	const exposeNode = async (nodeId: string) => {
		if (!project) return toast.error('No project found')
		const snapshot = clone($state.snapshot(project))
		const node = project?.spec.nodes[nodeId]
		project.spec.triggers.endpoints.nodes[nodeId] = {
			method: 'POST',
			payload_mapping: objectMap(node.spec.spec.inputs ?? {}, (_value, key) => `$.${key}`)
		}
		const res = await saveContainer(snapshot, project)
		if (!res.success) return toast.error('Failed to expose node')
	}

	const unexposeNode = async (nodeId: string) => {
		if (!project) return toast.error('No project found')
		const confirmed = await confirmStore.show({
			title: 'Are you sure?',
			message:
				'This will remove the node from the endpoint, you will not be able to access the node externally through an HTTP endpoint anymore',
			danger: true
		})
		if (!confirmed) return
		const snapshot = clone($state.snapshot(project))
		delete project.spec.triggers.endpoints.nodes[nodeId]
		const res = await saveContainer(snapshot, project)
		if (!res.success) return toast.error('Failed to unexpose node')
	}
</script>

<div class="flex w-full flex-col gap-y-2">
	<span class="text-main-300 font-medium"> Exposed Nodes </span>
	{#each Object.entries(exposedNodes) as [nodeId, node]}
		{@const trinode = getNode(nodeId)}
		{@const nodeType = nodeTypesDict[trinode.spec.resource.split('/')[0] as NodeType]}
		{@const path = `${window?.location.origin?.replace('app.triform.ai', 'nexus.triform.ai')}/api/in/${project?.id}/${nodeId}`}
		<div class={['bg-main-950/60 rounded-md p-3 pl-4']} transition:slide={{ axis: 'y' }}>
			<Disclosure triggerClass={['group/trigger w-full']}>
				{#snippet trigger()}
					<div class="grid w-full grid-cols-[auto_auto_1fr] items-center gap-2 rounded-md">
						{#if nodeType}
							<nodeType.icon class="size-4 shrink-0" style={`color: ${nodeType.iconColor}`} />
						{/if}
						<span
							class={[
								'text-main-400 truncate transition',
								'group-aria-expanded/trigger:text-main-300 group-hover/trigger:text-main-300'
							]}>{trinode.spec.meta.name}</span
						>
						<IconChevronRight
							class={[
								'text-main-500 group-hover/trigger:text-main-200 ml-auto size-5 shrink-0 transition',
								'group-aria-expanded/trigger:text-main-300 group-aria-expanded/trigger:rotate-90'
							].join(' ')}
						/>
					</div>
				{/snippet}
				<div class="flex flex-col gap-y-4 pt-4">
					<div>
						<span class="eyebrow text-main-300">Input mapping</span>
						<div class="mt-2 grid grid-cols-[auto_1fr_auto] items-center gap-2">
							{#if Object.entries(node.payload_mapping ?? {}).length}
								<span class="text-main-400 text-sm"> {nodeType.label} input name </span>
								<span></span>
								<span class="text-main-400 text-sm"> Endpoint payload JSON path </span>
							{/if}
							<!-- actual inputs -->
							{#each Object.entries(node.payload_mapping ?? {}) as [key, jsonPath]}
								<span class="bg-main-950 text-main-300 truncate rounded-md p-2 font-mono text-sm">
									{key}
								</span>
								<IconLeftArrow class="text-main-400 size-4" />
								<InputField
									value={jsonPath}
									placeholder="Node input"
									class="text-main-200 font-mono text-sm"
								/>
							{:else}
								<span class="text-main-400 text-sm col-span-3 text-center">
									This {nodeType.label.toLowerCase()} has no inputs
								</span>
							{/each}
						</div>
					</div>
					<div>
						<span class="eyebrow text-main-300">Endpoint path</span>
						<div class="mt-2 grid grid-cols-[auto_1fr_auto] items-center gap-2">
							<span
								class="text-accent-400 bg-main-950 rounded-md px-1.5 py-1 font-mono text-xs font-semibold"
							>
								{node.method}
							</span>
							<span class="text-main-300 truncate">
								{path.replace('https://', '')}
							</span>
							<button
								onclick={() => {
									navigator.clipboard.writeText(path)
									toast.success('Path copied to clipboard')
								}}
								class="text-main-500 hover:text-main-300 icon-btn"
							>
								<IconCopy class="size-4" />
							</button>
						</div>
					</div>
					<Button variation="danger" class="ml-auto py-2" onClick={() => unexposeNode(nodeId)}>
						Unexpose
					</Button>
				</div>
			</Disclosure>
		</div>
	{/each}
	<Dropdown contentClass="w-full max-w-96" disabled={!availableNodes.length}>
		{#snippet trigger()}
			<button
				class={[
					'bg-main-950/60 border-main-800 text-main-400 flex w-full flex-row items-center justify-center gap-2 rounded-md border border-dashed p-4',
					'hover:enabled:bg-main-950/80 hover:enabled:border-main-700 hover:enabled:text-main-300 transition active:enabled:scale-[97%]',
					'disabled:bg-main-950/20 disabled:text-main-500 disabled:cursor-not-allowed'
				]}
				disabled={!availableNodes.length}
				aria-label={!availableNodes.length ? 'All nodes are already exposed' : undefined}
				data-balloon-instant={!availableNodes.length}
				data-balloon-pos="down"
			>
				<AddIcon class="size-5" />
				Expose node
			</button>
		{/snippet}
		{#snippet children()}
			{#each availableNodes as [nodeId, node]}
				{@const nodeType = nodeTypesDict[node.spec.resource.split('/')[0] as NodeType]}
				<DropdownItem class="flex flex-row items-center gap-2" onSelect={() => exposeNode(nodeId)}>
					{#if nodeType}
						<nodeType.icon class="size-4" style={`color: ${nodeType.iconColor}`} />
					{/if}
					<p>{node.spec.meta.name}</p>
				</DropdownItem>
			{/each}
		{/snippet}
	</Dropdown>
</div>
