<script lang="ts">
	import Dialog from '$lib/components/common/Dialog.svelte'

	import Card from '$lib/components/common/Card.svelte'
	import InputField from '../atoms/InputField.svelte'
	import Button from '../atoms/Button.svelte'
	import { enhance } from '$app/forms'
	import { toast } from 'svelte-sonner'

	let {
		dialog = $bindable()
	}: {
		dialog: HTMLDialogElement | undefined
	} = $props()

	let projectName = $state('')
	const createProject = () => {
		console.log('create project', projectName)
	}

	let error_msg = $state<string>()
</script>

<Dialog bind:dialog appearance="center">
	<Card onClose={() => dialog?.close()}>
		{#snippet header()}
			New Project
		{/snippet}

		{#snippet body()}
			<p class="text-main-300 mb-5 w-full">
				A project is a discrete collection of nodes that are connected into a flow
			</p>

			<form
				action="/project?/create"
				method="POST"
				use:enhance={() => {
					return async ({ update, result }) => {
						if (result.type === 'success') {
							toast.success('Project created!')
							dialog?.close()
						}

						if (result.type === 'failure') {
							error_msg = 'Could not create project'
						}

						await update()
					}
				}}
			>
				{#if error_msg}
					<div class="error-msg mb-4">
						{error_msg}
					</div>
				{/if}

				<InputField bind:value={projectName} name="name" label="Project Name" />

				<Button variation="primary" class="mt-5 w-full" onClick={createProject}>
					{#snippet body()}
						Create
					{/snippet}
				</Button>
			</form>
		{/snippet}
	</Card>
</Dialog>
