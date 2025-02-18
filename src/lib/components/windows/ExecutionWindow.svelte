<script lang="ts">
	import type { Node } from '$lib/types/flow'

	import { getTranslate } from '@tolgee/svelte'
	const { t } = getTranslate()

	import { toast } from 'svelte-sonner'
	import { useNodes } from '@xyflow/svelte'

	import Window from '$lib/components/common/Window.svelte'
	import Button from '../atoms/Button.svelte'
	import TextField from '../atoms/TextField.svelte'

	import IconPlay from '~icons/material-symbols/play-arrow-outline-rounded'
	import IconCheck from '~icons/material-symbols/check-circle-outline'
	import IconAlert from '~icons/material-symbols/warning-outline'

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
		} finally {
			isRunning = false
		}
	}

	const isValidJson = $derived.by(() => {
		try {
			JSON.parse(input)
		} catch (e) {
			return false
		}
		return true
	})
</script>

<Window padding="tight" {...props}>
	{#snippet header()}
		Execute {selectedNode?.data?.component_name ?? ''}
	{/snippet}

	{#snippet body()}
		<div
			class={[
				'relative col-start-1 row-start-1 grid w-full min-w-80 grid-rows-[1fr_auto] gap-y-4 pt-3',
				selectedNode ? 'visible' : 'invisible'
			]}
		>
			<p
				class={[
					'transform-opacity text-success absolute end-0.5 top-8 flex items-center gap-x-2 text-xs font-medium opacity-0 duration-100',
					isValidJson && 'opacity-100'
				]}
			>
				<IconCheck class="me-px size-5" />
			</p>

			<TextField
				class="text-sm"
				useMonoFont={true}
				rows={8}
				label={$t('window-execution-input-label', 'JSON test data')}
				bind:value={input}
			/>

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
