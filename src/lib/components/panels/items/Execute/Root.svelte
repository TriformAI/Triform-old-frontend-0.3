<script lang="ts">
	import { toast } from 'svelte-sonner'
	import Button from '$lib/components/atoms/Button.svelte'
	import LightEditor from '$lib/components/atoms/LightEditor.svelte'
	import IconPlay from '~icons/material-symbols/play-arrow-outline-rounded'
	import IconStop from '~icons/material-symbols/stop-rounded'
	import IconCopy from '~icons/mdi/content-copy'
	import PanelItem from '../../PanelItem.svelte'
	import Payload from '../common/Payload.svelte'
	import { blur } from 'svelte/transition'
	import { executeComponent, cancelExecution } from '$lib/actions/executor.svelte'
	import type * as z from 'zod'
	import type { resolvedComponentModel } from '$lib/schemas'
	import {
		getCurrentNodePath,
		getProject,
		getProjectModifiers,
		getVisibleComponent
	} from '$lib/stores/canvas.svelte'
	import IconMagic from '~icons/mdi/shimmer'
	import IconReload from '~icons/material-symbols/refresh-rounded'
	import { getSamplePayload } from '$lib/schemas'
	import { objectMap } from '$lib/utils/objectMap'
	import { generateMockInputs } from '$lib/actions/components'
	import { confirmStore } from '$lib/stores/confirm.svelte'
	import { getNodeExecutionState } from '$lib/stores/execution.svelte'
	import type { Component } from 'svelte'
	import { objFilter } from '$lib/utils/objectFilter'
	import { objKeyMap } from '$lib/utils/objKeyMap'

	const { nodeId }: { nodeId: string } = $props()

	const componentData = $derived(
		getVisibleComponent(nodeId) as z.infer<typeof resolvedComponentModel>
	)

	const objectToSchema = (obj: Record<string, { schema: unknown }>) => ({
		type: 'object',
		properties: objectMap(obj, (value, _key) => value.schema)
	})

	const getDefaultPayload = () =>
		JSON.stringify(getSamplePayload(objectToSchema(componentData.spec.inputs)) ?? {}, null, 2)

	const loadInitialPayload = () => {
		const input = getNodeExecutionState(nodeId)?.input
		return input ? JSON.stringify(input, null, 2) : getDefaultPayload()
	}

	let payload = $state(loadInitialPayload())

	const formattedExecutionState = $derived.by(() => {
		const state = executorState.state.split('_').join(' ')
		return state.substring(0, 1).toUpperCase() + state.substring(1)
	})

	const isValidJson = $derived.by(() => {
		try {
			JSON.parse(payload)
		} catch (e) {
			return false
		}
		return true
	})

	async function copyResult() {
		await navigator.clipboard.writeText(resultString)
		toast.success('Result copied to clipboard')
	}

	const nodeExecution = $derived.by(() => getNodeExecutionState(nodeId))
	const resultString = $derived.by(() =>
		nodeExecution?.output ? JSON.stringify(nodeExecution.output, null, 2) : executorState.result
	)
	const stdoutString = $derived.by(() => nodeExecution?.stdout ?? executorState.stdout)
	const stderrString = $derived.by(() => nodeExecution?.stderr ?? executorState.stderr)

	const executorState = $state({
		isRunning: false,
		state: '',
		result: '',
		stdout: '',
		stderr: '',
		id: '',
		abortController: undefined as unknown as AbortController
	})

	function run() {
		if (!payload) return toast.error('Please enter a payload')
		if (!isValidJson) return toast.error('The payload needs to be valid JSON')

		executorState.abortController = new AbortController()

		// TODO: include modifiers on parents as well, once we support modifiers on flows
		// add the modifiers that are relevant to this node
		const currentNodeId = nodeId === 'container' ? getCurrentNodePath().at(-1) : nodeId
		const nodePath = [...getCurrentNodePath(), nodeId !== 'container' && nodeId]
			.filter(Boolean)
			.join('/')
		const isTopLevel = !getCurrentNodePath().length
		const modifiers =
			// keep only relevant modifiers
			objKeyMap(
				objFilter(getProjectModifiers(), (key, _value) =>
					key.startsWith(nodePath + (nodeId === 'container' ? '/' : ''))
				),
				// correct the path so it starts from the currently selected node, so remove everything before the current node
				(key, _value) => {
					// if we're on the top level, just drop the first node id
					if (isTopLevel) return key.split('/').slice(1).join('/')
					if (!currentNodeId) return key
					const parts = key.split('/')
					return parts
						.slice(parts.indexOf(currentNodeId) + (nodeId === 'container' ? 1 : 0))
						.join('/')
				}
			)

		executeComponent(
			JSON.parse(payload),
			componentData,
			modifiers,
			getProject().spec.environment,
			executorState,
			nodeId
		)
	}

	const additionalActions: { icon: Component; label: string; onClick: () => Promise<void> | void } =
		[
			{
				icon: IconMagic as unknown as Component,
				label: 'Generate sample payload',
				onClick: async () => {
					if (!componentData?.id) return
					if (payload !== getDefaultPayload()) {
						const confirmed = await confirmStore.show({
							title: 'Generate sample payload',
							message: 'This will overwrite your current payload'
						})
						if (!confirmed) return
					}
					const { data, success } = await generateMockInputs(componentData.id)
					if (!success) return toast.error('Failed to generate sample payload')
					payload = JSON.stringify(data, null, 2)
				}
			},
			{
				icon: IconReload as unknown as Component,
				label: 'Reload sample payload',
				onClick: async () => {
					const confirmed = await confirmStore.show({
						title: 'Generate default sample payload',
						message: 'This will overwrite your current payload'
					})
					if (!confirmed) return
					payload = getDefaultPayload()
				}
			}
		]

	const executionHandler = async () =>
		executorState.isRunning ? cancelExecution(executorState.id) : run()
