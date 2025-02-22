<script lang="ts">
	import Dialog from '$lib/components/common/Dialog.svelte'

	import Card from '$lib/components/common/Card.svelte'
	import InputField from '../atoms/InputField.svelte'
	import Button from '../atoms/Button.svelte'
	import { enhance } from '$app/forms'
	import { toast } from 'svelte-sonner'
	import { goto } from '$app/navigation'

	let {
		dialog = $bindable()
	}: {
		dialog: HTMLDialogElement | undefined
	} = $props()
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
				class="flex flex-col gap-y-4"
				use:enhance={() => {
					return async ({ update, result }) => {
						if (result.type === 'success') {
							toast.success('Project created!')
							console.log('result', result)
							await goto(`project/${result.data?.meta?.id}`)
						}

						if (result.type === 'failure') {
							toast.error('Could not create project')
						}

						await update()
					}
				}}
			>
				<InputField name="name" label="Project Name" required />
				<InputField name="intention" label="Project Intention" required />

				<Button variation="primary" type="submit" class="mt-5 w-full">
					{#snippet body()}
						Create
					{/snippet}
				</Button>
			</form>
		{/snippet}
	</Card>
</Dialog>
