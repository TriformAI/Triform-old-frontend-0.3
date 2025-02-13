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
	import Execution from './windows/ExecutionWindow.svelte'
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
					component: Execution,
					posX: 20,
					posY: 20
				})
			}
		}
		// {
		// 	icon: IconCategory,
		// 	onClick: () => {
		// 		openWindow({
		// 			// Only one can be open rn, change this to a unique id
		// 			// if you want multiple component toolboxes
		// 			id: 'components-toolbox',
		// 			component: ComponentsToolbox
		// 		})
		// 	}
		// }
	]

	let selected = $state([])

	// $inspect(selected)
</script>

<div
	class="bg-zinc-850 flex w-full items-center justify-between border-b border-b-zinc-700 px-7 py-0 text-zinc-100"
>
	<!-- Central Tools  -->
	<div class="relative flex items-center gap-x-2 py-3">
		{#each tools as { icon: Icon, onClick }}
			<Button {onClick}>
				{#snippet icon()}
					<Icon class="size-6" />
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
	</div>

	<!-- Zoom in Zoom out Fit screen -->
	<div class="flex items-center gap-x-4">
		<div class="flex items-center gap-x-2">
			<Button
				variation="link"
				onClick={() => {
					zoomIn({ duration: 500 })
				}}
			>
				{#snippet icon()}
					<IconZoomIn />
				{/snippet}
			</Button>
			<Button
				variation="link"
				onClick={() => {
					zoomOut({ duration: 500 })
				}}
			>
				{#snippet icon()}
					<IconZoomOut />
				{/snippet}
			</Button>
			<Button
				variation="link"
				onClick={() => {
					fitView({
						maxZoom: 1,
						duration: 500
					})
				}}
			>
				{#snippet icon()}
					<IconFitScreen />
				{/snippet}
			</Button>
		</div>
	</div>
</div>
