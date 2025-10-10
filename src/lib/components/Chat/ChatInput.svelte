<script lang="ts">
	import Button from '../atoms/Button.svelte'
	import HighlightableTextarea from '../atoms/HighlightableTextarea.svelte'
	import ChatMention, { type Item } from './ChatMention.svelte'
	import IconClose from '~icons/material-symbols/close-rounded'
	import { blur, fly } from 'svelte/transition'
	import type { ComponentType } from 'svelte'

	export type Highlight = {
		text: string
		fill: string
		border: string
	}

	export type ContextChip = {
		key: string
		label: string
		icon?: ComponentType
		iconClass?: string
	}

	let {
		message = $bindable(''),
		textarea = $bindable<HTMLTextAreaElement | undefined>(),
		enableContextMentions = false,
		isOpen = $bindable(false),
		placeholder = 'Build something magical',
		nodeList = [],
		contextChips = [],
		highlights = [],
		isWaitingForAssistant = false,
		isLoading = false,
		onMentionSelected,
		onMentionClose,
		onRemoveContext,
		onTextareaKeydown,
		onTextareaInput,
		onTextareaMousedown,
		onSubmit,
		onCancel
	}: {
		message: string
		textarea?: HTMLTextAreaElement
		enableContextMentions?: boolean
		isOpen: boolean
		placeholder?: string
		nodeList: Item[]
		contextChips: ContextChip[]
		highlights: Highlight[]
		isWaitingForAssistant: boolean
		isLoading?: boolean
		onMentionSelected: (id: string) => void
		onMentionClose: () => void
		onRemoveContext: (key: string) => void
		onTextareaKeydown: (event: KeyboardEvent) => void
		onTextareaInput: () => void
		onTextareaMousedown: () => void
		onSubmit: () => void
		onCancel: () => void
	} = $props()

	const handleSubmit = (event: Event) => {
		event.preventDefault()
		if (isWaitingForAssistant) onCancel()
		else onSubmit()
	}
</script>

<form onsubmit={handleSubmit} class="input-text relative grid grid-rows-[1fr_auto] gap-2">
	{#if enableContextMentions && isOpen}
		<div
			class="absolute inset-x-0 bottom-[calc(100%+0.25rem)]"
			transition:fly={{ y: 10, opacity: 0, duration: 200 }}
		>
			<ChatMention
				items={nodeList}
				onSelected={onMentionSelected}
				bind:isOpen
				onClose={onMentionClose}
			/>
		</div>
	{/if}

	{#if enableContextMentions}
		<div class="-ml-0.5 flex flex-row flex-wrap items-center justify-start gap-1">
			<Button
				variation="primary"
				type="button"
				class="text-main-400 shrink-0 px-2 py-1.5 text-xs"
				onClick={() => (isOpen = true)}
				fastClick={true}
				tooltip="Add a node to the context"
				tooltipPos="right"
			>
				@
			</Button>
			{#each contextChips as chip}
				<div
					class="text-main-300 border-main-800 bg-main-850 hover:border-main-700 hover:text-main-200 group/item flex flex-row items-center gap-1.5 rounded-md border px-2 py-1 text-sm transition"
				>
					<div class="relative grid grid-cols-[1fr]">
						{#if chip.icon}
							<chip.icon
								class={`col-start-1 row-start-1 mx-0.5 block size-3 transition group-hover/item:hidden starting:scale-0 starting:opacity-0 ${chip.iconClass ?? ''}`}
							/>
						{/if}
						<button
							onclick={() => onRemoveContext(chip.key)}
							class="text-main-400 hover:text-main-200 col-start-1 row-start-1 hidden h-full transition group-hover/item:block starting:scale-0 starting:opacity-0"
							type="button"
						>
							<IconClose class="size-4" />
						</button>
					</div>
					{chip.label}
				</div>
			{/each}
		</div>
	{/if}

	<HighlightableTextarea
		bind:textarea
		bind:value={message}
		onkeydown={onTextareaKeydown}
		oninput={onTextareaInput}
		onmousedown={onTextareaMousedown}
		class="!z-0 field-sizing-content max-h-30 min-h-16 w-full resize-none pb-2 outline-0"
		{placeholder}
		{highlights}
	/>

	<Button
		variation={isWaitingForAssistant ? 'warning' : 'vibrant'}
		type="submit"
		class="ms-auto -me-2 -mb-1 px-2 py-1 text-sm"
		{isLoading}
	>
		<div class="grid grid-cols-[1fr] grid-rows-[1fr]">
			{#if !isWaitingForAssistant}
				<div
					class="col-start-1 row-start-1 flex items-center gap-0.5"
					transition:blur={{ duration: 500 }}
				>
					Send
					<kbd>↵</kbd>
				</div>
			{:else}
				<div class="col-start-1 row-start-1" transition:blur={{ duration: 500 }}>Cancel</div>
			{/if}
		</div>
	</Button>
</form>
