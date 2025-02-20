<script lang="ts">
	// @ts-nocheck
	import { useSvelteFlow } from '@xyflow/svelte'

	import Button from '$lib/components/atoms/Button.svelte'

	import IconPlay from '~icons/material-symbols/play-arrow-outline-rounded'
	import IconFitScreen from '~icons/material-symbols/filter-center-focus-outline'

	import { closeWindowById, openWindow, windowIsOpen } from '$lib/stores/windows.svelte'

	import Execution from '../windows/ExecutionWindow.svelte'

	const { fitView } = useSvelteFlow()

	const tools = [
		{
			icon: IconPlay,
			label: 'Execute',
			toggled: () => windowIsOpen('execution'),
			onClick: () => {
				if (windowIsOpen('execution')) {
					closeWindowById('execution')
				} else {
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
		}
	]
</script>

<div
	class="
		bg-zinc-850 absolute bottom-8 left-1/2 z-50 flex -translate-x-1/2
		justify-between gap-x-2 rounded-md border border-zinc-800 px-2 shadow-lg
	"
>
	<div class="relative col-start-2 mx-auto flex items-center gap-x-2 py-2">
		{#each tools as { icon: Icon, onClick, label, toggled }}
			<Button variation="link" {onClick} tooltip={label} toggled={toggled()}>
				{#snippet icon()}
					<Icon class="size-[24px]" />
				{/snippet}
			</Button>
		{/each}
	</div>

	<div class="ms-auto flex items-center gap-x-4">
		<div class="flex items-center">
			<Button
				variation="link"
				tooltip="Fit to screen"
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
