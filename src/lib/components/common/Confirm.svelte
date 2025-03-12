<script lang="ts">
	import Dialog from '$lib/components/common/Dialog.svelte'
	import Card from '$lib/components/common/Card.svelte'
	import { confirmStore } from '$lib/stores/confirm.svelte'
	import Button from '../atoms/Button.svelte'

	let dialog = $state<HTMLDialogElement>()

	$effect(() => {
		if (confirmStore.active) {
			dialog?.showModal()
			submitBtn?.focus()
		} else {
			dialog?.close()
		}
	})

	let submitBtn = $state<HTMLButtonElement>()
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

				<form
					class="mt-6 flex justify-end gap-2"
					method="dialog"
					onsubmit={() => {
						console.log('confirm')

						confirmStore.confirm()
					}}
				>
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

					<Button variation="danger" type="submit" bind:element={submitBtn}>
						{#snippet body()}
							Confirm
						{/snippet}
					</Button>
				</form>
			{/snippet}
		</Card>
	{/if}
</Dialog>
