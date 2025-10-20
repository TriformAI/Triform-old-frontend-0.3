<script lang="ts">
	import Dialog from '$lib/components/common/Dialog.svelte'
	import Card from '$lib/components/common/Card.svelte'
	import InputField from '../atoms/InputField.svelte'
	import Button from '../atoms/Button.svelte'
	import { goto } from '$app/navigation'
	import { createProject } from '$lib/actions/project'
	import type * as z from 'zod'
	import { projectModel } from '$lib/schemas'
	import { toast } from 'svelte-sonner'

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
	let isLoading = $state(false)
	let errors = $state<string[] | null>(null)

	async function handleSubmit(e: Event) {
		e.preventDefault()
		isLoading = true
		errors = null

		try {
			formData.spec.readme = formData.spec.readme.replace('{{PROJECT_NAME}}', formData.meta.name)
			const result = await createProject(formData)

			if (result.success) {
				toast.success('Project created!')
				console.log(result.data)
				goto(`/project/${result.data.id}`)
			} else {
				const errorResult = result as { issues?: { message: string }[]; error?: string }
				errors = errorResult.issues?.map(issue => issue.message) || [
					errorResult.error || 'Operation failed'
				]
				nameInput?.focus()
			}
		} catch (error) {
			console.error('Form submission error:', error)
			errors = [error instanceof Error ? error.message : 'Unknown error']
			nameInput?.focus()
		} finally {
			isLoading = false
		}
	}
</script>

<Dialog bind:dialog appearance="center" onOpen={() => nameInput?.focus()}>
	<Card onClose={() => dialog?.close()}>
		{#snippet title()}
			New Toolbox
		{/snippet}

		{#snippet subtitle()}
			A toolbox is a collection of flows and agents that can be consumed through the chat
		{/snippet}

		{#snippet body()}
			<form novalidate onsubmit={handleSubmit} class="flex flex-col gap-y-4">
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
					label="Toolbox Name"
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
