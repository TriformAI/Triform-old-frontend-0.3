<script lang="ts">
	import { getVisibleComponent } from '$lib/stores/canvas.svelte'
	import { jsonSchemaTypeToPython, pythonTypeToJsonSchema, jsonSchemaTypeModel } from '$lib/schemas'
	import InputField from '$lib/components/atoms/InputField.svelte'
	import * as z from 'zod'
	import { debounce } from '$lib/utils/debounce'
	import { updateComponent } from '$lib/actions/components'
	import { toast } from 'svelte-sonner'
	import type { resolvedComponentModel } from '$lib/schemas'
	import TypeEditor from './TypeEditor.svelte'

	let {
		nodeId,
		type,
		readonly = false
	}: { nodeId: string; type: 'input' | 'output'; readonly?: boolean } = $props()

	const component = $derived(getVisibleComponent(nodeId) as z.infer<typeof resolvedComponentModel>)
	const ports = $derived(
		type === 'input'
			? 'inputs' in component?.spec
				? Object.entries(component.spec.inputs)
				: []
			: 'outputs' in component?.spec
				? // @ts-expect-error typing
					Object.entries(component.spec.outputs)
				: []
	)

	const validateType = (value: string) => jsonSchemaTypeModel.safeParse(value).success

	const saveComponent = debounce(async () => {
		const res = await updateComponent(component)
		if (!res.success) toast.error(`Failed saving ${component.meta.name}`)
	}, 500)
</script>

<div>
	<h4 class="text-main-300 flex flex-row items-center gap-3 text-sm capitalize">
		{type}s
		<div class="bg-main-700/80 h-px w-full"></div>
	</h4>
	<div class="mt-1 grid grid-cols-[max-content_1fr] items-center gap-2">
		<p class="text-main-400 text-sm">Port name</p>
		<p class="text-main-400 text-sm">Type</p>
		{#each ports as [key, port]}
			<div
				class="text-main-300 bg-main-950/70 flex w-fit items-center rounded-md px-3 py-1.5 font-mono text-sm"
			>
				<span>{key}</span>
			</div>
			<TypeEditor bind:typeValue={port.type} onblur={saveComponent} {readonly} />
		{/each}
	</div>
</div>
