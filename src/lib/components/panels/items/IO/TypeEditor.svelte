<script lang="ts">
	// this will turn into a fully fledged GUI for editing the type of a port,
	// but for now you just gotta write the type "manually" with python-like syntax

	import InputField from '$lib/components/atoms/InputField.svelte'
	import {
		jsonSchemaTypeModel,
		pythonTypeToJsonSchema,
		jsonSchemaTypeToPython,
		validatePythonTypeString
	} from '$lib/schemas'
	import type * as z from 'zod'

	let {
		typeValue = $bindable(),
		onblur: blurFn,
		readonly = false
	}: {
		typeValue: z.infer<typeof jsonSchemaTypeModel>
		onblur: () => void
		readonly?: boolean
	} = $props()

	let updatedValue = $state(jsonSchemaTypeToPython(typeValue))

	const onblur = () => {
		typeValue = pythonTypeToJsonSchema(updatedValue) as z.infer<typeof jsonSchemaTypeModel>
		blurFn?.()
	}

	const validationFn = (value: string) => validatePythonTypeString(value).error
</script>

<InputField
	bind:value={updatedValue}
	placeholder="Eg int, List[str], ..."
	class="font-mono text-sm"
	containerClass="w-full"
	{onblur}
	{validationFn}
	{readonly}
/>
