<script lang="ts">
	import type { z } from 'zod'
	import type { runCompletedModel } from '$lib/schemas/chat'
	import Button from '../atoms/Button.svelte'
	import { chat, type RunData } from '$lib/stores/chat.svelte'
	import { deployProject } from '$lib/actions/project'
	import { page } from '$app/state'
	import { toast } from 'svelte-sonner'
	import { selectedTools } from '$lib/stores/triggerChat.svelte'

	const {
		action,
		run
	}: { action: z.infer<typeof runCompletedModel>['data']['actions'][number]; run: RunData } =
		$props()

	const variation = $derived.by(() => {
		if (action.type === 'message_button') return action.variation
		if (action.type === 'chat_project') return 'vibrant'
		return 'primary'
	})
	const label = $derived.by(() => {
		if ('label' in action) return action.label
		if (action.type === 'chat_project') return 'Deploy & chat'
		return 'Unknown action'
	})

	const handler = async () => {
		if (action.type === 'message_button')
			return chat.socket?.send(
				JSON.stringify({
					event: 'user_message',
					data: {
						content: [
							{
								type: 'text',
								text: action.message
							}
						]
					}
				})
			)
		if (action.type === 'chat_project') {
			const projectId = page.data.project?.id
			if (!projectId) return toast.error('Project not found')
			const res = await deployProject(projectId)
			if (!res.success) return toast.error('Failed to deploy project')
			const { getProject, setDeployment } = await import('$lib/stores/canvas.svelte')
			const { spec, ...newDeployment } = res.data
			setDeployment(newDeployment)
			const nodes = getProject().spec.nodes
			selectedTools.tools = Object.keys(nodes).map(nodeId => ({
				projectId,
				nodeId
			}))
			window.open(`/chat`, '_blank')
		}
	}
</script>

<Button {variation} onClick={handler} autoLoad="promise" disabled={run.id !== chat.currentRunId}>
	{#snippet body()}
		{label}
	{/snippet}
</Button>
