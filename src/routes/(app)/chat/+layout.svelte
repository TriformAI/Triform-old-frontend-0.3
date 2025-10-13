<script lang="ts">
	import Navbar from '$lib/components/Navbar.svelte'
	import 'balloon-css'
	import { page } from '$app/state'
	import GridResizerHandle from '$lib/components/GridResizerHandle.svelte'
	import NewChatIcon from '~icons/material-symbols/edit-square-rounded'
	import MenuIcon from '~icons/material-symbols/menu-rounded'
	import TuneIcon from '~icons/material-symbols/tune-rounded'
	import CloseIcon from '~icons/material-symbols/close-rounded'
	import { goto } from '$app/navigation'
	import Button from '$lib/components/atoms/Button.svelte'
	import { setThreads, threads } from '$lib/stores/triggerChat.svelte'
	import { onMount, type Snippet } from 'svelte'
	import { fly, slide } from 'svelte/transition'
	import { formatRelativeDate } from '$lib/utils/formatRelativeDate'
	import ChatToolsSelector from '$lib/components/Chat/ChatToolsSelector.svelte'
	import type { PageData } from './$types.js'

	const { children, data }: { children: Snippet; data: PageData } = $props()

	onMount(() => setThreads(data.threads ?? []))
	const toolboxes = $derived(data.toolboxes ?? [])

	const threadId = $derived(page.params.id)

	let gridContainer = $state<HTMLDivElement>()

	let isLeftOpen = $state(false)
	let isRightOpen = $state(false)

	const DEFAULT_PANEL_WIDTH = 300
	const GUTTER_SIZE = 8

	let chatPanelWidth = $state(
		Number(localStorage.getItem('trichatPanelWidth') || DEFAULT_PANEL_WIDTH)
	)

	let toolsPanelWidth = $state(
		Number(localStorage.getItem('chatToolsPanelWidth') || DEFAULT_PANEL_WIDTH)
	)

	const gridStyle = $derived.by(
		() =>
			`grid-template-columns: ${chatPanelWidth}px ${GUTTER_SIZE}px 1fr ${GUTTER_SIZE}px ${toolsPanelWidth}px`
	)
</script>

<svelte:head>
	<title>Chat | Triform</title>
</svelte:head>

