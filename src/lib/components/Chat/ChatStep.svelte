<script lang="ts">
	import { type StepData, type WidgetCompleteCallback } from '$lib/stores/chat.svelte'
	import ChatMessage from './ChatMessage.svelte'
	import ChatStep from './ChatStep.svelte'
	import IconCompleted from '~icons/mdi/checkbox-marked-circle'
	import Spinner from '../Spinner.svelte'
	import IconChevronDown from '~icons/mdi/chevron-down'
	import IconError from '~icons/mdi/alert-circle'
	import ChatWidget from './ChatWidget.svelte'
	import Disclosure from '../atoms/Disclosure.svelte'

	const {
		item,
		onWidgetComplete
	}: {
		item: StepData
		onWidgetComplete: WidgetCompleteCallback
	} = $props()

	let previousCompleted = $state(item.completed)

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
		if (!isOpen && newestNestedStep) return newestNestedStep.title

		// Otherwise show parent title
		return item.title
	})

	// Close when transitioning to completed (if currently open)
	$effect(() => {
		if (!previousCompleted && item.completed && isOpen) {
			isOpen = false
		}
		previousCompleted = item.completed
	})

	let isOpen = $state(!item.completed)
	const isCollapsible = $derived(item.children.length)
</script>

<div class="grid gap-2">
	{#if !isCollapsible}
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
		<Disclosure bind:open={isOpen}>
			{#snippet trigger()}
				{#if item.event === 'started' && !item.completed}
					<Spinner class="text-main-400 size-4" />
				{:else if item.status === 'success'}
					<IconCompleted class="text-main-300/90 size-4" />
				{:else if item.status === 'error'}
					<IconError class="text-danger-400 size-4" />
				{/if}
				<div>
					<span>
						{titleToShow}
					</span>
					<IconChevronDown
						class={[
							'text-main-600 group-hover/summary:text-main-300 group-open:text-main-400 inline size-4 transition-all duration-200',
							isOpen ? 'rotate-0' : '-rotate-90'
						].join(' ')}
					/>
				</div>
			{/snippet}
			<div class="ml-2">
				<ul class="mt-1 grid gap-2 py-1">
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
		</Disclosure>
	{/if}
</div>
