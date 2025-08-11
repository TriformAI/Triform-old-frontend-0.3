<script lang="ts">
	import InputField from '$lib/components/atoms/InputField.svelte'
	import TextField from '$lib/components/atoms/TextField.svelte'
	import Button from '$lib/components/atoms/Button.svelte'
	import { toast } from 'svelte-sonner'
	import { debounce } from '$lib/utils/debounce'
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

	const debouncedSave = debounce(async () => {
		const res = await saveProject(componentData)
		console.log(res)
	}, 500)
</script>

<PanelItem {nodeId} title="Project Settings" forceOpen={true}>
	<InputField
		required
		label="Name"
		name="name"
		bind:value={componentData.meta.name}
		oninput={debouncedSave}
	/>
</PanelItem>
