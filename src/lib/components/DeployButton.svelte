<script lang="ts">
	import { page } from '$app/state'
	import { confirmStore } from '$lib/stores/confirm.svelte'
	import Button from './atoms/Button.svelte'
	import IconDeploy from '~icons/mdi/rocket-launch'
	import { toast } from 'svelte-sonner'
	import { deployProject } from '$lib/actions/project'
	import {
		setDeployment,
		getDeployment,
		getProjectHash,
		getProject
	} from '$lib/stores/canvas.svelte'
	import { formatRelativeDate } from '$lib/utils/formatRelativeDate'

	let isDeploying = $state(false)

	const deploy = async () => {
		const confirmed = await confirmStore.show({
			title: 'Deploy project',
			message:
				'This will immediately apply all your changes to this project, activate your specified triggers, and disable any deleted endpoints. <br>Are you sure you want to continue?',
			btnLabel: 'Deploy project'
		})

		if (!confirmed) return

		isDeploying = true
		const result = await deployProject(page.data.project?.id!)

		if (result.success) {
			toast.success('Project deployed successfully!')
			const { spec, ...newDeployment } = result.data
			setDeployment(newDeployment)
		} else {
			toast.error('Failed to deploy project')
		}

		isDeploying = false
	}

	const project = $derived(getProject())
	const deployment = $derived(getDeployment())
	const hash = $derived(getProjectHash())
	const hasChanges = $derived(
		hash !== deployment?.checksum && Object.keys(project?.spec.nodes ?? {}).length
	)
</script>

<div class="flex flex-row items-center gap-x-1 md:gap-x-3">
	{#if deployment?.createdAt}
		{#key hash}
			<span class="text-main-500 hidden text-sm md:block">
				Deployed
				<span class="text-main-300">{formatRelativeDate(new Date(deployment.createdAt))}</span>
			</span>
		{/key}
	{/if}
	<Button
		isLoading={isDeploying}
		variation={hasChanges ? 'vibrant' : 'primary'}
		onClick={deploy}
		id="nav-deploy-button"
		class="py-1.5 text-sm"
		disabled={!hasChanges}
	>
		{#snippet body()}
			<span class="font-semibold">
				Deploy <span class="hidden md:block">project</span>
			</span>
		{/snippet}
		{#snippet icon()}
			<IconDeploy class="size-4 shrink-0" />
		{/snippet}
	</Button>
</div>
