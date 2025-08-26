<script lang="ts">
	import InputField from '$lib/components/atoms/InputField.svelte'
	import TextField from '$lib/components/atoms/TextField.svelte'
	import LightEditor from '$lib/components/atoms/LightEditor.svelte'
	import { toast } from 'svelte-sonner'
	import { debounce } from '$lib/utils/debounce'
	import PanelItem from '$lib/components/panels/PanelItem.svelte'
	import type { z } from 'zod'
	import type { resolvedComponentModel } from '$lib/schemas'
	import { getVisibleComponent } from '$lib/stores/canvas.svelte'
	import { updateComponent, upsertRequirements, getRequirements } from '$lib/actions/components'
	import ListText from './ListText.svelte'
	import ListNameDescType from './ListNameDescType.svelte'
	import { requirementsModel } from '$lib/schemas/requirements'
	import { onMount } from 'svelte'

	type Requirements = z.infer<typeof requirementsModel>

	const { nodeId }: { nodeId: string } = $props()

	let componentData = $derived(
		getVisibleComponent(nodeId) as z.infer<typeof resolvedComponentModel>
	)

	let requirements = $state<Requirements>({
		context: { text: '' },
		userStories: [],
		outcomes: [],
		guidelines: [],
		dependencies: [],
		boundaries: [],
		safety: []
	})

	onMount(async () => {
		// Get current requirements or an empty object if none exist
		console.log('componentData.id', componentData.id)

		const result = await getRequirements(componentData.id)

		if (result.data) {
			requirements = result.data
		}
	})

	$effect(() => {
		// Save requirements when content updates
		if ($state.snapshot(requirements)) {
			debouncedSaveRequirements()
		}
	})

	const debouncedSaveComponent = debounce(async () => {
		const res = await updateComponent(componentData, false)
		if (!res.success) toast.error(`Failed saving ${componentData.meta.name}`)
	}, 500)

	const debouncedSaveRequirements = debounce(async () => {
		const res = await upsertRequirements(componentData.id, requirements)
		if (!res.success) toast.error(`Failed saving ${componentData.meta.name}`)
	}, 500)

	const componentType = $derived(componentData?.resource.split('/')[0])
</script>

{#if componentData}
	<PanelItem {nodeId} title="Metadata">
		<div class="grid auto-rows-min items-start gap-3">
			<InputField
				required
				label="Name"
				name="name"
				oninput={debouncedSaveComponent}
				bind:value={componentData.meta.name}
			/>

			<TextField
				rows={3}
				label="Description"
				name="intention"
				oninput={debouncedSaveComponent}
				bind:value={componentData.meta.intention}
			/>

			{#if componentType !== 'action'}
				<div>
					<span class="input-title">Readme</span>
					<LightEditor
						language="md"
						bind:value={componentData.spec.readme}
						wordWrap={true}
						class="bg-main-800  h-24 w-full rounded-md ps-6 pt-2.5 text-sm"
						onUpdate={debouncedSaveComponent}
					/>
				</div>
			{/if}

			<div class="mt-4 grid gap-4">
				<p class="eyebrow mb-1">Requirements</p>

				<TextField rows={3} label="Context" name="context" bind:value={requirements.context.text} />

				<ListText title="User stories" bind:value={requirements.userStories} />

				<ListText title="Outcomes" bind:value={requirements.outcomes} />

				<ListText title="Guidelines" bind:value={requirements.guidelines} />

				<ListNameDescType title="Dependencies" bind:value={requirements.dependencies} />

				<ListText title="Boundaries" bind:value={requirements.boundaries} />

				<ListText title="Safety" bind:value={requirements.safety} />
			</div>
		</div>
	</PanelItem>
{/if}
