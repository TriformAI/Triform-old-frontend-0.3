<script lang="ts">
	import IconAction from '~icons/mdi/rhombus'
	import Button from './Button.svelte'

	interface Action {
		label: string
		// typeof just some icon for typing
		icon: typeof IconAction
		isDangerous: boolean
		disabled?: () => Promise<boolean> | boolean
		onClick: (...args: any[]) => Promise<void> | void
	}

	interface Props {
		actions: Action[]
		onActionClick: (fn: Action['onClick']) => void
	}

	let { actions, onActionClick }: Props = $props()
</script>

<div
	data-context-menu-list
	class={[
		'bg-main-850 text-main-50 shadow-window origin-top-left scale-100 rounded-lg p-1 text-sm opacity-100 transition-all duration-300'
	]}
>
	<div class="grid">
		{#each actions as action}
			<Button
				onClick={async () => await onActionClick(action.onClick)}
				variation="link"
				class={['list-btn justify-start', action.isDangerous ? 'list-btn--danger' : '']}
				disabled={await action.disabled?.()}
				autoLoad="promise"
			>
				{#snippet icon()}
					<action.icon class="size-5.5 shrink-0" />
				{/snippet}

				{#snippet body()}
					{action.label}
				{/snippet}
			</Button>
		{/each}
	</div>
</div>

<style>
	[data-context-menu-list] {
		@starting-style {
			transform: scale(0.9);
			opacity: 0;
		}
	}
</style>
