<script lang="ts">
	import { addPort } from '$lib/stores/canvas.svelte'
	import { clickOutside } from '$lib/utils/clickOutside'
	import { Handle } from '@xyflow/svelte'
	import { Position } from '@xyflow/svelte'
	import IconPlus from '~icons/mdi/plus'

	interface Props {
		class?: string
		type: 'source' | 'target'
		nodeId?: string
	}
	const { type, class: classes, nodeId }: Props = $props()

	let inputRef = $state<HTMLInputElement>()
	let isAddingPort = $state(false)
	let newPortName = $state('')

	const isIoNode = $derived(nodeId?.endsWith(':input') || nodeId?.endsWith(':output'))

	const portType = $derived.by(() => {
		if (isIoNode) return type === 'source' ? 'input' : 'output'
		return type === 'source' ? 'output' : 'input'
	})

	// turn the handle into a text field
	const initAddPort = () => {
		isAddingPort = true
		newPortName = ''
		setTimeout(() => inputRef?.focus(), 100)
	}

	// actually add the port after the user has finished typing
	const finalisePort = async () => {
		if (!nodeId) return
		const currNodeId = isIoNode ? 'container' : nodeId
		await addPort(currNodeId, newPortName, {}, portType)
		isAddingPort = false
		newPortName = ''
	}

	// cancel adding a port
	const cancelAddPort = () => {
		isAddingPort = false
		newPortName = ''
	}

	// handle keyboard events
	const handleKeydown = (event: KeyboardEvent) => {
		if (event.key === 'Enter' && newPortName.trim()) finalisePort()
		else if (event.key === 'Escape') cancelAddPort()
	}
</script>

<div class={['relative', classes]} use:clickOutside={{ handler: cancelAddPort }}>
	<Handle
		id={`ghost-${type}`}
		{type}
		onpointerdown={(e: MouseEvent) => {
			// Prevent dragging out an edge from input nodes
			if (type === 'source') {
				e.preventDefault()
			}
		}}
		position={type === 'source' ? Position.Bottom : Position.Top}
		class={[
			'!bg-main-900 !border-main-500 z-10 flex origin-bottom-left items-center justify-center border !border-dashed transition-[width,height,transform,scale,color] duration-200 ease-in-out',
			isAddingPort
				? '!h-8 !w-40 !rounded-md !p-1'
				: '!h-6 !w-6 !cursor-pointer !rounded-full p-1.5 hover:scale-105 hover:shadow-lg active:scale-95 active:shadow-sm',
			isAddingPort ? '' : 'text-main-400 hover:text-main-100'
		]}
		onclick={isAddingPort ? undefined : initAddPort}
	>
		{#if isAddingPort}
			<input
				type="text"
				bind:value={() => newPortName, value => (newPortName = value.replace(/\s+/g, '_'))}
				onkeydown={handleKeydown}
				onblur={cancelAddPort}
				placeholder={type === 'source' ? 'New input name' : 'New output name'}
				class={[
					'text-main-100 placeholder-main-500 w-full rounded border-0 bg-transparent px-1 py-0 text-center text-xs outline-none',
					'transition-opacity duration-200 starting:opacity-0'
				]}
				id="ghost-handle-input"
				bind:this={inputRef}
			/>
		{:else}
			<span
				class={[
					'align-middle font-sans font-bold',
					'transition-opacity duration-300 starting:opacity-0'
				]}
			>
				<IconPlus class="size-3.5" />
			</span>
		{/if}
	</Handle>
</div>
