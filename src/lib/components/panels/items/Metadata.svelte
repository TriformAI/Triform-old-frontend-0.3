<script lang="ts">
	import InputField from '$lib/components/atoms/InputField.svelte'
	import TextField from '$lib/components/atoms/TextField.svelte'
	import { toast } from 'svelte-sonner'
	import { debounce } from '$lib/utils/debounce'
	import PanelItem from '../PanelItem.svelte'
	import type { z } from 'zod'
	import type { resolvedComponentModel } from '$lib/schemas'
	import { getVisibleComponent } from '$lib/stores/canvas.svelte'
	import { updateComponent } from '$lib/actions/components'

	const { nodeId }: { nodeId: string } = $props()

	let componentData = $derived(
		getVisibleComponent(nodeId) as z.infer<typeof resolvedComponentModel>
	)

	const debouncedSave = debounce(async () => {
		const res = await updateComponent(componentData)
		if (!res.success) toast.error(`Failed saving ${componentData.meta.name}`)
	}, 500)
</script>

{#if componentData}
	<PanelItem {nodeId} title="Metadata">
		<div class="grid grid-cols-2 gap-3">
			<InputField
				containerClass="col-span-2"
				required
				label="Name"
				name="name"
				oninput={debouncedSave}
				bind:value={componentData.meta.name}
			/>

			<TextField
				rows={3}
				class="col-span-2"
				label="Intention"
				name="intention"
				oninput={debouncedSave}
				bind:value={componentData.meta.intention}
			/>
		</div>
	</PanelItem>
{/if}
