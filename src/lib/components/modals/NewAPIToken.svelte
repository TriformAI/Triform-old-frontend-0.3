<script lang="ts">
	import Dialog from '$lib/components/common/Dialog.svelte'
	import Code from '../atoms/Code.svelte'
	import Card from '$lib/components/common/Card.svelte'
	import InputField from '../atoms/InputField.svelte'
	import Button from '../atoms/Button.svelte'
	import { enhance } from '$app/forms'
	import { toast } from 'svelte-sonner'
	import { page } from '$app/stores'

	interface Props {
		dialog?: HTMLDialogElement
	}

	let { dialog = $bindable() }: Props = $props()

	let isLoading = $state(false)
	let createdToken = $state<string | null>(null)
</script>

<Dialog bind:dialog appearance="center">
	<Card onClose={() => dialog?.close()}>
		{#snippet title()}
			{createdToken ? 'Personal Access Token Created' : 'Create Personal Access Token'}
		{/snippet}

		{#snippet subtitle()}
			{createdToken
				? 'Save this token - it will not be shown again'
				: 'Generate a new personal API token'}
		{/snippet}

		{#snippet body()}
			{#if createdToken}
				<div class="flex flex-col gap-y-6">
					<InputField name="token" value={createdToken} readonly />
					<Button variation="vibrant" class="w-full" onClick={() => dialog?.close()}>
						{#snippet body()}
							Close
						{/snippet}
					</Button>
				</div>
			{:else}
				<div class="space-y-6">
					<div class="text-main-400 text-sm">
						Personal access tokens function like passwords. Keep them secure and don't share them.
					</div>

					<form
						action="/account?/createAPIToken"
						method="POST"
						class="space-y-4"
						use:enhance={() => {
							isLoading = true
							return async ({ update, result }) => {
								if (result.type === 'success' && result.data) {
									toast.success('Personal access token created!')
									createdToken = (result.data as any).token || (result.data as any)
								}

								if (result.type === 'failure') {
									toast.error((result.data as any)?.message || 'Could not create token')
								}

								isLoading = false
								await update()
							}
						}}
					>
						<InputField
							name="name"
							label="Token Name"
							placeholder="e.g., My Integration Token"
							required
						/>

						<Button variation="vibrant" type="submit" class="w-full" {isLoading}>
							{#snippet body()}
								Generate Token
							{/snippet}
						</Button>
					</form>
				</div>
			{/if}
		{/snippet}
	</Card>
</Dialog>
