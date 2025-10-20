<script lang="ts">
	import InputField from '$lib/components/atoms/InputField.svelte'
	import { debounce } from '$lib/utils/debounce'
	import PanelItem from '../PanelItem.svelte'
	import { saveProject } from '$lib/actions/project'
	import type { z } from 'zod'
	import type { resolvedProjectModel } from '$lib/schemas'
	import { getProject, getVisibleComponent } from '$lib/stores/canvas.svelte'
	import LightEditor from '$lib/components/atoms/LightEditor.svelte'

	const { nodeId }: { nodeId: string } = $props()

	const componentData = $derived(getProject())

	const debouncedSave = debounce(async () => {
		if (!componentData)
			return console.warn('couldnt save project settings, componentData not found')
		const res = await saveProject(componentData)
		console.log(res)
	}, 500)
</script>

<PanelItem {nodeId} title="Settings" forceOpen={true}>
	<div class="flex flex-col gap-y-4">
		<div>
			<span class="input-title">Readme</span>
			<LightEditor
				language="md"
				bind:value={componentData.spec.readme}
				wordWrap={true}
				class="bg-main-800 h-24 w-full rounded-md ps-6 pt-2.5 text-sm"
				onUpdate={debouncedSave}
			/>
		</div>
		<InputField
			label="MCP Server"
			value={`https://${document.location.host}/api/projects/${componentData.id}/mcp`}
			oninput={debouncedSave}
			readonly
		/>
	</div>
</PanelItem>
