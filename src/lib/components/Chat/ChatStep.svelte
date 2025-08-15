<script lang="ts">
	import { type StepEventData } from './chatStore.svelte'
	import ChatMessage from './ChatMessage.svelte'
	import ChatStep from './ChatStep.svelte'
	import IconCompleted from '~icons/mdi/checkbox-marked-circle'
	import IconPlay from '~icons/mdi/play'

	interface Props {
		item: StepEventData
	}

	const { item }: Props = $props()
</script>

<div class="grid gap-2">
	<p class="grid grid-cols-[auto_1fr] items-center gap-1">
		{#if item.event === 'started'}
			<IconPlay class="size-4" />
		{:else if item.event === 'completed'}
			<IconCompleted class="size-4" />
		{/if}
		{item.title}
	</p>

	{#if item.children.length}
		<ul class="mb-1 ml-4.5 grid gap-2">
			{#each item.children as child}
				<li>
					{#if child.type === 'step_event'}
						<ChatStep item={child} />
					{:else if child.type === 'message'}
						<ChatMessage item={child} />
					{/if}
				</li>
			{/each}
		</ul>
	{/if}
</div>
