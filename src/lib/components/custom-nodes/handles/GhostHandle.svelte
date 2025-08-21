<script lang="ts">
	import { addPort } from '$lib/stores/canvas.svelte'
	import { clickOutside } from '$lib/utils/clickOutside'
	import { Handle } from '@xyflow/svelte'
	import { Position } from '@xyflow/svelte'

	interface Props {
		class?: string
		type: 'source' | 'target'
		nodeId?: string
	}
	const { type, class: classes, nodeId }: Props = $props()

	let inputRef = $state<HTMLInputElement>()
	let isAddingPort = $state(false)
	let newPortName = $state('')

	// turn the handle into a text field
	const initAddPort = () => {
		isAddingPort = true
		newPortName = ''
		setTimeout(() => inputRef?.focus(), 100)
	}

	// actually add the port after the user has finished typing
	const finalisePort = async () => {
		if (!nodeId) return
		await addPort(nodeId, newPortName, { type: 'string' }, type === 'target' ? 'input' : 'output')
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
		position={type === 'source' ? Position.Bottom : Position.Top}
		class={[
			'!bg-main-900 !border-main-500 z-10 flex origin-bottom-left items-center justify-center border !border-dashed transition-[width,height,transform,scale,color] duration-200 ease-in-out',
			isAddingPort
				? '!h-8 !w-28 !rounded-md !p-1'
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
				placeholder="new_io_name"
				class={[
					'text-main-100 placeholder-main-500 w-full rounded border-0 bg-transparent px-1 py-0 text-center text-xs outline-none',
					'transition-opacity duration-200 starting:opacity-0'
				]}
				bind:this={inputRef}
			/>
		{:else}
			<span
				class={[
					'mt-[-3px] align-middle font-sans font-bold',
					'transition-opacity duration-300 starting:opacity-0'
				]}
			>
				+
			</span>
		{/if}
	</Handle>
</div>
