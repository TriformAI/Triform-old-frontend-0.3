<script lang="ts">
	import { type StepData } from '$lib/stores/chat.svelte'
	import ChatMessage from './ChatMessage.svelte'
	import ChatStep from './ChatStep.svelte'
	import IconCompleted from '~icons/mdi/checkbox-marked-circle'
	import Spinner from '../Spinner.svelte'
	import IconChevronDown from '~icons/mdi/chevron-down'
	import IconError from '~icons/mdi/alert-circle'
	import ChatWidget from './ChatWidget.svelte'

	const {
		item,
		onWidgetComplete
	}: {
		item: StepData
		onWidgetComplete?: () => void | Promise<void>
	} = $props()

	let detailsElement = $state<HTMLDetailsElement>()
	let isCollapsed = $state(false)
	let wasAutoClosedOnCompletion = $state(false)

	// Get the newest nested step for collapsed display
	const newestNestedStep = $derived.by(() => {
		const nestedSteps = item.children.filter(child => child.type === 'step')
		return nestedSteps.length > 0 ? nestedSteps[nestedSteps.length - 1] : null
	})

	// Determine what title to show based on completion and collapse state
	const titleToShow = $derived.by(() => {
		// If completed, always show parent title
		if (item.completed) return item.title

		// If not completed and collapsed, show newest nested step title
		if (isCollapsed && newestNestedStep) return newestNestedStep.title

		// Otherwise show parent title
		return item.title
	})

	// Automatically close when step completes (but only once)
	$effect(() => {
		if (item.completed && !wasAutoClosedOnCompletion && detailsElement && detailsElement.open) {
			detailsElement.open = false
			isCollapsed = true
			wasAutoClosedOnCompletion = true
		}
	})

	// Handle toggle event to track collapse state
	function handleToggle() {
		if (detailsElement) {
			isCollapsed = !detailsElement.open
		}
	}
</script>

<div class="grid gap-2">
	{#if item.children.length === 0}
		<!-- Step with no children - render as before -->
		<p class="text-main-300 grid grid-cols-[auto_1fr] items-center gap-1.5">
			{#if item.event === 'started' && !item.completed}
				<Spinner class="text-main-400 size-4" />
			{:else if item.status === 'success'}
				<IconCompleted class="text-main-300 size-4" />
			{:else if item.status === 'error'}
				<IconError class="text-danger-400 size-4" />
			{/if}
			{item.title}
		</p>
	{:else}
		<!-- Step with children - make it collapsible -->
		<details bind:this={detailsElement} ontoggle={handleToggle} open class="group">
			<summary
				class="text-main-300 group/summary grid cursor-pointer list-none grid-cols-[auto_1fr] items-center gap-1.5"
			>
				{#if item.event === 'started' && !item.completed}
					<Spinner class="text-main-400 size-4" />
				{:else if item.status === 'success'}
					<IconCompleted class="text-main-300 size-4" />
				{:else if item.status === 'error'}
					<IconError class="text-danger-400 size-4" />
				{/if}
				<div>
					<span>
						{titleToShow}
					</span>
					<IconChevronDown
						class="text-main-600 group-hover/summary:text-main-300 group-open:text-main-400 inline size-4 -rotate-90 transition-all duration-200 group-open:rotate-0"
					/>
				</div>
			</summary>

			<div class="details-content overflow-hidden">
				<ul class="mt-2 mb-1 ml-4.5 grid gap-2">
					{#each item.children as child}
						<li>
							{#if child.type === 'step'}
								<ChatStep item={child} {onWidgetComplete} />
							{:else if child.type === 'message'}
								<ChatMessage item={child} />
							{:else if child.type === 'widget'}
								<ChatWidget item={child} onComplete={onWidgetComplete} />
							{/if}
						</li>
					{/each}
				</ul>
			</div>
		</details>
	{/if}
</div>

<style>
	details .details-content {
		transition:
			max-height 0.2s ease-out,
			opacity 0.15s ease-out;
		max-height: auto;
		transition-behavior: allow-discrete;
		opacity: 1;
	}

	details:not([open]) .details-content {
		max-height: 0;
		opacity: 0;
		transition:
			max-height 0.2s ease-in,
			opacity 0.15s ease-in;
	}
</style>
