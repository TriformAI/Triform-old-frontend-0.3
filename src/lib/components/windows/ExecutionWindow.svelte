<script lang="ts">
	import type { Node } from '$lib/types/flow'

	import { T, getTranslate } from '@tolgee/svelte'
	const { t } = getTranslate()

	import { toast } from 'svelte-sonner'
	import { executeComponent } from '$lib/actions/executor'
	import { useNodes } from '@xyflow/svelte'

	import Window from '$lib/components/common/Window.svelte'
	import Button from '../atoms/Button.svelte'
	import TextField from '../atoms/TextField.svelte'
	import Code from '../atoms/Code.svelte'

	import IconPlay from '~icons/material-symbols/play-arrow-outline-rounded'

	// Just pass through all props
	const props = $props()

	const nodes = useNodes()
	// Support only one selected node for now
	let selectedNode = $state<Node | undefined>(undefined)
	// For some reason we can't use a derived store here, so need to susbcribe instead
	nodes.subscribe(ns => {
		selectedNode = ns.find(n => n.selected) as Node
	})

	let input = $state('')
	let result = $state('')

	let isRunning = $state(false)

	const run = async () => {
		if (!selectedNode) return
		if (!input) {
			toast.error('Please enter a test input')
			return
		}
		try {
			JSON.parse(input)
		} catch (err) {
			toast.error('The input needs to be valid JSON')
			return
		}
		isRunning = true
		try {
			const res = await executeComponent(selectedNode?.data.spec, JSON.parse(input))
			console.log(res)
			result = res
		} finally {
			isRunning = false
		}
	}
</script>

<Window {...props}>
	{#snippet header()}
		Execute {selectedNode?.data?.component_name ?? ''}
	{/snippet}

	{#snippet body()}
		{#if selectedNode}
			<div class="flex flex-col gap-y-4 h-full min-h-fit">
				<TextField
					label={$t('window-execution-input-label', 'Test data')}
					placeholder={$t('window-execution-input-placeholder', 'Temporary test data')}
					bind:value={input}
				/>
				<Button
					class="w-full"
					onClick={run}
					autoLoad={false}
					disabled={isRunning}
				>
					{#snippet icon()}
						<IconPlay />
					{/snippet}
				</Button>
				{#if result}
					<div class="max-w-lg">
						<Code code={JSON.stringify(result, null, 2)} />
					</div>
				{/if}
			</div>
		{:else}
			<div class="flex flex-col items-center justify-center py-12 px-8">
				<p class="text-zinc-500 text-center">
					Select a node to execute it
				</p>
			</div>
		{/if}
	{/snippet}
</Window>
