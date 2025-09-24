<script lang="ts">
	import LightEditor from '$lib/components/atoms/LightEditor.svelte'
	import { debounce } from '$lib/utils/debounce'
	import { addPort, getVisibleComponent, refreshFlow } from '$lib/stores/canvas.svelte'
	import { updateComponent } from '$lib/actions/components'
	import { toast } from 'svelte-sonner'
	import type { z } from 'zod'
	import { agentMessagesModel, agentModel, availableAgentModels } from '$lib/schemas'
	import PromptElement from './PromptElement.svelte'
	import AdvancedSetting from './AdvancedSetting.svelte'
	import type { FormEventHandler } from 'svelte/elements'
	import { tick } from 'svelte'
	import { clone } from '$lib/utils/clone'

	const { nodeId }: { nodeId: string } = $props()

	let componentData = $derived(getVisibleComponent(nodeId) as z.infer<typeof agentModel>)

	const debouncedSave = debounce(async () => {
		const res = await updateComponent(componentData, false)
		if (!res.success) toast.error(`Failed saving ${componentData.meta.name}`)
	}, 500)

	let hasJsonErrors = $state(false)

	const agentModels = availableAgentModels
	let messagesEnabled = $derived('messages' in componentData.spec.inputs)

	// Advanced settings state
	let temperatureEnabled = $derived(componentData.spec.settings.temperature !== undefined)
	let topPEnabled = $derived(componentData.spec.settings.topP !== undefined)
	let maxTokensEnabled = $derived(componentData.spec.settings.maxTokens !== undefined)

	const toggleMessages = async () => {
		await tick()
		try {
			if (messagesEnabled) {
				try {
					await addPort(nodeId, 'messages', agentMessagesModel.parse({}).schema, 'input')
					await addPort(nodeId, 'messages', agentMessagesModel.parse({}).schema, 'output')
				} catch (err) {
					messagesEnabled = false
					throw err
				}
			} else {
				delete componentData.spec.inputs.messages
				delete componentData.spec.outputs.messages
			}
			debouncedSave()
			refreshFlow()
		} catch (err) {
			console.error('Failed to toggle messages', err)
			toast.error('Failed to toggle messages')
		}
	}

	const createToggleFunction = <K extends keyof typeof componentData.spec.settings>(
		key: K,
		defaultValue: number,
		isEnabled: () => boolean
	) => {
		return async () => {
			await tick()
			if (!isEnabled()) {
				// If currently disabled, enable and set to default
				;(componentData.spec.settings as Record<K, number>)[key] = defaultValue
			} else {
				// If currently enabled, disable and set to undefined
				;(componentData.spec.settings as Record<K, number | undefined>)[key] = undefined
			}
			debouncedSave()
		}
	}

	const toggleTemperature = createToggleFunction('temperature', 0.7, () => temperatureEnabled)
	const toggleTopP = createToggleFunction('topP', 0.95, () => topPEnabled)
	const toggleMaxTokens = createToggleFunction('maxTokens', 1000, () => maxTokensEnabled)
</script>

<div class="grid max-w-full gap-6 p-5 pt-4">
	<label class="grid gap-2">
		<span class="eyebrow">Model</span>
		<select class="input-text" bind:value={componentData.spec.model} oninput={debouncedSave}>
			{#each agentModels as model}
				<option value={model}>{model}</option>
			{/each}
		</select>
	</label>

	<div class="grid gap-3">
		<p class="eyebrow">Prompts</p>

		<PromptElement
			label="1. System"
			bind:value={componentData.spec.prompts.system[0].value}
			onUpdate={debouncedSave}
			inputs={componentData.spec.inputs}
			bind:enabled={componentData.spec.prompts.system[0].enabled}
		/>

		<div
			class={[
				'bg-main-900 flex flex-row justify-between gap-2 rounded-md p-3 pr-4 pb-4',
				!messagesEnabled && 'opacity-50'
			]}
		>
			<div class="flex flex-col gap-2">
				<span class="text-main-400 text-sm font-medium"> 2. Messages list </span>
				<span class="text-main-300 ms-1">
					Load past conversation history from the
					<span class="text-main-50 font-mono"> messages </span>
					input
				</span>
			</div>
			<input
				type="checkbox"
				class="checkbox mt-1 size-[1.3rem]"
				bind:checked={messagesEnabled}
				oninput={toggleMessages}
			/>
		</div>

		<PromptElement
			label="3. User"
			bind:value={componentData.spec.prompts.user[0].value}
			onUpdate={debouncedSave}
			inputs={componentData.spec.inputs}
			bind:enabled={componentData.spec.prompts.user[0].enabled}
		/>
	</div>

	<div>
		<p class="eyebrow mb-3">Advanced settings</p>
		<div class="flex flex-col gap-3">
			<AdvancedSetting
				label="Temperature"
				description="Controls randomness in responses"
				enabled={temperatureEnabled}
				bind:value={componentData.spec.settings.temperature}
				defaultValue={0.7}
				min={0}
				max={1}
				step={0.1}
				onToggle={toggleTemperature}
				onInput={debouncedSave}
			/>

			<AdvancedSetting
				label="Top P"
				description="Controls diversity via nucleus sampling"
				enabled={topPEnabled}
				bind:value={componentData.spec.settings.topP}
				defaultValue={0.95}
				min={0}
				max={1}
				step={0.05}
				onToggle={toggleTopP}
				onInput={debouncedSave}
			/>

			<AdvancedSetting
				label="Max Tokens"
				description="Maximum response length limit"
				enabled={maxTokensEnabled}
				bind:value={componentData.spec.settings.maxTokens}
				defaultValue={1000}
				min={0}
				step={10}
				onToggle={toggleMaxTokens}
				onInput={debouncedSave}
			/>
		</div>
	</div>
</div>
