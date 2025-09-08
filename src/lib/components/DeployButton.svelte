<script lang="ts">
	import { page } from '$app/state'
	import { confirmStore } from '$lib/stores/confirm.svelte'
	import Button from './atoms/Button.svelte'
	import IconDeploy from '~icons/mdi/rocket-launch'
	import { API } from '$lib/api'
	import { toast } from 'svelte-sonner'

	const api = new API()

	let isDeploying = $state(false)

	async function deployProject() {
		const confirmed = await confirmStore.show({
			title: 'Deploy project',
			message:
				'This will immediately apply all your changes to this project, activate your specified triggers, and disable any deleted endpoints. <br>Are you sure you want to continue?',
			btnLabel: 'Deploy project'
		})

		if (!confirmed) return

		isDeploying = true
		const result = await api.post<{ data: { id: string } }>(
			`projects/${page.data.project?.id}/deploy`,
			{}
		)

		if (result.success) {
			toast.success('Project deployed successfully!')
		} else {
			toast.error('Failed to deploy project')
		}

		isDeploying = false
	}
</script>

<Button
	class="py-1.5 text-sm"
	isLoading={isDeploying}
	variation="vibrant"
	onClick={deployProject}
	id="nav-deploy-button"
>
	{#snippet body()}
		<span class="font-semibold">Deploy project</span>
	{/snippet}
	{#snippet icon()}
		<IconDeploy />
	{/snippet}
</Button>
