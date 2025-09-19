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
		spec: {
			nodes: {},
			modifiers: {},
			readme: `# {{PROJECT_NAME}} Documentation  

This repository was created and deployed using [Triform](https://triform.ai/) – a platform for building, connecting, and running AI Agents and Flows.  

The contents of this README serve as the **technical documentation** for the project. Here you can describe:  
- The purpose and scope of the project  
- The Agents and Flows included  
- Requirements, dependencies, and setup instructions  
- Notes on usage, testing, and deployment  

Triform automatically generates this README as a starting point. You are encouraged to expand it with details about your specific project.  

---

✨ If you discovered this repository and want to create your own AI-powered projects, visit [Triform](https://triform.ai/) to get started.`,
			environment: { variables: [] }
		}
	} satisfies z.infer<typeof projectModel>)

	let nameInput = $state<HTMLInputElement>()

	let { handleSubmit, isLoading, errors } = $derived(
		createFormHandler({
			onSubmit: async data => {
				formData.spec.readme = formData.spec.readme.replace('{{PROJECT_NAME}}', formData.meta.name)
				return await createProject(formData)
			},
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
					id="new-project-name-input"
					autocomplete="off"
				/>

				<Button
					variation="vibrant"
					type="submit"
					class="mt-5 w-full"
					id="new-project-create-button"
					{isLoading}
				>
					{#snippet body()}
						Create
					{/snippet}
				</Button>
			</form>
		{/snippet}
	</Card>
</Dialog>
