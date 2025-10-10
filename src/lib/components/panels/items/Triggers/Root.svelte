<script lang="ts">
	import PanelItem from '../../PanelItem.svelte'
	import { getCurrentNodePath, getProject, saveContainer } from '$lib/stores/canvas.svelte'
	import { page } from '$app/state'
	import EndpointTrigger from './Endpoint/Root.svelte'
	import { clone } from '$lib/utils/clone'
	import { toast } from 'svelte-sonner'
	import { tick } from 'svelte'
	import ChatTrigger from './ChatTrigger.svelte'

	let dialog = $state<HTMLDialogElement>()

	const { nodeId }: { nodeId: string } = $props()

	const currentNodeId = $derived(nodeId === 'container' ? getCurrentNodePath().at(-1)! : nodeId)

	const project = getProject()

	const triggers = $derived(project?.spec.triggers)

	const onUpdate = async (changedTrigger: string) => {
		await tick()
		const snapshot = clone($state.snapshot(project))
		const res = await saveContainer(snapshot)
		if (!res.success) return toast.error('Failed to save triggers')
		if (changedTrigger.toLowerCase() === 'chat' && project?.spec.triggers.chat.enabled)
			toast.info('Chat trigger enabled, remember to deploy the project!')
	}
</script>

<PanelItem
	nodeId={currentNodeId}
	title="Triggers"
	onAddClick={() => dialog?.showModal()}
	tip="The interface for the nodes in your project"
>
	<div class="flex flex-col gap-4">
		{#each Object.keys(triggers) as triggerName}
			{@const trigger = triggers[triggerName as keyof typeof project.spec.triggers]}
			<div
				class={[
					'bg-main-900 flex flex-col gap-2 rounded-md p-4 transition',
					!trigger.enabled && 'opacity-60'
				]}
			>
				<div class="flex flex-row justify-between">
					<h3 class="eyebrow">{triggerName}</h3>
					<input
						type="checkbox"
						class="checkbox mt-1 size-[1.3rem]"
						bind:checked={trigger.enabled}
						onchange={() => onUpdate(triggerName)}
					/>
				</div>
				{#if triggerName === 'endpoints'}
					<EndpointTrigger />
				{:else if triggerName === 'chat'}
					<ChatTrigger />
				{/if}
			</div>
		{/each}
	</div>
</PanelItem>