</script>

<PanelItem {nodeId} title="Execute">
	<div class={['col-start-1 row-start-1 grid min-w-80 grid-rows-[auto_1fr_min-content] gap-y-4']}>
		<Payload bind:value={payload} {additionalActions} />

		<div class="bg-main-800/50 grid grid-rows-[auto_minmax(100px,1fr)] rounded-lg p-3">
			<div class=" -mt-1 mb-4 flex items-end justify-between">
				<p class="text-sm font-medium">
					<span class="text-main-300">Result</span>
				</p>
				{#if resultString}
					<button
						class="text-main-400 hover:text-main-300 ms-auto -mt-1 transition-colors"
						onclick={() => copyResult()}><IconCopy class="size-4.5" /></button
					>
				{/if}
			</div>

			<div class="relative">
				{#if executorState.isRunning}
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
						{#key executorState.state}
							<span
								class={[
									'text-main-200 h-fit w-fit text-center',
									'bg-main-950/20 animate-border rounded px-4 py-2',
									'absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
									'block'
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
					value={resultString}
					class={[
						'text-sm transition-all duration-300',
						executorState.isRunning ? 'blur-xs grayscale-75' : 'blur-[0px] grayscale-0',
						'max-h-full overflow-y-auto'
					]}
					id="execute-result-editor"
				/>
			</div>
		</div>

		{#if stdoutString}
			<div class="bg-main-800/50 grid grid-rows-[auto_min-h-16] rounded-lg p-3">
				<span class="text-sm font-medium">Stdout</span>
				<div class="overflow-x-auto px-2 py-1">
					<pre class="text-main-300 mt-2 text-sm">{stdoutString}</pre>
				</div>
			</div>
		{/if}

		{#if stderrString}
			<div class="bg-main-800/50 grid grid-rows-[auto_min-h-16] rounded-lg p-3">
				<span class="text-sm font-medium">Stderr</span>
				<div class="overflow-x-auto px-2">
					<pre class="text-danger-400 mt-2 text-sm">{stderrString}</pre>
				</div>
			</div>
		{/if}

		<div
			class="tooltip-red sticky bottom-0 mt-4 grid grow gap-2"
			aria-label={!isValidJson ? 'Invalid JSON data' : undefined}
			data-balloon-pos="up"
			data-balloon-instant={true}
		>
			<div class="relative">
				<Button
					variation={executorState.isRunning
						? executorState.id
							? 'warning'
							: 'primary'
						: 'vibrant'}
					class="w-full"
					onClick={executionHandler}
					autoLoad="promise"
					disabled={!isValidJson || (executorState.isRunning && !executorState.id)}
					id="execute-button"
				>
					{#snippet icon()}
						{#if executorState.isRunning}
							<IconStop class="size-6" />
						{:else}
							<IconPlay class="size-6" />
						{/if}
					{/snippet}

					{#snippet body()}
						<span>
							{executorState.isRunning ? (executorState.id ? 'Cancel' : 'Starting...') : 'Execute'}
						</span>
					{/snippet}
				</Button>
			</div>
		</div>
	</div>
</PanelItem>