<div class="grid h-dvh grid-rows-[auto_1fr]">
	<Navbar>
		{#snippet extras()}
			<div class="flex items-center gap-2 md:hidden">
				<Button variation="ghost" onClick={() => (isLeftOpen = true)} class="px-2 py-1">
					<MenuIcon class="size-5" />
				</Button>
				<Button variation="ghost" onClick={() => (isRightOpen = true)} class="px-2 py-1">
					<TuneIcon class="size-5" />
				</Button>
			</div>
		{/snippet}
	</Navbar>

	<main class="min-h-0">
		<div bind:this={gridContainer} style={gridStyle} class="block h-full min-h-0 px-2 py-2 md:grid">
			<div
				class="md:bg-main-950/60 border-main-800 row-span-3 hidden h-full min-h-0 flex-col gap-6 rounded-lg border md:flex"
			>
				<div class="flex flex-1 flex-col gap-2 overflow-x-hidden overflow-y-auto p-2">
					<Button variation="ghost" onClick={() => goto('/chat')} class="text-main-300">
						{#snippet icon()}
							<NewChatIcon class="size-4" />
						{/snippet}
						<span class="truncate text-sm">New chat</span>
					</Button>
					{#each threads as thread (thread.id)}
						{@const isActive = threadId === thread.id}
						<a
							class={[
								'border-main-800 flex flex-col gap-2 rounded-md border px-4 py-3',
								'hover:bg-main-900 transition active:scale-[97%]',
								isActive ? 'bg-main-900/80' : 'bg-main-950/60'
							]}
							href={`/chat/${thread.id}`}
							transition:slide={{ axis: 'y', duration: 350 }}
						>
							<div
								class={[
									'truncate text-sm transition',
									isActive ? 'text-main-200' : 'text-main-400'
								]}
							>
								{thread.title}
							</div>
							<div class={['text-sm transition', isActive ? 'text-main-400' : 'text-main-500']}>
								{formatRelativeDate(new Date(thread.createdAt))}
							</div>
						</a>
					{/each}
				</div>
			</div>
			<div class="hidden md:block">
				<GridResizerHandle
					name="trichatPanel"
					axis="x"
					side="left"
					bind:size={chatPanelWidth}
					gutterSize={GUTTER_SIZE}
					{gridContainer}
				/>
			</div>
			<div class="row-span-3 grid h-full min-h-0 grid-cols-[1fr] overflow-y-hidden">
				{#key page.params.id}
					<div
						in:fly={{ y: 20, duration: 350, delay: 100 }}
						out:fly={{ y: -20, duration: 350 }}
						class="col-start-1 row-start-1 h-full min-h-0 overflow-y-auto"
					>
						{@render children()}
					</div>
				{/key}
			</div>
			<div class="hidden md:block">
				<GridResizerHandle
					name="chatToolsPanel"
					axis="x"
					side="right"
					bind:size={toolsPanelWidth}
					gutterSize={GUTTER_SIZE}
					{gridContainer}
				/>
			</div>
			<div
				class="bg-main-950/60 border-main-800 row-span-3 hidden h-full min-h-0 flex-col overflow-hidden rounded-lg border md:flex"
			>
				<div class="bg-main-950 border-main-850 border-b p-4 pt-3">
					<h3 class="text-main-300 text-base font-semibold">Available toolboxes</h3>
					<p class="text-main-400 text-sm">
						These are projects where the Chat trigger is enabled. Each top-level node in the project
						will be available as a tool.
					</p>
				</div>
				<ChatToolsSelector {toolboxes} />
			</div>
		</div>

		{#if isLeftOpen}
			<div class="fixed inset-0 z-50 md:hidden" role="dialog" aria-modal="true">
				<button
					type="button"
					class="absolute inset-0 bg-black/60"
					onclick={() => (isLeftOpen = false)}
					aria-label="Close overlay"
				></button>
				<div class="absolute inset-0">
					<div
						in:fly={{ x: -40, duration: 250 }}
						out:fly={{ x: -40, duration: 200 }}
						class="bg-main-950/60 border-main-800 h-full min-h-0 w-full overflow-hidden rounded-none border-r-0 border-l-0"
					>
						<div class="bg-main-950 border-main-850 flex items-center justify-between border-b p-3">
							<h3 class="text-main-300 text-base font-semibold">Chats</h3>
							<Button variation="ghost" onClick={() => (isLeftOpen = false)} class="px-2 py-1">
								<CloseIcon class="size-5" />
							</Button>
						</div>
						<div
							class="flex h-[calc(100%-3rem)] flex-col gap-2 overflow-x-hidden overflow-y-auto p-2"
						>
							<Button
								variation="ghost"
								onClick={() => {
									isLeftOpen = false
									goto('/chat')
								}}
								class="text-main-300"
							>
								{#snippet icon()}
									<NewChatIcon class="size-4" />
								{/snippet}
								<span class="truncate text-sm">New chat</span>
							</Button>
							{#each threads as thread (thread.id)}
								{@const isActive = threadId === thread.id}
								<a
									class={[
										'border-main-800 flex flex-col gap-2 rounded-md border px-4 py-3',
										'hover:bg-main-900 transition active:scale-[97%]',
										isActive ? 'bg-main-900/80' : 'bg-main-950/60'
									]}
									href={`/chat/${thread.id}`}
									onclick={() => (isLeftOpen = false)}
									transition:slide={{ axis: 'y', duration: 300 }}
								>
									<div
										class={[
											'truncate text-sm transition',
											isActive ? 'text-main-200' : 'text-main-400'
										]}
									>
										{thread.title}
									</div>
									<div class={['text-sm transition', isActive ? 'text-main-400' : 'text-main-500']}>
										{formatRelativeDate(new Date(thread.createdAt))}
									</div>
								</a>
							{/each}
						</div>
					</div>
				</div>
			</div>
		{/if}

		{#if isRightOpen}
			<div class="fixed inset-0 z-50 md:hidden" role="dialog" aria-modal="true">
				<button
					type="button"
					class="absolute inset-0 bg-black/60"
					onclick={() => (isRightOpen = false)}
					aria-label="Close overlay"
				></button>
				<div class="absolute inset-0">
					<div
						in:fly={{ x: 40, duration: 250 }}
						out:fly={{ x: 40, duration: 200 }}
						class="bg-main-950/60 border-main-800 h-full min-h-0 w-full overflow-hidden rounded-none border-r-0 border-l-0"
					>
						<div class="bg-main-950 border-main-850 flex items-center justify-between border-b p-3">
							<h3 class="text-main-300 text-base font-semibold">Available toolboxes</h3>
							<Button variation="ghost" onClick={() => (isRightOpen = false)} class="px-2 py-1">
								<CloseIcon class="size-5" />
							</Button>
						</div>
						<div class="h-[calc(100%-3rem)] overflow-y-auto">
							<ChatToolsSelector {toolboxes} />
						</div>
					</div>
				</div>
			</div>
		{/if}
	</main>
</div>

<svelte:window
	on:keydown={e => {
		if (e.key === 'Escape') {
			isLeftOpen = false
			isRightOpen = false
		}
	}}
/>
