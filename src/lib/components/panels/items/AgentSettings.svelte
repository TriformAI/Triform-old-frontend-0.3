<script lang="ts">
	import LightEditor from '$lib/components/atoms/LightEditor.svelte'
	import { debounce } from '$lib/utils/debounce'
	import { getVisibleComponent } from '$lib/stores/canvas.svelte'
	import { updateComponent } from '$lib/actions/components'
	import { toast } from 'svelte-sonner'
	import type { z } from 'zod'
	import { agentModel } from '$lib/schemas'

	const { nodeId }: { nodeId: string } = $props()

	let componentData = $derived(getVisibleComponent(nodeId) as z.infer<typeof agentModel>)

	const debouncedSave = debounce(async () => {
		console.log('debouncedSave')

		const res = await updateComponent(componentData)
		if (!res.success) toast.error(`Failed saving ${componentData.meta.name}`)
	}, 500)

	let hasJsonErrors = $state(false)

	function setPayload(value: string, key: 'system' | 'user') {
		componentData.spec.prompts[key] = [{ type: 'template', value }]
	}

	const agentModels = Object.values(agentModel.shape.spec.shape.model.enum)
</script>

<div class="grid gap-6 p-5 pt-4">
	<label class="grid gap-2">
		<span class="eyebrow">Model</span>
		<select class="input-text" bind:value={componentData.spec.model}>
			{#each agentModels as model}
				<option value={model}>{model.split('/').slice(1).join('/')}</option>
			{/each}
		</select>
	</label>

	<div class="grid gap-2">
		<p class="eyebrow">Prompts</p>

		<div class="bg-main-800/50 rounded-lg p-3 text-sm">
			<span class="input-title">System</span>
			<LightEditor
				wordWrap={true}
				language="handlebars"
				value={componentData.spec.prompts.system[0].value}
				onUpdate={v => {
					setPayload(v, 'system')
					debouncedSave()
				}}
			/>
		</div>

		<div class="bg-main-800/50 rounded-lg p-3 text-sm">
			<span class="input-title -mt-1">User</span>
			<LightEditor
				wordWrap={true}
				language="handlebars"
				value={componentData.spec.prompts.user[0].value}
				onUpdate={v => {
					setPayload(v, 'user')
					debouncedSave()
				}}
			/>
		</div>
	</div>

	<div>
		<p class="eyebrow mb-3">Finetuning</p>
		<div class="grid grid-cols-3 gap-2">
			<label>
				<span class="input-title -mt-1">Temperature</span>
				<input
					required
					min="0"
					max="1"
					step="0.1"
					class="input-text"
					type="number"
					oninput={debouncedSave}
					bind:value={componentData.spec.settings.temperature}
				/>
			</label>

			<label>
				<span class="input-title">Top P</span>
				<input
					required
					class="input-text"
					type="number"
					min="0"
					max="1"
					step="0.05"
					oninput={debouncedSave}
					bind:value={componentData.spec.settings.topP}
				/>
			</label>

			<label>
				<span class="input-title">Max Tokens</span>
				<input
					required
					min="0"
					step="10"
					class="input-text"
					type="number"
					oninput={debouncedSave}
					bind:value={componentData.spec.settings.maxTokens}
				/>
			</label>
		</div>
	</div>
</div>
