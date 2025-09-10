<script lang="ts">
	import LightEditor from '$lib/components/atoms/LightEditor.svelte'
	import { agentModel } from '$lib/schemas'
	import type { z } from 'zod'
	import ToolbarButton from './ToolbarButton.svelte'
	import InputsIcon from '~icons/material-symbols/input-circle-rounded'
	import IconVariables from '~icons/material-symbols/vpn-key-rounded'
	import type { createEditor } from 'prism-code-editor'
	import { insertText } from 'prism-code-editor/utils'

	let {
		value = $bindable(),
		onUpdate,
		label,
		inputs,
		enabled = $bindable()
	}: {
		value: string
		onUpdate: () => void
		label: string
		inputs: z.infer<typeof agentModel.shape.spec.shape.inputs>
		enabled: boolean
	} = $props()

	const availableInputs = $derived(
		Object.keys(inputs)
			.filter(i => i !== 'messages')
			.map(i => ({
				label: i,
				onClick: () => {
					if (!editor) return
					insertText(editor as ReturnType<typeof createEditor>, `{{inputs.${i}}}`)
				}
			}))
	)

	// @ts-expect-error not defined before the editor is initialized
	let editor: ReturnType<typeof createEditor> = $state()
</script>

<div
	class={[
		'bg-main-900 flex flex-row justify-between gap-x-2 rounded-md px-4 py-2 transition-opacity',
		!enabled && 'opacity-50'
	]}
>
	<div class="flex w-full flex-col gap-y-2">
		<div
			class={[
				'flex flex-row justify-between',
				!enabled && 'pointer-events-none cursor-not-allowed'
			]}
		>
			<span class="text-main-400 text-sm font-medium">
				{label}
			</span>
			<div class="mr-2 flex flex-row items-center">
				<ToolbarButton items={availableInputs} label="Inputs">
					{#snippet icon()}
						<InputsIcon class="size-4 rotate-180" />
					{/snippet}
				</ToolbarButton>
				<!-- <ToolbarButton items={[]} label="Variables">
					{#snippet icon()}
						<IconVariables class="size-4" />
					{/snippet}
				</ToolbarButton> -->
			</div>
		</div>
		<LightEditor
			language="handlebars"
			bind:value
			{onUpdate}
			class={['-ms-2 text-sm', !enabled && '!pointer-events-none']}
			wordWrap={true}
			readOnly={!enabled}
			id={`prompt-editor-${label.toLowerCase().replace(' ', '-')}`}
			bind:editor
		/>
	</div>

	<input
		type="checkbox"
		class="checkbox mt-1 size-[1.3rem]"
		bind:checked={enabled}
		oninput={onUpdate}
	/>
</div>
