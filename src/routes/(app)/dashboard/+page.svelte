<script lang="ts">
	import Button from '$lib/components/atoms/Button.svelte'
	import NewProject from '$lib/components/modals/NewProject.svelte'
	import IconChevronRight from '~icons/material-symbols/chevron-right'
	import IconAdd from '~icons/mdi/folder-plus'
	import Dropdown from '$lib/components/common/Dropdown.svelte'
	import IconDots from '~icons/material-symbols/more-horiz'
	import IconTrash from '~icons/material-symbols/delete-outline'
	import { deleteProject as deleteProjectAction } from '$lib/actions/project'
	import { toast } from 'svelte-sonner'
	import { confirmStore } from '$lib/stores/confirm.svelte.js'
	import Confirm from '$lib/components/common/Confirm.svelte'
	import { invalidateAll } from '$app/navigation'
	import NewPrompt from '$lib/components/Chat/NewPrompt.svelte'

	let { data } = $props()
	const { projects } = $derived(data)

	let projectDialog = $state<HTMLDialogElement>()

	const deleteProject = async (id: string) => {
		const confirmed = await confirmStore.show({
			title: 'Are you sure?',
			message: 'This will delete the project immediately',
			danger: true
		})
		if (!confirmed) return
		const { success, error } = await deleteProjectAction(id)
		if (!success) return toast.error(error ?? 'Project could not be deleted')
		toast.success('Project deleted')
		invalidateAll()
	}
</script>

<svelte:head>
	<title>Toolboxes | Triform</title>
</svelte:head>

<div class="container flex flex-col items-center gap-y-8">
	<NewProject bind:dialog={projectDialog} />
	<Confirm />

	<div class="mt-4">
		<NewPrompt />
	</div>

	<div>
		<div class="flex flex-row items-center justify-start gap-2">
			<h1 class=" text-2xl font-semibold">Toolboxes</h1>
			<Button variation="link" onClick={() => projectDialog?.showModal()} id="new-project-button">
				{#snippet icon()}
					<IconAdd class="size-5" />
				{/snippet}
			</Button>
		</div>
		<div class="mt-4 grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-4">
			{#each projects as project (project.id)}
				<div
					class="group/project bg-main-850 border-main-800 hover:border-main-700 hover:bg-main-800 relative rounded-lg border transition"
				>
					<a class=" relative block w-full transform p-4 pr-8" href="/project/{project.id}">
						<div>
							<h2 class="mb-1 flex items-center font-medium">
								{project.meta.name}
								<span
									class="opacity-0 transition-all duration-300 group-hover/project:translate-x-2 group-hover/project:opacity-100"
								>
									<IconChevronRight class="text-main-400 text-lg" />
								</span>
							</h2>
							<p class="text-main-500">
								{project.meta.intention}
							</p>
						</div>
					</a>
					<div
						class={[
							'absolute end-4 top-4',
							'opacity-0 transition-opacity duration-300 group-hover/project:opacity-100'
						]}
					>
						<Dropdown>
							{#snippet trigger()}
								<IconDots />
							{/snippet}
							{#snippet body()}
								<button
									class="list-btn text-danger-400 w-full text-sm font-medium"
									onclick={() => deleteProject(project.id)}
								>
									<IconTrash />
									Delete
								</button>
							{/snippet}
						</Dropdown>
					</div>
				</div>
			{/each}
		</div>
	</div>
</div>
