<script lang="ts">
	import type { NodeTypes } from '@xyflow/svelte'
	import {
		Background,
		BackgroundVariant,
		SvelteFlow,
		type Edge,
		type Node,
		useSvelteFlow
	} from '@xyflow/svelte'
	import { sleep } from './utils'
	import '@xyflow/svelte/dist/style.css'
	import { animate } from 'motion'
	import Loader from './Loader2.svelte'
	import CustomNode from './Node.svelte'
	import { edges as AllEdges, nodes as AllNodes } from './nodes'
	import Status from './Status.svelte'
	import { staticMode } from './stores.svelte'
	import FlowBuiltConfirmation from './FlowBuiltConfirmation.svelte'
	import { onMount } from 'svelte'

	const { fitView } = useSvelteFlow()

	$effect(() => {
		if (staticMode) {
			showAll()
		}
	})

	const nodeTypes: NodeTypes = {
		node: CustomNode
	}

	let nodes = $state.raw<Node[]>([])
	let edges = $state.raw<Edge[]>(AllEdges)

	let step = $state(0)
	let allNodesAreRendered = $state(false)
	let buildHasFinished = $state(false)
	let testsAreRunning = $state(false)
	let testsAreFinished = $state(false)

	let FlowStatus = $state<Status>()
	let flowStatusContainer = $state<HTMLDivElement>()

	// When build is finished, start testing
	$effect(() => {
		if (allNodesAreRendered) {
			;(async () => {
				await runTests()
			})()
		}
	})

	// When tests are finished, show confirmation
	$effect(() => {
		if (testsAreFinished) {
			;(async () => {
				await sleep(500)

				fitView({
					maxZoom: 1,
					minZoom: 1,
					duration: 500
				})
				await sleep(500)
				buildHasFinished = true
			})()
		}
	})

	// Start the builder
	async function startBuilder() {
		await animate('#status-loader', { opacity: 0 }, { duration: 0.3 })
		step = 0
		nodes = []
		await sleep(500)
		showNextNode()
	}

	async function runTests() {
		if (testsAreRunning) return

		testsAreRunning = true

		let step = nodes.length - 1

		const MIN_TIME = 1000
		const MAX_TIME = 2000

		function updateBool(propName: string) {
			nodes = nodes.map((node, idx) => {
				return {
					...node,
					data: {
						...node.data,
						[propName]: idx === step
					}
				}
			})
		}

		async function prevStep() {
			updateBool('isTesting')

			if (step < 0) {
				testsAreFinished = true
				return
			}

			let attempts = 0

			const randomBool = () => Math.random() > 0.5
			do {
				attempts++
				if (attempts > 1) {
					updateBool('testFailed')
				}
				await sleep(Math.random() * (MAX_TIME - MIN_TIME) + MIN_TIME)
			} while (randomBool() && attempts < 3)

			updateBool('testComplete')
			await sleep(500)

			step--
			await prevStep()
		}

		await prevStep()
	}

	// Shortcut to skip forward to the end
	function showAll() {
		showNextNode()
		allNodesAreRendered = true
	}

	// Show the next node
	function showNextNode() {
		const nextNode = AllNodes[step]

		// Set flag
		if (!nextNode) {
			allNodesAreRendered = true
			return
		}

		const nextStep = () => {
			step++
			showNextNode()
		}

		function addNode(node: Node, onComplete: () => void) {
			const obj = {
				...node,
				data: {
					...node.data,
					isTesting: false,
					testFailed: false,
					testComplete: false,
					onComplete
				}
			}

			nodes = [...nodes, obj]
		}

		if (Array.isArray(nextNode)) {
			nextNode.forEach((node, idx) => {
				const callback = idx === 0 && !staticMode ? nextStep : () => {}
				addNode(node, callback)
			})
		} else {
			addNode(nextNode, () => {
				step++
				showNextNode()
			})
		}

		if (staticMode) {
			nextStep()
		}
	}

	async function restart() {
		const statusLoader = document.querySelector<HTMLDivElement>('#status-loader')
		if (statusLoader) {
			statusLoader.style.opacity = '1'
		}

		step = 0
		allNodesAreRendered = false
		buildHasFinished = false
		testsAreRunning = false
		testsAreFinished = false
		nodes = []

		FlowStatus?.play()
	}

	onMount(() => {
		;(async () => {
			if (!staticMode) {
				await sleep(1000)
				await restart()
			}
		})()
	})
</script>

<div
	id="canvas"
	class={[
		'bg-main-800 grid p-1 transition-all duration-1000',
		buildHasFinished && 'gap-1',
		testsAreFinished ? 'grid-cols-[2fr_1fr]' : 'grid-cols-[2fr_0fr]'
	]}
>
	<div class="relative grid">
		{#if !staticMode}
			<div
				data-flow-status
				style="transform: translateY(40vh)"
				class="absolute top-8 left-1/2 z-10 grid -translate-x-1/2 place-items-center gap-4 font-medium"
			>
				<div class="grid place-items-center gap-2" bind:this={flowStatusContainer}>
					<div id="status-loader" class="text-accent-300">
						<Loader />
					</div>

					<Status
						bind:this={FlowStatus}
						autoplay={false}
						hideLastItem={true}
						class="text-lg"
						statuses={[
							['Starting up', 1],
							['Sending spec to builder', 1],
							['Awaiting response…', 2],
							['Response received', 0.5],
							['Parsing flow structure', 1],
							['Waiting for rendering to start', 2]
						]}
						onComplete={() => {
							startBuilder()
						}}
					/>
				</div>
			</div>
		{/if}

		<SvelteFlow
			{nodeTypes}
			{nodes}
			{edges}
			proOptions={{ hideAttribution: true }}
			fitView
			fitViewOptions={{
				maxZoom: 1,
				minZoom: 1
			}}
		>
			<Background
				bgColor="#181819"
				patternColor="#1D1E20"
				gap={30}
				size={2}
				variant={BackgroundVariant.Dots}
			/>
		</SvelteFlow>
	</div>

	<div class={['bg-main-900 grid', buildHasFinished && 'p-10']}>
		{#if buildHasFinished}
			<FlowBuiltConfirmation {restart} />
		{/if}
	</div>
</div>

<!-- <div class="absolute bottom-10 left-1/2 grid -translate-x-1/2 place-items-center gap-6">
	<div class="flex gap-2">
		<button
			class="text-sm"
			onclick={() => {
				startBuilder()
			}}>Restart</button
		>

		<button
			class="text-sm"
			onclick={() => {
				showAll()
			}}>Show all</button
		>
	</div>
</div> -->
