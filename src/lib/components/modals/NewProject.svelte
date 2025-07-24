<script lang="ts">
	import Dialog from '$lib/components/common/Dialog.svelte'

	import Card from '$lib/components/common/Card.svelte'
	import InputField from '../atoms/InputField.svelte'
	import Button from '../atoms/Button.svelte'
	import { enhance } from '$app/forms'
	import { toast } from 'svelte-sonner'
	import { goto } from '$app/navigation'
	import TextField from '../atoms/TextField.svelte'

	interface Props {
		dialog?: HTMLDialogElement
	}

	let { dialog = $bindable() }: Props = $props()

	let isLoading = $state(false)
</script>

<Dialog bind:dialog appearance="center">
	<Card onClose={() => dialog?.close()}>
		{#snippet title()}
			New Project
		{/snippet}

		{#snippet subtitle()}
			A project is a discrete collection of nodes that are connected into a flow
		{/snippet}

		{#snippet body()}
			<form
				action="/project?/create"
				method="POST"
				class="flex flex-col gap-y-4"
				use:enhance={() => {
					isLoading = true
					return async ({ update, result }) => {
						console.log(result)
						if (result.type === 'success') {
							toast.success('Project created!')
							await goto(`project/${result.data?.data.meta?.id}`)
						}

						if (result.type === 'failure') {
							toast.error('Could not create project')
						}

						isLoading = false

						await update()
					}
				}}
			>
				<InputField name="name" label="Project Name" required />
				<TextField name="intention" label="Project Intention" />

				<Button variation="vibrant" type="submit" class="mt-5 w-full" {isLoading}>
					{#snippet body()}
						Create
					{/snippet}
				</Button>
			</form>
		{/snippet}
	</Card>
</Dialog>
