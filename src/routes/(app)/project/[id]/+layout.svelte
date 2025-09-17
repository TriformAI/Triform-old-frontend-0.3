<script lang="ts">
	import Flow from '$lib/components/canvas/Flow.svelte'
	import 'balloon-css'
	import GridResizerHandle from '$lib/components/GridResizerHandle.svelte'
	import { SvelteFlowProvider } from '@xyflow/svelte'
	import Navbar from '$lib/components/Navbar.svelte'
	import BreadCrumbs from '$lib/components/canvas/Breadcrumbs.svelte'
	import PropsPanel from '$lib/components/PropsPanel.svelte'
	import Confirm from '$lib/components/common/Confirm.svelte'
	import { loadComponents } from '$lib/stores/library.svelte'
	import {
		getProject,
		refreshFlow,
		setProject,
		updateLocalComponent,
		getCurrentContainer,
		getVisibleComponent,
		getBreadcrumbs
	} from '$lib/stores/canvas.svelte'
	import { chat } from '$lib/stores/chat.svelte'
	import { debounce } from '$lib/utils/debounce'
	import { onMount, untrack } from 'svelte'
	import { page } from '$app/state'
	import type * as z from 'zod'
	import { resolvedProjectModel } from '$lib/schemas'
	import { ingressTokens } from '$lib/stores/ingressTokens.svelte.js'
	import Chat from '$lib/components/Chat/Chat.svelte'
	import { WebSocket } from 'partysocket'
	import { socketEventModel } from '$lib/schemas/socket.js'
	import { setSocketId } from '$lib/stores/socket.svelte.js'
	import { isProject } from '$lib/schemas'
	import { onNavigate } from '$app/navigation'
	import type { OnNavigate } from '@sveltejs/kit'
	import { useUpdateNodeInternals } from '@xyflow/svelte'
	import { requirements } from '$lib/stores/requirements.svelte'
	import { selected } from '$lib/stores/panel.svelte.js'
	import { requirementsModel } from '$lib/schemas/requirements'
	import DeployButton from '$lib/components/DeployButton.svelte'
	import { nodeTypesDict } from '$lib/constants/nodeTypes.js'
	import type { NodeType } from '$lib/constants/nodeTypes.js'
	import { blur } from 'svelte/transition'

	const { data, children } = $props()

	let gridContainer = $state<HTMLDivElement>()
	let flowComponent = $state<Flow>()

	onMount(() => {
		loadComponents(data.components ?? [])

		// @ts-expect-error undefined
		return () => setProject(undefined)
	})

	// ensure project is set before anything else happens
	$effect.pre(() => {
		// don't replace the project if one is already loaded
		if (getProject()) return
		console.log('setting project', page.data.project)
		setProject(page.data.project as z.infer<typeof resolvedProjectModel>)
	})

	$effect.pre(() => {
		const ref = page.data.ingressTokens
		untrack(() => {
			ingressTokens.length = 0
			ingressTokens.push(...(ref ?? []))
		})
	})

	let isGoingDeeper = $state(false)

	onNavigate(async (navigation: OnNavigate) => {
		if (!navigation.to || !navigation.from) return
		const {
			to: {
				url: { pathname: toPath }
			},
			from: {
				url: { pathname: fromPath }
			}
		} = navigation
		// if there are more parts in the path we're going deeper 🌊
		isGoingDeeper = toPath.split('/').length > fromPath.split('/').length

		return
	})

	const DEFAULT_PROPS_PANEL_WIDTH = 600
	const DEFAULT_CHAT_PANEL_WIDTH = 300
	const DEFAULT_COMPONENT_PANEL_HEIGHT = 180
	const GUTTER_SIZE = 8

	let propsPanelWidth = $state(
		Number(localStorage.getItem('propsPanelWidth') || DEFAULT_PROPS_PANEL_WIDTH)
	)

	const defaultChatPanelWidth = Number(
		localStorage.getItem('chatPanelWidth') || DEFAULT_CHAT_PANEL_WIDTH
	)

	let chatPanelWidth = $state(6)

	let componentPanelHeight = $state(
		Number(localStorage.getItem('componentsLibPanelHeight') || DEFAULT_COMPONENT_PANEL_HEIGHT)
	)

	type Requirements = z.infer<typeof requirementsModel>

	// Updates requirements from socket for the currently selected component if component_id matches
	function updateRequirements(data: { component_id: string; requirements: Requirements }) {
		const currentComponent = getVisibleComponent(selected.node?.id ?? 'container')
		if (currentComponent?.id === data.component_id) {
			requirements.value = data.requirements
		}
	}

	async function handleMessage(data: z.infer<typeof socketEventModel>) {
		try {
			const payload = socketEventModel.parse(data)
			if (payload.event === 'component:updated') {
				await updateLocalComponent(payload.data.component)
				refreshFlow()
			} else if (payload.event === 'component:requirements:updated') {
				updateRequirements(payload.data)
			} else if (payload.event === 'project:updated') {
				setProject(payload.data.project)
				refreshFlow()
			} else if (payload.event === 'connected') {
				setSocketId(payload.data.id)
			}
		} catch (err) {
			console.error('error parsing message', err)
		}
	}

	onMount(() => {
		const ws = new WebSocket('/api/organizations/@me/socket')

		ws.onmessage = async e => {
			handleMessage(JSON.parse(e.data))
		}

		return () => {
			try {
				ws.close()
			} catch (err) {
				console.error('error closing socket', err)
			}
		}
	})

	const projectIsEmpty = $derived.by(() => {
		const container = getCurrentContainer()
		if (!container) return

		const { spec, resource } = container
		return resource.startsWith('project') && Object.keys(spec.nodes ?? {}).length === 0
	})

	const containerName = $derived(getCurrentContainer()?.meta.name)
	const containerType = $derived(getCurrentContainer()?.resource.split('/')[0] as NodeType)
	const containerSuffix = $derived.by(() => {
		console.log('containerType', containerType)
		if (containerType === 'project') return 'overview'
		if (containerType === 'flow') return 'flow'
		if (containerType === 'agent') return 'toolbox'
		return ''
	})
