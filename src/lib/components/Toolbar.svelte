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
	import Dropdown from './common/Dropdown.svelte'
	import Select from './atoms/Select.svelte'

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

	const options = [
		{ id: 1, name: 'Wade Cooper' },
		{ id: 2, name: 'Arlene Mccoy' },
		{ id: 3, name: 'Devon Webb' },
		{ id: 4, name: 'Tom Cook' },
		{ id: 5, name: 'Tanya Fox' },
		{ id: 6, name: 'Hellen Schmidt' },
		{ id: 7, name: 'Caroline Schultz' },
		{ id: 8, name: 'Mason Heaney' },
		{ id: 9, name: 'Claudie Smitham' },
		{ id: 10, name: 'Emil Schaefer' }
	]

	let selected = $state([])

	$inspect(selected)
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
	<div class="relative flex items-center py-3 gap-x-2">
		{#each tools as { icon: Icon, onClick }}
			<Button {onClick}>
				{#snippet icon()}
					<Icon />
				{/snippet}
			</Button>
		{/each}
		<!-- <Dropdown>
			{#snippet button()}
				<span class="font-thin">Test</span>
			{/snippet}

			{#snippet body()}
				<ul>
					<li>
						<IconPlay /> Item 1
					</li>
					<li>
						<IconPlay /> Item 2
					</li>
					<li>
						<IconPlay /> Item 3
					</li>
				</ul>
				<ul>
					<li>
						<IconPlay /> Item 1
					</li>
					<li>
						<IconPlay /> Item 2
					</li>
					<li>
						<IconPlay /> Item 3
					</li>
				</ul>
			{/snippet}
		</Dropdown> -->
		<Select bind:selected {options} />
		{#if selected && selected.length > 0}
			{#each selected as { id, name }}
				<div>{name}</div>
			{/each}
		{/if}
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
