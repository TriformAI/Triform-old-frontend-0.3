<script lang="ts">
	// @ts-nocheck
	import { useSvelteFlow } from '@xyflow/svelte'

	import Button from '$lib/components/atoms/Button.svelte'

	import IconPlay from '~icons/material-symbols/play-arrow-outline-rounded'
	import IconZoomOut from '~icons/material-symbols/zoom-out-rounded'
	import IconZoomIn from '~icons/material-symbols/zoom-in-rounded'
	import IconFitScreen from '~icons/material-symbols/filter-center-focus-outline'

	import { openWindow } from '$lib/stores/windows.svelte'

	import Execution from './windows/ExecutionWindow.svelte'

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
	]
</script>

<div
	class="grid w-full grid-cols-3 items-center border-b border-b-zinc-800 bg-zinc-900 px-7 py-0 text-zinc-100"
>
	<!-- Central Tools  -->
	<div class="relative col-start-2 mx-auto flex items-center gap-x-2 py-2">
		{#each tools as { icon: Icon, onClick }}
			<Button variation="primary" {onClick}>
				{#snippet icon()}
					<Icon class="size-[24px]" />
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
	<div class="ms-auto flex items-center gap-x-4">
		<div class="flex items-center">
			<Button
				variation="link"
				onClick={() => {
					zoomIn({ duration: 500 })
				}}
			>
				{#snippet icon()}
					<IconZoomIn class="size-[20px]" />
				{/snippet}
			</Button>

			<Button
				variation="link"
				onClick={() => {
					zoomOut({ duration: 500 })
				}}
			>
				{#snippet icon()}
					<IconZoomOut class="size-[20px]" />
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
					<IconFitScreen class="size-[20px]" />
				{/snippet}
			</Button>
		</div>
	</div>
</div>
