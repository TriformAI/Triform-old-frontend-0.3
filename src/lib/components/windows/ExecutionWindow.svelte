<script lang="ts">
	import type { Node } from '$lib/types/flow'
	import { initJsonEditor } from '$lib/jsonEditor'

	import { useNodes } from '@xyflow/svelte'
	import { toast } from 'svelte-sonner'

	import Window from '$lib/components/common/Window.svelte'
	import Button from '../atoms/Button.svelte'

	import IconPlay from '~icons/material-symbols/play-arrow-outline-rounded'

	import { API } from '$lib/api'

	const api = new API()

	// Just pass through all props
	const props = $props()

	const nodes = useNodes()
	// Support only one selected node for now
	let selectedNode = $state<Node | undefined>(undefined)
	// For some reason we can't use a derived store here, so need to susbcribe instead
	nodes.subscribe(ns => {
		selectedNode = ns.find(n => n.selected) as Node
	})

	let input = $state('{\n\t"msg":"hello world"\n}')
	let result = $state('')

	let isRunning = $state(false)

	const run = async () => {
		if (!selectedNode) return

		if (!input) {
			toast.error('Please enter a test input')
			return
		}

		if (!isValidJson) {
			toast.error('The input needs to be valid JSON')
			return
		}

		isRunning = true

		try {
			result = await api.post('components', {
				component: selectedNode?.data.spec,
				input: JSON.parse(input)
			})
			console.log(result)
		} finally {
			isRunning = false
		}
	}

	const isValidJson = $derived.by(() => {
		try {
			JSON.parse(input)
		} catch (e) {
			console.error(e)
			return false
		}
		return true
	})

	function initCodeEditor(el: HTMLDivElement) {
		initJsonEditor(el, input, value => {
			input = value
		})
	}
</script>

<Window padding="tight" {...props}>
	{#snippet header()}
		Execute {selectedNode?.data?.component_name ?? ''}
	{/snippet}

	{#snippet body()}
		<div
			class={[
				'relative col-start-1 row-start-1 grid w-full min-w-80 grid-rows-[1fr_auto] gap-y-4',
				selectedNode ? 'visible' : 'invisible'
			]}
		>
			<div class="bg-zinc-850 rounded-lg p-3">
				<p
					class="ms-3 mt-1 mb-2 border-b border-white/10 pb-2 text-xs font-semibold tracking-wide uppercase opacity-65"
				>
					Test data
				</p>
				<div use:initCodeEditor class="text-sm"></div>
			</div>

			<div
				class="tooltip-red"
				aria-label={!isValidJson ? 'Invalid JSON data' : undefined}
				data-balloon-pos="up"
			>
				<Button
					variation="vibrant"
					class="w-full"
					onClick={run}
					autoLoad={false}
					disabled={!isValidJson || isRunning}
				>
					{#snippet icon()}
						<IconPlay class="size-6" />
					{/snippet}
				</Button>
			</div>
		</div>

		<div
			class={[
				'col-start-1 row-start-1 flex w-full min-w-80 flex-col items-center justify-center',
				!selectedNode ? 'visible' : 'invisible'
			]}
		>
			<p class="text-center text-zinc-500">Select a node to execute</p>
		</div>
	{/snippet}
</Window>
