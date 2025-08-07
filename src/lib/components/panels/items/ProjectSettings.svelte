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
	import type { resolvedProjectModel } from '$lib/schemas'
	import { getVisibleComponent } from '$lib/stores/canvas.svelte'

	const { nodeId }: { nodeId: string } = $props()

	const componentData = $derived(
		getVisibleComponent(nodeId) as z.infer<typeof resolvedProjectModel>
	)

	interface FormData {
		name: string
	}

	let initialData = $state<FormData>()!
	let formData = $state<FormData>()!

	function setFormdata() {
		const meta = componentData.meta

		initialData = {
			name: meta.name
		}

		formData = clone(initialData)
	}

	setFormdata()

	const { handleSubmit, isLoading } = $derived(
		createFormHandler({
			onSubmit: async data => await saveProject(componentData),
			successMessage: 'Project settings updated!',
			errorMessage: 'Failed to update project settings'
		})
	)
</script>

<PanelItem {nodeId} title="Project Settings" forceOpen={true}>
	<form class="grid gap-3" onsubmit={e => handleSubmit(e, formData)}>
		<InputField required label="Name" name="name" bind:value={formData.name} />

		<div class="flex justify-end">
			<Button variation="vibrant" type="submit" class="py-2" {isLoading}>
				{#snippet body()}
					Save
				{/snippet}
			</Button>
		</div>
	</form>
</PanelItem>
