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
	import { getUserMessage, chat } from '$lib/components/Chat/chatStore.svelte'
	import GenerateButton from '$lib/components/atoms/GenerateButton.svelte'
	import { requirements, getDefaultRequirements } from '$lib/stores/requirements.svelte'
	import { requirementsModel } from '$lib/schemas/requirements'
	type Requirements = z.infer<typeof requirementsModel>

	const { nodeId }: { nodeId: string } = $props()

	let componentData = $derived(
		getVisibleComponent(nodeId) as z.infer<typeof resolvedComponentModel>
	)

	const componentType = $derived(componentData?.resource.split('/')[0])
	const isProject = $derived(componentType === 'project')

	const componentRequirements = $state<Requirements>(getDefaultRequirements())

	onMount(async () => {
		// Get current requirements or an empty object if none exist
		const result = await getRequirements(isProject ? 'projects' : 'components', componentData.id)

		if (result.data) {
			requirements.value = result.data
		}
	})

	$effect(() => {
		// Save requirements when content updates
		$state.snapshot(requirements.value) // establishes dependency on any nested change
		debouncedSaveRequirements()
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

	function generateRequirements() {
		const msg = getUserMessage()
		msg.data.content[0].text = `generate requirements`
		msg.data.context = {
			[`@${componentData.meta.name}`]: {
				component_id: componentData.id
			}
		}

		console.log(msg)

		if (!chat.socket) {
			toast.error('Could not connect to generator')
			return
		}

		chat.socket.send(JSON.stringify(msg))
	}
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

			{#if componentType !== 'project'}
				<TextField
					rows={3}
					label="Description"
					name="intention"
					oninput={debouncedSaveComponent}
					bind:value={componentData.meta.intention}
				/>
			{/if}

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
				<div class="flex justify-between">
					<p class="eyebrow mb-1">Requirements</p>
					{#if componentData.meta.intention}
						<GenerateButton
							label="Generate"
							onClick={generateRequirements}
							disabled={!chat.socket || componentData.meta.intention.length < 10}
						/>
					{/if}
				</div>

				<TextField
					rows={3}
					label="Context"
					name="context"
					bind:value={requirements.value.context.text}
				/>

				<ListText title="User stories" bind:value={requirements.value.userStories} />

				<ListText title="Outcomes" bind:value={requirements.value.outcomes} />

				<ListText title="Guidelines" bind:value={requirements.value.guidelines} />

				<ListNameDescType title="Dependencies" bind:value={requirements.value.dependencies} />

				<ListText title="Boundaries" bind:value={requirements.value.boundaries} />

				<ListText title="Safety" bind:value={requirements.value.safety} />
			</div>
		</div>
	</PanelItem>
{/if}
