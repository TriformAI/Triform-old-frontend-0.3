<script lang="ts">
	// @ts-nocheck
	import { useSvelteFlow } from '@xyflow/svelte'
	import { closeWindowById, openWindow, windowIsOpen } from '$lib/stores/windows.svelte'

	import Button from '$lib/components/atoms/Button.svelte'

	import IconPlay from '~icons/material-symbols/play-arrow-outline-rounded'
	import IconFitScreen from '~icons/material-symbols/filter-center-focus-outline'
	// import IconSave from '~icons/material-symbols/save-outline-rounded'

	import Execution from '../panels/items/Execute/Root.svelte'

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

	const actions = [
		{
			icon: IconFitScreen,
			label: 'Fit to screen',
			show: () => true,
			onClick: () => {
				fitView({
					maxZoom: 1,
					duration: 500
				})
			}
		}
		// {
		// 	icon: IconSave,
		// 	label: 'Save project',
		// 	onClick: saveProject,
		// 	show: () => currentCanvas.hasUnsavedChanges,
		// 	class: 'enabled:text-warning-400/90 hover:enabled:text-warning-500'
		// }
	]
</script>

<div
	class="
		bg-main-850 border-main-800 shadow-window divide-main-800 absolute bottom-8 left-1/2
		z-50 flex -translate-x-1/2 justify-between gap-x-1 divide-x rounded-md border px-2
	"
>
	<div class="relative col-start-2 mx-auto flex items-center gap-x-2 py-2 pr-2">
		{#each tools as { icon: Icon, onClick, label, toggled }}
			<Button variation="link" {onClick} tooltip={label} toggled={toggled()}>
				{#snippet icon()}
					<Icon class="size-[24px]" />
				{/snippet}
			</Button>
		{/each}
	</div>

	<div class="flex items-center gap-x-2 pl-2">
		{#each actions as { icon: Icon, onClick, label, class: classProp, show }}
			<Button
				variation="link"
				{onClick}
				tooltip={label}
				autoLoad="promise"
				class={`${show() ? 'ml-0 w-fit' : `pointer-events-none -ml-8 w-0 opacity-0`} transition-all duration-300 ${classProp}`}
			>
				{#snippet icon()}
					<Icon class="size-[20px]" />
				{/snippet}
			</Button>
		{/each}
	</div>
</div>
