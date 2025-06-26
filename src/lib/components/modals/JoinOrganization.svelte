<script lang="ts">
	import Dialog from '$lib/components/common/Dialog.svelte'
	import Card from '$lib/components/common/Card.svelte'
	import InputField from '../atoms/InputField.svelte'
	import Button from '../atoms/Button.svelte'
	import { enhance } from '$app/forms'
	import { toast } from 'svelte-sonner'
	import { page } from '$app/state'
	import { invalidateAll } from '$app/navigation'
	import type { Organization } from '$lib/types/auth'

	interface Props {
		dialog?: HTMLDialogElement
	}

	let { dialog = $bindable() }: Props = $props()

	let isLoading = $state(false)
</script>

<Dialog bind:dialog appearance="center">
	<Card onClose={() => dialog?.close()}>
		{#snippet title()}
			Join Organization
		{/snippet}

		{#snippet subtitle()}
			Enter the organization ID below to join
		{/snippet}

		{#snippet body()}
			<form
				action="/account?/joinOrganization"
				method="POST"
				class="space-y-4"
				use:enhance={({ cancel, formData }) => {
					isLoading = true

					// Prevent joining the same organization twice on client side
					if (
						page.data.organizations
							?.map((o: Organization) => o.id)
							.includes((formData.get('id') as string) || '')
					) {
						toast.error('You are already a member of this organization')
						isLoading = false
						cancel()
					}

					return async ({ update, result }) => {
						if (result.type === 'success') {
							toast.success('Successfully joined organization!')
							await invalidateAll()
							dialog?.close()
						} else if (result.type === 'failure') {
							toast.error((result.data as any)?.message || 'Could not join organization')
						}

						isLoading = false
						await update()
					}
				}}
			>
				<InputField
					name="id"
					label="Invite Token"
					placeholder="12345678-1234-1234-1234-123456789012"
					required
				/>

				<Button variation="vibrant" type="submit" class="w-full" {isLoading}>
					{#snippet body()}
						Join
					{/snippet}
				</Button>
			</form>
		{/snippet}
	</Card>
</Dialog>
