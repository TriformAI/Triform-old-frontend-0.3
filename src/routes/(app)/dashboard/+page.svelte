<script lang="ts">
	import Button from '$lib/components/atoms/Button.svelte'
	import NewProject from '$lib/components/modals/NewProject.svelte'
	import IconChevronRight from '~icons/material-symbols/chevron-right'
	import IconAdd from '~icons/material-symbols/new-window-rounded'
	import Dropdown from '$lib/components/common/Dropdown.svelte'
	import IconDots from '~icons/material-symbols/more-horiz'
	import IconTrash from '~icons/material-symbols/delete-outline'
	import { enhance } from '$app/forms'
	import { toast } from 'svelte-sonner'

	let { data } = $props()
	const { projects } = $derived(data)

	let projectDialog = $state<HTMLDialogElement>()
</script>

<svelte:head>
	<title>Projects | Triform</title>
</svelte:head>

<div class="container">
	<NewProject bind:dialog={projectDialog} />

	<div class="flex flex-row items-center justify-start gap-2">
		<h1 class=" text-2xl font-semibold">Projects</h1>
		<Button variation="link" onClick={() => projectDialog?.showModal()}>
			{#snippet icon()}
				<IconAdd />
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
							{project.meta.intention.purpose}
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
							<form
								action="/project/{project.id}?/delete"
								method="POST"
								use:enhance={() => {
									return async ({ update, result }) => {
										console.log(result)
										if (result.type === 'success') {
											toast.success(`Project "${project.meta.name}" deleted`)
											await update()
										} else {
											toast.error('Project could not be deleted')
										}
									}
								}}
							>
								<button type="submit" class="list-btn w-full text-sm font-medium">
									<IconTrash />
									Delete
								</button>
							</form>
						{/snippet}
					</Dropdown>
				</div>
			</div>
		{/each}
	</div>
</div>
