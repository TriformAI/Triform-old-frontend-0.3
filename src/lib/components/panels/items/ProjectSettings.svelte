<script lang="ts">
	import InputField from '$lib/components/atoms/InputField.svelte'
	import TextField from '$lib/components/atoms/TextField.svelte'
	import Button from '$lib/components/atoms/Button.svelte'
	import { toast } from 'svelte-sonner'
	import { clone } from '$lib/utils/clone'
	import PanelItem from '../PanelItem.svelte'
	import { saveProject } from '$lib/actions/project'
	import { createFormHandler } from '$lib/stores/formHandler.svelte'
	import type { z } from 'zod'
	import type { resolvedComponentModel } from '$lib/schemas'

	const { componentData }: { componentData: z.infer<typeof resolvedComponentModel> } = $props()

	interface FormData {
		name: string
		intention: string
	}

	let initialData = $state<FormData>()!
	let formData = $state<FormData>()!

	function setFormdata() {
		const meta = componentData.meta

		initialData = {
			name: meta.name,
			intention: meta.intention
		}

		formData = clone(initialData)
	}

	setFormdata()

	const { handleSubmit, isLoading } = $derived(
		createFormHandler({
			onSubmit: async data => await saveProject(componentData.id, { meta: formData }),
			successMessage: 'Project settings updated!',
			errorMessage: 'Failed to update project settings'
		})
	)
</script>

<PanelItem {componentData} title="Project Settings" forceOpen={true}>
	<form class="grid gap-3" onsubmit={e => handleSubmit(e, formData)}>
		{isLoading}
		<InputField required label="Name" name="name" bind:value={formData.name} />

		<TextField required label="Intention" name="intention" bind:value={formData.intention} />

		<div class="flex justify-end">
			<Button variation="vibrant" type="submit" class="py-2" {isLoading}>
				{#snippet body()}
					Save
				{/snippet}
			</Button>
		</div>
	</form>
</PanelItem>
