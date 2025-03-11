<script lang="ts">
	import type { Node } from '$lib/types/flow'
	import type { ExecutionTraceData } from '$lib/types/execution'
	import type { Window as WindowType } from '$lib/stores/windows.svelte'

	import { useNodes } from '@xyflow/svelte'
	import { toast } from 'svelte-sonner'
	import { source } from 'sveltekit-sse'

	import Window from '$lib/components/common/Window.svelte'
	import Button from '../atoms/Button.svelte'
	import LightEditor from '$lib/components/atoms/LightEditor.svelte'

	import IconPlay from '~icons/material-symbols/play-arrow-outline-rounded'
	import { createExecution } from '$lib/utils/execution'

	interface Props extends WindowType {}

	// Just pass through all props
	const props: Props = $props()

	const nodes = useNodes()
	// Support only one selected node for now
	let selectedNode = $state<Node>()
	// For some reason we can't use a derived store here, so need to susbcribe instead
	nodes.subscribe(ns => {
		selectedNode = ns.find(n => n.selected) as Node | undefined
	})

	let input = $state('{\n\t"msg": "hello world"\n}')
	let result = $state('')

	let isRunning = $state(false)

	const run = async () => {
		if (!selectedNode) return

		if (!selectedNode?.data.spec) return toast.error('This node cannot be executed')
		if (!input) return toast.error('Please enter a test input')
		if (!isValidJson) return toast.error('The input needs to be valid JSON')

		isRunning = true

		const execution = createExecution(selectedNode, JSON.parse(input))
		console.log('creating execution', execution)

		let stream: ReturnType<typeof source> | undefined = undefined
		try {
			stream = source(`/api/executions`, {
				options: {
					body: JSON.stringify(execution),
					method: 'POST',
					credentials: 'include'
				},
				error: err => {
					throw err
				},
				cache: false
			})
			console.log('stream', stream)

			const extractErrorMessage = (msg: string): string => {
				let data: ExecutionTraceData
				try {
					data = JSON.parse(msg as unknown as string)
				} catch (e) {
					console.error('Failed to parse error message', e)
					return ''
				}
				if (!('error' in data.payload)) return ''
				return typeof data.payload.error === 'string'
					? data.payload.error
					: JSON.stringify(data.payload.error, null, 2)
			}

			// Define event handlers
			const eventHandlers = {
				close: msg => {
					if (msg === 'finished') {
						console.log('finished')
						isRunning = false
						stream?.close()
						stream = undefined
					}
				},
				error: msg => {
					isRunning = false
					toast.error('Error executing component')
					let parsedMsg: Record<string, unknown>
					try {
						parsedMsg = JSON.parse(msg as unknown as string)
					} catch (e) {
						console.error('Failed to parse error message', e)
						return
					}
					console.error('Error executing component', parsedMsg.error ?? parsedMsg)
				},
				action_started: msg => {
					let data: ExecutionTraceData
					try {
						data = JSON.parse(msg as unknown as string)
					} catch (e) {
						console.error('Failed to parse execution trace data', e)
						return
					}
					if (!('result' in data.payload)) return
					console.log('starting action')
				},
				execution_completed: msg => {
					console.log('got execution_completed', msg)
					let data: ExecutionTraceData
					try {
						data = JSON.parse(msg as unknown as string)
					} catch (e) {
						console.error('Failed to parse execution trace data', e)
						return
					}
					if (!('result' in data.payload)) return
					let res: unknown
					// If we executed just one action, use the result from just that one
					if (data.payload.result && Object.keys(data.payload.result).length === 1) {
						res = Object.values(data.payload.result)[0]
					} else {
						// Otherwise, show all results for now
						res = data.payload.result
					}
					result = typeof res === 'string' ? res : JSON.stringify(res, null, 2)
					console.log(result)
				},
				action_failed: msg => {
					// TODO: highlight the node that failed
					isRunning = false
					toast.error('Action failed')
					result = extractErrorMessage(msg)
				},
				execution_failed: msg => {
					isRunning = false
					toast.error('Execution failed')
					result = extractErrorMessage(msg)
				}
			} as Record<string, (msg: string) => void>
			// Subscribe to the events above
			for (const [event, handler] of Object.entries(eventHandlers))
				stream.select(event).subscribe(msg => {
					if (!msg) return
					return handler(msg)
				})
		} catch (e) {
			console.error('Failed executing component', e)
			toast.error('There was an error executing the component')
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
</script>

<Window padding="tight" {...props}>
	{#snippet header()}
		Execute {selectedNode?.data?.component_name ?? ''}
		{selectedNode?.data ? `v${selectedNode?.data?.component_version}` : ''}
	{/snippet}

	{#snippet body()}
		<div
			class={[
				' col-start-1 row-start-1 grid min-w-80 grid-rows-[auto_1fr_min-content] gap-y-4',
				selectedNode ? 'visible' : 'invisible'
			]}
		>
			<div class="bg-main-800/50 rounded-lg p-3">
				<p class=" eyebrow ms-3 mt-1 mb-2">Test data</p>
				<LightEditor language="json" value={input} onUpdate={v => (input = v)} class="text-sm" />
			</div>

			<div class="bg-main-800/50 grid grid-rows-[auto_minmax(100px,1fr)] rounded-lg p-3">
				<p
					class="border-main-800 ms-3 mt-1 mb-2 border-b pb-2 text-xs font-semibold tracking-wide uppercase"
				>
					Result
				</p>
				<div class="relative">
					<code class="absolute inset-0 w-full overflow-auto px-3 transition-all">
						{#if isRunning}
							<div
								class={[
									'bg-main-700 h-full min-h-16 w-full animate-pulse rounded-md transition-all',
									!isRunning ? 'opacity-100' : 'opacity-0'
								]}
							></div>
						{:else}
							<pre class="word-break-[break-word] min-h-16 font-mono text-sm text-wrap">
{result}
							</pre>
						{/if}
					</code>
				</div>
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
					autoLoad="promise"
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
			<p class="text-main-400 mb-1 text-center">Select a node to execute</p>
			<p class="text-main-600 max-w-xs text-center">
				Selecting an endpoint will execute all downstream nodes
			</p>
		</div>
	{/snippet}
</Window>
