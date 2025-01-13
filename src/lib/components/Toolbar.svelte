<script lang="ts">
	// @ts-nocheck
	import { useSvelteFlow } from '@xyflow/svelte'

	import Button from '$lib/components/atoms/Button.svelte'

	import IconPlay from '~icons/material-symbols/play-arrow-outline-rounded'
	import IconCategory from '~icons/material-symbols/category-outline-rounded'
	import IconUndoRounded from '~icons/material-symbols/undo-rounded'
	import IconRedoRounded from '~icons/material-symbols/redo-rounded'
	import IconZoomOut from '~icons/material-symbols/zoom-out-rounded'
	import IconZoomIn from '~icons/material-symbols/zoom-in-rounded'
	import IconFitScreen from '~icons/material-symbols/fit-screen-outline-rounded'

	import { openWindow } from '$lib/stores/windows.svelte'

	import ComponentsToolbox from './windows/ComponentsToolbox.svelte'
	import Execution from './windows/Execution.svelte'

	const { zoomOut, zoomIn, fitView } = useSvelteFlow()

	const tools = [
		{
			icon: IconPlay,
			onClick: () => {
				openWindow({
					// Only one can be open rn, change this to a unique id
					// if you want multiple
					id: 'execution',
					component: Execution
				})
			}
		},
		{
			icon: IconCategory,
			onClick: () => {
				openWindow({
					// Only one can be open rn, change this to a unique id
					// if you want multiple component toolboxes
					id: 'components-toolbox',
					component: ComponentsToolbox
				})
			}
		}
	]
</script>

<div
	class="flex items-center justify-between w-full py-0 border-b px-7 border-b-zinc-700 text-zinc-100 bg-zinc-850"
>
	<!-- Canvas 1 dropdown -->
	<div class="flex items-center gap-x-5">
		<!-- Undo Redo -->
		<div class="flex items-center gap-x-2">
			<Button variation="link">
				{#snippet icon()}
					<IconUndoRounded />
				{/snippet}
			</Button>
			<Button variation="link">
				{#snippet icon()}
					<IconRedoRounded />
				{/snippet}
			</Button>
		</div>
	</div>

	<!-- Central Tools  -->
	<div class="relative flex items-center gap-x-2 py-3">
		{#each tools as { icon: Icon, onClick }}
			<Button {onClick}>
				{#snippet icon()}
					<Icon />
				{/snippet}
			</Button>
		{/each}
	</div>

	<!-- Zoom in Zoom out Fit screen -->
	<div class="flex items-center gap-x-4">
		<div class="flex items-center gap-x-2">
			<Button variation="link" onClick={zoomIn}>
				{#snippet icon()}
					<IconZoomIn />
				{/snippet}
			</Button>
			<Button variation="link" onClick={zoomOut}>
				{#snippet icon()}
					<IconZoomOut />
				{/snippet}
			</Button>
			<Button variation="link" onClick={fitView}>
				{#snippet icon()}
					<IconFitScreen />
				{/snippet}
			</Button>
		</div>
	</div>
</div>
