<script lang="ts">
	import type { ExecutionTraceData } from '$lib/types/execution'

	import { toast } from 'svelte-sonner'
	import { source } from 'sveltekit-sse'
	import IconAdd from '~icons/mdi/plus-circle-outline'
	import Button from '../../../atoms/Button.svelte'
	import LightEditor from '$lib/components/atoms/LightEditor.svelte'

	import IconPlay from '~icons/material-symbols/play-arrow-outline-rounded'
	import IconCopy from '~icons/mdi/content-copy'
	import { createExecution } from '$lib/utils/execution'
	import { selected } from '$lib/stores/panel.svelte'
	import PanelItem from '../../PanelItem.svelte'
	import PayloadDialog from './PayloadDialog.svelte'
	import ComboBox from '$lib/components/atoms/ComboBox.svelte'
	import { page } from '$app/state'
	import { blur } from 'svelte/transition'

	import { type Component } from '$lib/types/agent'
	import { getCurrentFlowId } from '$lib/stores/canvas.svelte'
	const { componentData }: { componentData: Component } = $props()

	let payload = $state('{\n\t"msg": "hello world"\n}')
	if (selected.payload) {
		payload = selected.payload
	}

	let result = $state('')

	let payloadDialog = $state<HTMLDialogElement>()

	let isRunning = $state(false)
	let executionState = $state('')

	const formattedExecutionState = $derived.by(() => {
		const state = executionState.split('_').join(' ')
		return state.substring(0, 1).toUpperCase() + state.substring(1)
	})

	const run = async () => {
		if (!payload) return toast.error('Please enter a payload')
		if (!isValidJson) return toast.error('The payload needs to be valid JSON')

		const nodeId = selected.node?.id ?? getCurrentFlowId()

		if (!nodeId) {
			return toast.error('No node selected')
		}

		isRunning = true

		const execution = createExecution(nodeId, JSON.parse(payload), componentData)
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
			executionState = 'Starting execution'

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
					console.log('got event', event)
					if (!['close', 'ping'].includes(event)) executionState = event
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
			JSON.parse(payload)
		} catch (e) {
			return false
		}
		return true
	})

	async function copyResult() {
		await navigator.clipboard.writeText(result)
		toast.success('Result copied to clipboard')
	}

	let newPayload = $state('')

	$effect(() => {
		if (newPayload) {
			payload = page.data.payloads?.find(p => p.meta.id === newPayload)?.spec.payload ?? ''
			newPayload = ''
		}
	})

	function setPayload(val: string) {
		payload = val
		selected.payload = val
	}
</script>

<!-- Execute {selectedNode?.data?.component_name ?? ''}
{selectedNode?.data ? `v${selectedNode?.data?.component_version}` : ''} -->

<PanelItem {componentData} title="Execute">
	<div class={[' col-start-1 row-start-1 grid min-w-80 grid-rows-[auto_1fr_min-content] gap-y-4']}>
		{#if page.data.payloads?.length}
			<ComboBox
				bind:value={newPayload}
				placeholder="Use saved payload"
				items={page.data.payloads?.map(v => ({ value: v.meta.id, label: v.spec.name })) ?? []}
			/>
		{/if}

		<div class="bg-main-800/50 rounded-lg p-3">
			<div class=" -mt-1 mb-4 flex items-end justify-between">
				<p class="text-sm font-medium">
					<span class="text-main-300">Payload</span>
				</p>
				<button
					aria-label="Save payload"
					data-balloon-pos="left"
					class="text-main-400 hover:text-main-300 -mt-1 transition-colors"
					type="button"
					onclick={() => payloadDialog?.showModal()}
				>
					<IconAdd class="size-5" />
				</button>
			</div>
			{#key newPayload}
				<LightEditor
					wordWrap={true}
					language="json"
					bind:value={payload}
					onUpdate={v => setPayload(v)}
					class="text-sm"
				/>
			{/key}
		</div>

		<div class="bg-main-800/50 grid grid-rows-[auto_minmax(100px,1fr)] rounded-lg p-3">
			<div class=" -mt-1 mb-4 flex items-end justify-between">
				<p class="text-sm font-medium">
					<span class="text-main-300">Result</span>
				</p>
				{#if result}
					<button
						class="text-main-400 hover:text-main-300 ms-auto -mt-1 transition-colors"
						onclick={() => copyResult()}><IconCopy class="size-4.5" /></button
					>
				{/if}
			</div>

			<div class="relative">
				{#if isRunning}
					<div
						class={[
							'h-full min-h-16 w-full rounded-md transition-all',
							'opacity-100 starting:opacity-0',
							'flex items-center justify-center',
							'absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2'
						]}
						out:blur={{
							duration: 400,
							opacity: 0,
							amount: 3
						}}
					>
						{#key executionState}
							<span
								class={[
									'text-main-200 h-fit w-fit truncate text-center',
									'bg-main-950/20 animate-border rounded px-4 py-2',
									'absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2'
								]}
								transition:blur={{
									duration: 800,
									opacity: 0,
									amount: 5
								}}
							>
								{formattedExecutionState}
							</span>
						{/key}
					</div>
				{/if}
				<LightEditor
					readOnly={true}
					wordWrap={true}
					language="json"
					bind:value={result}
					class={[
						'text-sm transition-all duration-300',
						isRunning ? 'blur-xs grayscale-75' : 'blur-[0px] grayscale-0'
					]}
				/>
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
</PanelItem>

{#key payload}
	<PayloadDialog {payload} bind:dialog={payloadDialog} />
{/key}
