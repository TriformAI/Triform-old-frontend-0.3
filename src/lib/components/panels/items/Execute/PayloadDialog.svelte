<script lang="ts">
	import Dialog from '$lib/components/common/Dialog.svelte'
	import Card from '$lib/components/common/Card.svelte'
	import InputField from '$lib/components/atoms/InputField.svelte'
	import Button from '$lib/components/atoms/Button.svelte'
	import { API } from '$lib/api'
	import type { Payload } from '$lib/types/resources'
	import TextField from '$lib/components/atoms/TextField.svelte'
	import LightEditor from '$lib/components/atoms/LightEditor.svelte'
	import { toast } from 'svelte-sonner'
	import { invalidate } from '$app/navigation'

	interface Props {
		dialog?: HTMLDialogElement
		payload?: string
	}

	let { dialog = $bindable(), payload }: Props = $props()

	let name = $state('')

	const api = new API()

	async function onSubmit(e: Event) {
		e.preventDefault()
		try {
			const result = await api.post<Payload>('payloads', { payload, name })
			toast.success('Payload saved successfully')
			invalidate('project')
		} catch (error) {
			toast.error('Failed to save payload')
		}
		dialog?.close()
	}

	let isLoading = $state(false)
</script>

<Dialog bind:dialog appearance="center">
	<Card>
		{#snippet title()}
			Save payload
		{/snippet}

		{#snippet subtitle()}
			Save the payload for later use
		{/snippet}

		{#snippet body()}
			<form action="/api/payloads" method="post" class="grid gap-4" onsubmit={onSubmit}>
				<InputField required label="Name" name="name" bind:value={name} autocomplete="off" />

				<div>
					<p class="input-title mb-2">Payload</p>
					<div class="bg-main-800/50 rounded-lg p-3">
						<LightEditor
							language="json"
							bind:value={payload}
							onUpdate={v => (payload = v)}
							class="text-sm"
						/>
					</div>
				</div>

				<div class="flex justify-end gap-2">
					<Button variation="link" onClick={() => dialog?.close()}>
						{#snippet body()}
							Cancel
						{/snippet}
					</Button>

					<Button variation="vibrant" type="submit" {isLoading}>
						{#snippet body()}
							Save
						{/snippet}
					</Button>
				</div>
			</form>
		{/snippet}
	</Card>
</Dialog>
