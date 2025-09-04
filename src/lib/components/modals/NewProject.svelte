<script lang="ts">
	import Dialog from '$lib/components/common/Dialog.svelte'
	import Card from '$lib/components/common/Card.svelte'
	import InputField from '../atoms/InputField.svelte'
	import Button from '../atoms/Button.svelte'
	import { goto } from '$app/navigation'
	import { createFormHandler } from '$lib/stores/formHandler.svelte'
	import { createProject } from '$lib/actions/project'
	import type * as z from 'zod'
	import { projectModel } from '$lib/schemas'

	interface Props {
		dialog?: HTMLDialogElement
	}

	let { dialog = $bindable() }: Props = $props()

	let formData = $state({
		resource: 'project/v1',
		meta: {
			name: '',
			intention: ''
		},
		spec: { nodes: {}, modifiers: {}, readme: '' }
	} satisfies z.infer<typeof projectModel>)

	let nameInput = $state<HTMLInputElement>()

	let { handleSubmit, isLoading, errors } = $derived(
		createFormHandler({
			onSubmit: async data => await createProject(formData),
			successMessage: 'Project created!',
			onSuccess: async result => {
				console.log(result.data)
				await goto(`project/${result.data.id}`)
			},
			onError: result => {
				nameInput?.focus()
			}
		})
	)
</script>

<Dialog bind:dialog appearance="center" onOpen={() => nameInput?.focus()}>
	<Card onClose={() => dialog?.close()}>
		{#snippet title()}
			New Project
		{/snippet}

		{#snippet subtitle()}
			A project is a discrete collection of nodes that are connected into a flow
		{/snippet}

		{#snippet body()}
			<form novalidate onsubmit={e => handleSubmit(e, formData)} class="flex flex-col gap-y-4">
				{#if errors}
					<div class="error-msg">
						<ul>
							{#each errors as error}
								<li>{error}</li>
							{/each}
						</ul>
					</div>
				{/if}

				<InputField
					bind:el={nameInput}
					label="Project Name"
					required
					bind:value={formData.meta.name}
				/>

				<Button variation="vibrant" type="submit" class="mt-5 w-full" {isLoading}>
					{#snippet body()}
						Create
					{/snippet}
				</Button>
			</form>
		{/snippet}
	</Card>
</Dialog>
