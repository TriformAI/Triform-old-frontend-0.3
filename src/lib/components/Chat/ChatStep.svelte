<script lang="ts">
	import { type StepData, type WidgetCompleteCallback } from '$lib/stores/chat.svelte'
	import ChatMessage from './ChatMessage.svelte'
	import ChatStep from './ChatStep.svelte'
	import IconCompleted from '~icons/mdi/checkbox-marked-circle'
	import Spinner from '../Spinner.svelte'
	import IconError from '~icons/mdi/alert-circle'
	import ChatWidget from './ChatWidget.svelte'
	import Disclosure from '../atoms/Disclosure.svelte'
	import IconInput from '~icons/material-symbols/input-circle-rounded'
	import IconOutput from '~icons/material-symbols/output-circle-rounded'
	import CodeViewer from '../common/CodeViewer.svelte'

	const {
		item,
		onWidgetComplete
	}: {
		item: StepData
		onWidgetComplete: WidgetCompleteCallback
	} = $props()

	let previousCompleted = $state(item.completed)
	let hasEverHadChildren = $state(false)

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

	let isOpen = $state(false)

	// Auto-open when children are first added (if not completed)
	$effect(() => {
		if (!hasEverHadChildren && isCollapsible && item.children.length && !item.completed) {
			hasEverHadChildren = true
			isOpen = true
		}
	})

	// Close when transitioning to completed (if currently open)
	$effect(() => {
		if (!previousCompleted && item.completed && isOpen) {
			isOpen = false
		}
		previousCompleted = item.completed
	})

	const isCollapsible = $derived(item.children.length || item.input || item.output)

	const stepIconClasses = 'size-4 shrink-0'
</script>

<div class="grid gap-2">
	{#if !isCollapsible}
		<!-- Step with no children - render as before -->
		<p class="text-main-300 grid grid-cols-[auto_1fr] items-start gap-1.5">
			{#if item.event === 'started' && !item.completed}
				<Spinner class={[stepIconClasses, 'text-main-400'].join(' ')} />
			{:else if item.status === 'success'}
				<IconCompleted class={[stepIconClasses, 'text-main-300'].join(' ')} />
			{:else if item.status === 'error'}
				<IconError class={[stepIconClasses, 'text-danger-400'].join(' ')} />
			{/if}
			{item.title}
		</p>
	{:else}
		<!-- Step with children - make it collapsible -->
		<Disclosure bind:open={isOpen} showChevron={true}>
			{#snippet trigger()}
				{#if item.event === 'started' && !item.completed}
					<Spinner class={[stepIconClasses, 'text-main-400'].join(' ')} />
				{:else if item.status === 'success'}
					<IconCompleted class={[stepIconClasses, 'text-main-300/90'].join(' ')} />
				{:else if item.status === 'error'}
					<IconError class={[stepIconClasses, 'text-danger-400'].join(' ')} />
				{/if}
				<span class="text-left">
					{titleToShow}
				</span>
			{/snippet}
			<div class="pt-2">
				<div class="border-main-700 ml-1.5 border-l pl-4">
					{#if item.input}
						<Disclosure showChevron={true}>
							{#snippet trigger()}
								<span
									class="text-main-500 group-hover/trigger:text-main-300 in-[.open]:text-main-300 transition"
								>
									<IconInput class={[stepIconClasses, 'mr-1 inline rotate-90'].join(' ')} />
									Input
								</span>
							{/snippet}
							<CodeViewer value={JSON.stringify(item.input, null, 2)} class="my-2" />
						</Disclosure>
					{/if}
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
					{#if item.output}
						<Disclosure showChevron={true}>
							{#snippet trigger()}
								<span
									class="text-main-500 group-hover/trigger:text-main-300 in-[.open]:text-main-300 transition"
								>
									<IconOutput class={[stepIconClasses, 'mr-1 inline rotate-90'].join(' ')} />
									Output
								</span>
							{/snippet}
							<CodeViewer value={JSON.stringify(item.output, null, 2)} class="my-2" />
						</Disclosure>
					{/if}
				</div>
			</div>
		</Disclosure>
	{/if}
</div>
