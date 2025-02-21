<script lang="ts">
	import Dialog from '$lib/components/common/Dialog.svelte'
	import Card from '$lib/components/common/Card.svelte'
	import { confirmStore } from '$lib/stores/confirm.svelte'
	import Button from '../atoms/Button.svelte'

	let dialog = $state<HTMLDialogElement>()

	$effect(() => {
		if (confirmStore.active) {
			dialog?.showModal()
		} else {
			dialog?.close()
		}
	})
</script>

<Dialog
	closeByClickOutside={false}
	bind:dialog
	appearance="center"
	onClose={() => confirmStore.cancel()}
>
	{#if confirmStore}
		<Card>
			{#snippet header()}
				{confirmStore.title}
			{/snippet}

			{#snippet body()}
				<p>
					{confirmStore.message}
				</p>

				<div class="mt-6 flex justify-end gap-2">
					<Button
						variation="link"
						onClick={() => {
							confirmStore.cancel()
						}}
					>
						{#snippet body()}
							Cancel
						{/snippet}
					</Button>

					<Button
						variation="danger"
						onClick={() => {
							confirmStore.confirm()
						}}
					>
						{#snippet body()}
							Confirm
						{/snippet}
					</Button>

					<!-- <button
						type="button"
						onclick={() => {
							confirmStore.cancel()
						}}>Cancel</button
					> -->
				</div>
			{/snippet}
		</Card>
	{/if}
</Dialog>
