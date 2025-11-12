<script lang="ts">
	import { getProject, saveContainer } from '$lib/stores/canvas.svelte'
	import Disclosure from '$lib/components/atoms/Disclosure.svelte'
	import IconChevronRight from '~icons/material-symbols/chevron-right-rounded'
	import { nodeTypesDict, type NodeType } from '$lib/constants/nodeTypes'
	import { slide } from 'svelte/transition'
	import CronInput from './CronInput.svelte'
	import Payload from '../../common/Payload.svelte'
	import Button from '$lib/components/atoms/Button.svelte'
	import { clone } from '$lib/utils/clone'
	import { toast } from 'svelte-sonner'

	let {
		invocation = $bindable(),
		onRemove
	}: {
		invocation: {
			nodeId: string
			schedule: string
			payload: unknown
		}
		onRemove: () => void
	} = $props()

	const project = getProject()

	const getNode = (nodeId: string) => project?.spec.nodes[nodeId]

	const parseCronString = (cronString: string) => {
		const parts = cronString.split(' ')
		return {
			minute: parts[0] || '',
			hour: parts[1] || '',
			day: parts[2] || '',
			month: parts[3] || '',
			weekday: parts[4] || ''
		}
	}

	let cronFields = $state(parseCronString(invocation.schedule))
	let hasErrors = $state(false)
	let payloadString = $state(JSON.stringify(invocation.payload, null, 2))
	let hasJsonErrors = $state(false)

	let saveTimeout: ReturnType<typeof setTimeout> | null = null

	const debouncedSave = async () => {
		if (saveTimeout) clearTimeout(saveTimeout)
		saveTimeout = setTimeout(async () => {
			if (!project) return
			const snapshot = clone($state.snapshot(project))
			const res = await saveContainer(snapshot, project)
			if (!res.success) toast.error('Failed to save changes')
		}, 1000)
	}

	$effect(() => {
		if (!hasErrors) {
			invocation.schedule = Object.values(cronFields).join(' ')
			debouncedSave()
		}
	})

	$effect(() => {
		if (!hasJsonErrors && payloadString) {
			try {
				invocation.payload = JSON.parse(payloadString)
				debouncedSave()
			} catch {
				// ignore
			}
		}
	})

	const trinode = $derived(getNode(invocation.nodeId))
	const nodeType = $derived(
		trinode ? nodeTypesDict[trinode.spec.resource.split('/')[0] as NodeType] : null
	)
</script>

<div class={['bg-main-950/60 rounded-md p-3 pl-4']} transition:slide={{ axis: 'y' }}>
	<Disclosure triggerClass={['group/trigger w-full']}>
		{#snippet trigger()}
			<div class="grid w-full grid-cols-[auto_auto_1fr] items-center gap-2 rounded-md">
				{#if nodeType}
					<div style={`color: ${nodeType.iconColor}`}>
						<nodeType.icon class="size-4 shrink-0" />
					</div>
				{/if}
				<span
					class={[
						'text-main-400 truncate transition',
						'group-aria-expanded/trigger:text-main-300 group-hover/trigger:text-main-300'
					]}>{trinode?.spec.meta.name ?? invocation.nodeId}</span
				>
				<IconChevronRight
					class={[
						'text-main-500 group-hover/trigger:text-main-200 ml-auto size-5 shrink-0 transition',
						'group-aria-expanded/trigger:text-main-300 group-aria-expanded/trigger:rotate-90'
					].join(' ')}
				/>
			</div>
		{/snippet}
		<div class="flex flex-col gap-y-4 pt-4">
			<div>
				<span class="eyebrow text-main-300">Schedule</span>
				<div class="mt-2">
					<CronInput bind:cronFields bind:hasErrors />
				</div>
			</div>
			<div>
				<Payload bind:value={payloadString} bind:hasJsonErrors />
			</div>
			<Button variation="danger" class="ml-auto py-2" onClick={onRemove}>Remove</Button>
		</div>
	</Disclosure>
</div>
