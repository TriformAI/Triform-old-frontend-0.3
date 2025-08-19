<script lang="ts">
	import Dialog from '$lib/components/common/Dialog.svelte'
	import Card from '$lib/components/common/Card.svelte'
	import InputField from '../atoms/InputField.svelte'
	import Button from '../atoms/Button.svelte'
	import { authClient } from '$lib/auth-client'
	import { createFormHandler } from '$lib/stores/formHandler.svelte'
	import { toast } from 'svelte-sonner'
	import { sessionStore } from '$lib/stores/session.svelte'
	import { invalidateAll } from '$app/navigation'

	interface Props {
		dialog?: HTMLDialogElement
	}

	let { dialog = $bindable() }: Props = $props()

	let formData = $state({
		name: ''
	})

	let nameInput = $state<HTMLInputElement>()

	let { handleSubmit, isLoading, errors } = $derived(
		createFormHandler({
			onSubmit: async () => {
				const { data, error } = await authClient.organization.create({
					name: formData.name,
					slug: formData.name.toLowerCase().replace(/\s+/g, '-')
				})

				if (!data || error) {
					return {
						success: false,
						issues: [{ message: error?.message || 'Could not create organization' }]
					}
				}

				return {
					success: true,
					data
				}
			},
			successMessage: 'Organization created!',
			onSuccess: async () => {
				await sessionStore.getSession()
				await invalidateAll()
				formData.name = ''
				dialog?.close()
			},
			onError: () => {
				nameInput?.focus()
			}
		})
	)
</script>

<Dialog bind:dialog appearance="center" onOpen={() => nameInput?.focus()}>
	<Card onClose={() => dialog?.close()}>
		{#snippet title()}
			New Organization
		{/snippet}

		{#snippet subtitle()}
			An organization allows you to collaborate with team members on projects
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
					label="Organization Name"
					required
					bind:value={formData.name}
					placeholder="Enter organization name"
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
