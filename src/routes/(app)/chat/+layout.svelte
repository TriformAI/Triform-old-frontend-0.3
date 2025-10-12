<script lang="ts">
	import Navbar from '$lib/components/Navbar.svelte'
	import 'balloon-css'
	import { page } from '$app/state'
	import GridResizerHandle from '$lib/components/GridResizerHandle.svelte'
	import NewChatIcon from '~icons/material-symbols/edit-square-rounded'
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
	<Navbar />

	<main class="min-h-0">
		<div bind:this={gridContainer} style={gridStyle} class="grid h-full min-h-0 px-2 py-2">
			<div
				class="bg-main-950/60 border-main-800 row-span-3 flex h-full min-h-0 flex-col gap-6 rounded-lg border"
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
			<GridResizerHandle
				name="trichatPanel"
				axis="x"
				side="left"
				bind:size={chatPanelWidth}
				gutterSize={GUTTER_SIZE}
				{gridContainer}
			/>
			<div class="row-span-3 grid min-h-0 grid-cols-[1fr] overflow-y-hidden">
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
			<GridResizerHandle
				name="chatToolsPanel"
				axis="x"
				side="right"
				bind:size={toolsPanelWidth}
				gutterSize={GUTTER_SIZE}
				{gridContainer}
			/>
			<div
				class="bg-main-950/60 border-main-800 row-span-3 flex h-full min-h-0 flex-col overflow-hidden rounded-lg border"
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
	</main>
</div>
