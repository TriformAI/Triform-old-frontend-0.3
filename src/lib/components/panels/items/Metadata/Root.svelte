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
	import { saveProject } from '$lib/actions/project'
	import ListText from './ListText.svelte'
	import ListNameDescType from './ListNameDescType.svelte'
	import { onMount } from 'svelte'
	import { getUserMessage, chat } from '$lib/stores/chat.svelte'
	import GenerateButton from '$lib/components/atoms/GenerateButton.svelte'
	import { requirements, getDefaultRequirements } from '$lib/stores/requirements.svelte'
	import { generateRequirements as generateComponentRequirements } from '$lib/actions/components'
	import { generateRequirements as generateProjectRequirements } from '$lib/actions/project'

	const { nodeId }: { nodeId: string } = $props()

	let componentData = $derived(
		getVisibleComponent(nodeId) as z.infer<typeof resolvedComponentModel>
	)

	const componentType = $derived(componentData?.resource.split('/')[0])
	const isProject = $derived(componentType === 'project')

	onMount(async () => {
		// Get current requirements or an empty object if none exist
		const result = await getRequirements(isProject ? 'projects' : 'components', componentData.id)

		if (result.data) {
			requirements.value = result.data
		}
	})

	const debouncedSaveComponent = debounce(async () => {
		const res = isProject
			? await saveProject(componentData)
			: await updateComponent(componentData, false)
		if (!res.success) toast.error(`Failed saving ${componentData.meta.name}`)
	}, 500)

	const debouncedSaveRequirements = debounce(async () => {
		const res = await upsertRequirements(
			isProject ? 'projects' : 'components',
			componentData.id,
			requirements.value
		)
		if (!res.success) toast.error(`Failed saving ${componentData.meta.name}`)
	}, 500)

	let generatingReqs = $state(false)
	const generateRequirements = async () => {
		// component
		generatingReqs = true
		const res = isProject
			? await generateProjectRequirements(componentData.id)
			: await generateComponentRequirements(componentData.id)
		generatingReqs = false
		if (!res.success) return toast.error(`Failed generating requirements`)
		requirements.value = res.data
	}

	const allowGeneration = $derived(!chat.socket || componentData?.meta?.intention?.length >= 10)
</script>

{#if componentData}
	<PanelItem {nodeId} title="Information" fillHeight={false}>
		<div class="grid auto-rows-min items-start gap-3">
			<TextField
				rows={3}
				label="Description"
				name="intention"
				oninput={debouncedSaveComponent}
				bind:value={componentData.meta.intention}
				id="metadata-description-input"
			/>
		</div>
	</PanelItem>
	<PanelItem
		{nodeId}
		title="Requirements"
		tip="Specifications for the component, used eg by the Builder to build the resource"
	>
		<!-- {#snippet titleSuffix()}
			<div class="ml-auto">
				<GenerateButton
					label="Generate"
					onClick={generateRequirements}
					disabled={!allowGeneration}
					tooltip={!allowGeneration ? 'Description must be at least 10 characters' : undefined}
					loading={generatingReqs}
					type="generate"
				/>
			</div>
		{/snippet} -->
		<div class="grid auto-rows-min items-start gap-3">
			<div class="mt-4 grid gap-4">
				<ListText
					title="Context"
					bind:value={requirements.value.context}
					onUpdate={debouncedSaveRequirements}
				/>

				<ListText
					title="User stories"
					bind:value={requirements.value.userStories}
					onUpdate={debouncedSaveRequirements}
				/>

				<ListText
					title="Outcomes"
					bind:value={requirements.value.outcomes}
					onUpdate={debouncedSaveRequirements}
				/>

				<ListText
					title="Guidelines"
					bind:value={requirements.value.guidelines}
					onUpdate={debouncedSaveRequirements}
				/>

				<ListNameDescType
					title="Dependencies"
					bind:value={requirements.value.dependencies}
					onUpdate={debouncedSaveRequirements}
				/>

				<ListText
					title="Boundaries"
					bind:value={requirements.value.boundaries}
					onUpdate={debouncedSaveRequirements}
				/>

				<ListText
					title="Safety"
					bind:value={requirements.value.safety}
					onUpdate={debouncedSaveRequirements}
				/>
			</div>
		</div>
	</PanelItem>
{/if}
