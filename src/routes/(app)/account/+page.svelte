<script lang="ts">
	import APITokens from '$lib/components/modals/NewAPIToken.svelte'
	import { userData } from '$lib/stores/user.svelte'
	import Button from '$lib/components/atoms/Button.svelte'
	import Dropdown from '$lib/components/common/Dropdown.svelte'
	import IconAdd from '~icons/material-symbols/add-2-rounded'
	import IconDots from '~icons/material-symbols/more-vert'
	import IconTrash from '~icons/material-symbols/delete'
	import { page } from '$app/state'
	import { enhance } from '$app/forms'
	import { toast } from 'svelte-sonner'

	let tokenDialog = $state<HTMLDialogElement>()

	const tokens = $derived(page.data.tokens)
</script>

<div class="flex flex-col gap-y-4">
	<h1 class="text-2xl font-semibold">Account</h1>

	<div>
		<div class="flex flex-row items-center justify-start gap-2">
			<h2 class="text-lg font-semibold">Personal Access Tokens</h2>
			<Button variation="link" onClick={() => tokenDialog?.showModal()}>
				{#snippet icon()}
					<IconAdd />
				{/snippet}
			</Button>
		</div>
	</div>

	{#each tokens as token}
		<div class="group/token bg-main-850 border-main-800 relative rounded-lg border transition">
			<div class="relative block w-full transform p-4 pr-8">
				<div>
					<h2 class="mb-1 flex items-center font-medium">
						{token.name}
					</h2>
					<p class="text-main-500 text-sm">
						Created: {new Date(token.created_at).toLocaleDateString()}
					</p>
					{#if token.valid_to}
						<p class="text-main-500 text-sm">
							Expires: {new Date(token.valid_to).toLocaleDateString()}
						</p>
					{/if}
				</div>
			</div>

			<div class="text-main-400 hover:text-main-300 absolute end-4 top-4 transition">
				<Dropdown>
					{#snippet trigger()}
						<IconDots />
					{/snippet}

					{#snippet body()}
						<form
							action="/account?/deleteToken"
							method="POST"
							use:enhance={() => {
								return async ({ update, result }) => {
									if (result.type === 'success') {
										toast.success(`Token "${token.name}" deleted`)
										await update()
									} else {
										toast.error('Token could not be deleted')
									}
								}
							}}
						>
							<input type="hidden" name="name" value={token.name} />
							<button type="submit" class="list-btn w-full text-sm font-medium">
								<IconTrash />
								Delete
							</button>
						</form>
					{/snippet}
				</Dropdown>
			</div>
		</div>
	{:else}
		<div class="text-main-500 text-sm">
			No API tokens yet. Create your first token to get started.
		</div>
	{/each}
</div>

<APITokens bind:dialog={tokenDialog} />
