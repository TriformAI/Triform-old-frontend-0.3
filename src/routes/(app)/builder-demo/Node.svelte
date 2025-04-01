<script lang="ts">
	import { Handle, Position, useSvelteFlow } from '@xyflow/svelte'
	import IconAction from '~icons/mdi/rhombus'
	import IconTrigger from '~icons/material-symbols/bolt'
	import IconFlow from '~icons/material-symbols/network-node'

	import Status from './Status.svelte'
	import { staticMode } from './stores.svelte'
	import { onMount } from 'svelte'

	const { fitView } = useSvelteFlow()

	interface Props {
		data: {
			label: string
			type: 'trigger' | 'action' | 'flow'
			onComplete?: () => void
			isTesting?: boolean
			testFailed?: boolean
			testComplete?: boolean
		}
	}

	let { data }: Props = $props()
	const { type } = $derived(data)

	const nodeProps = $derived.by(() => {
		return {
			trigger: { icon: IconTrigger, label: 'Trigger' },
			action: { icon: IconAction, label: 'Action' },
			flow: { label: 'Subflow' }
		}[type]
	})

	const statuses = $derived.by(() => {
		return [
			`Initialising ${nodeProps.label}`,
			'Creating files',
			'Generating tests',
			'Generating docs',
			'Deploying',
			'Done!'
		]
	})

	let isBuilding = $state(true)

	onMount(() => {
		if (staticMode) {
			isBuilding = false
		}

		setTimeout(() => {
			fitView({
				maxZoom: 1,
				minZoom: 1,
				duration: type === 'trigger' ? 0 : 500
			})
		}, 0)
	})
</script>

<div class="relative">
	<div
		class={[
			'builder-node grid place-content-center gap-3',

			type === 'flow'
				? 'border-main-700 h-[560px] w-[500px] rounded border'
				: 'size-20 rounded-full'
		]}
	>
		{#if type !== 'flow'}
			<div
				class={[
					' absolute inset-0 m-auto grid  rounded-full p-0.5',
					isBuilding && 'from-main-600 to-main-800 animate-spin bg-gradient-to-b to-50%',
					!isBuilding && 'bg-main-500'
				]}
			>
				<div class="bg-main-900 rounded-full"></div>
			</div>
		{/if}

		{#if !isBuilding}
			<p
				class={[
					'bg-main-900 animate-fade-in absolute start-1/2 -translate-x-1/2 px-2 py-1.5 text-center text-sm font-medium whitespace-nowrap',
					type === 'flow' ? '-top-3.5' : '-top-8'
				]}
			>
				{data.label}<br />
				{#if data.isTesting}
					{#if data.testComplete}
						<span class="animate-fade-in text-success">Test passed!</span>
					{:else if data.testFailed}
						<span class="animate-fade-in text-warning-300">Failed, adjusting code…</span>
					{:else}
						<span class="animate-fade-in text-accent-300">Running tests… </span>
					{/if}
				{/if}
			</p>
		{/if}

		<Handle type="target" position={Position.Top} class=" opacity-0" />

		{#if nodeProps.icon}
			<nodeProps.icon
				class={[
					'relative size-6',
					data.isTesting && 'animate-ping',
					type === 'action' && 'text-main-300',
					type === 'trigger' && 'text-warning-300'
				]}
			/>
		{/if}
		<Handle type="source" position={Position.Bottom} class="opacity-0" />
	</div>

	{#if !staticMode}
		<div
			class={[
				'absolute start-1/2 -translate-x-1/2',
				type !== 'flow' && 'bottom-[-30px]',
				type === 'flow' && 'top-[45%]'
			]}
		>
			<Status
				class="text-sm"
				hideLastItem={true}
				onComplete={() => {
					data.onComplete?.()
					isBuilding = false
				}}
				{statuses}
			/>
		</div>
	{/if}
</div>