</script>

{@render children()}

<div class="grid h-dvh grid-rows-[auto_1fr]">
	<Navbar>
		<BreadCrumbs />

		{#snippet extras()}
			{#if !projectIsEmpty}
				<DeployButton />
			{/if}
		{/snippet}
	</Navbar>

	<main class="overflow-hidden">
		<SvelteFlowProvider>
			<div
				bind:this={gridContainer}
				style={`grid-template-columns: ${chatPanelWidth}px ${GUTTER_SIZE}px 1fr ${GUTTER_SIZE}px ${propsPanelWidth}px; grid-template-rows: 1fr`}
				class={`bg-main-850 grid h-full px-2 pt-1 pb-2 ease-(--easing-circ)`}
			>
				<Chat
					onMessage={() => {
						if (chat.data.length === 0) {
							setTimeout(() => {
								console.log('chatPanelWidth', chatPanelWidth)
								chatPanelWidth = defaultChatPanelWidth
							}, 50)
						}
					}}
				/>

				<GridResizerHandle
					name="chatPanel"
					axis="x"
					side="left"
					bind:size={chatPanelWidth}
					gutterSize={GUTTER_SIZE}
					{gridContainer}
					onResizeEnd={debounce(() => {
						flowComponent?.fitView({
							maxZoom: 1,
							duration: 500
						})
					}, 300)}
				/>

				<div
					class="bg-main-900 border-main-800 flow-container relative grid place-items-center overflow-hidden border"
				>
					{#key page.url.pathname}
						<Flow bind:this={flowComponent} {isGoingDeeper} />
					{/key}
					{#if containerName && containerType}
						{#key containerName + containerType}
							{@const containerTypeData =
								nodeTypesDict[[...getBreadcrumbs()].pop()?.type ?? 'project']}
							{@const Icon = nodeTypesDict[containerTypeData.type].icon}
							<div
								class={[
									'bg-main-950/10 border-main-800 absolute top-8 rounded-md border px-6 py-3 backdrop-blur-xs',
									'flex flex-row items-center gap-3',
									'text-main-300',
									'w-auto max-w-96 truncate transition-all'
								]}
							>
								<Icon class={['size-4', containerTypeData?.iconClasses]} />
								<span class="w-full truncate">
									{containerName}
									<span class="text-main-400">
										{containerSuffix}
									</span>
								</span>
							</div>
						{/key}
					{/if}
				</div>

				<GridResizerHandle
					name="propsPanel"
					axis="x"
					side="right"
					bind:size={propsPanelWidth}
					gutterSize={GUTTER_SIZE}
					{gridContainer}
					onResizeEnd={debounce(() => {
						flowComponent?.fitView({
							maxZoom: 1,
							duration: 500
						})
					}, 300)}
				/>

				<PropsPanel class={propsPanelWidth <= 30 ? 'border-main-850' : ''} />

				<!-- <GridResizerHandle
					name="componentsLibPanel"
					axis="y"
					side="bottom"
					bind:size={componentPanelHeight}
					gutterSize={GUTTER_SIZE}
					{gridContainer}
					onResizeEnd={debounce(() => {
						flowComponent?.fitView({
							maxZoom: 1,
							duration: 500
						})
					}, 300)}
				/>

				<ComponentLibrary class={propsPanelWidth <= 30 ? 'border-main-850' : ''} /> -->
			</div>
		</SvelteFlowProvider>
	</main>
</div>

<Confirm />

<style>
	.flow-container {
		border-radius: var(--radius-lg);
	}

	/* Disable rounding in firefox to prevent weird visual glitches */
	@-moz-document url-prefix() {
		.flow-container {
			border-radius: 0;
		}
	}
</style>
