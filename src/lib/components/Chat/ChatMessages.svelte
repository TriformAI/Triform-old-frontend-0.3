<script lang="ts">
	import ChatItem from './ChatItem.svelte'
	import LogoSpinner from '$lib/components/SpinnerLogo.svelte'
	import type { ParsedItem } from '$lib/stores/chat.svelte'

	let {
		container = $bindable(),
		items,
		isWaitingForAssistant,
		useCanvasContext = true,
		class: classes = []
	}: {
		container?: HTMLElement
		items: ParsedItem[]
		isWaitingForAssistant: boolean
		useCanvasContext?: boolean
		class?: string[]
	} = $props()
</script>

<div
	class={['scroll-fade-y grid h-full items-start overflow-y-auto p-4', ...classes]}
	bind:this={container}
>
	<ul class="chat grid gap-4 pb-6 text-sm">
		{#each items as item}
			<ChatItem {item} {useCanvasContext} />
		{/each}

		<li>
			<span
				class={[
					'flex items-center gap-1.5 font-medium transition-opacity duration-200',
					isWaitingForAssistant ? 'opacity-100 delay-300' : 'opacity-0'
				]}
			>
				<LogoSpinner class="size-5" />
			</span>
		</li>
	</ul>
</div>
