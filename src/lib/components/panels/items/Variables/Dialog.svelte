<script lang="ts">
	import Button from '$lib/components/atoms/Button.svelte'
	import InputField from '$lib/components/atoms/InputField.svelte'
	import IconVariable from '~icons/mdi/key'
	import Dialog from '$lib/components/common/Dialog.svelte'
	import { toast } from 'svelte-sonner'
	import { getProject, getNodePath } from '$lib/stores/canvas.svelte'
	import type * as z from 'zod'
	import type { modifierModel } from '$lib/schemas/modifiers'
	import { saveProject } from '$lib/actions/project'
	import { clone } from '$lib/utils/clone'
	import { createModifier, updateModifier } from '$lib/actions/modifiers'

	let {
		dialog = $bindable(),
		data: sourceData,
		modifierId: sourceModifierId,
		nodePath
	}: {
		dialog: HTMLDialogElement | undefined
		data?: z.infer<typeof modifierModel>
		modifierId?: string
		nodePath: string
	} = $props()

	let name = $state('')
	let key = $state('')
	let value = $state('')
	let isCreating = $state(false)
	let isNew = $state(false)
	let data = $state<z.infer<typeof modifierModel>>()
	let modifierId = $state('')

	const project = $derived(getProject())

	const hasErrors = $derived(!name.trim() || !key.trim() || !value.trim())

	// Create the modifier data structure
	const modifier = $derived.by((): Omit<z.infer<typeof modifierModel>, 'id'> => {
		return {
			resource: 'variable/v1' as const,
			meta: {
				name: name || '',
				intention: `Environment variable: ${key}`
			},
			spec: {
				key: key || '',
				value: value || '',
				secret: false as const
			}
		}
	})

	const handleSubmit = async (e: SubmitEvent) => {
		e.preventDefault()

		if (!modifier || !project || !nodePath) return toast.error('Missing required data')
		if (hasErrors) return toast.error('Please fill in all fields')

		isCreating = true

		// Create snapshot of the project before making changes for rollback
		const snapshot = clone($state.snapshot(project))

		try {
			let createdModifier
			let actualModifierId = modifierId

			if (isNew) {
				// First create the modifier via API to get the modifier_id
				const { data, success } = await createModifier(modifier)
				if (!success) {
					toast.error('Failed to create variable')
					console.error('Failed to create modifier', data)
					return
				}
				createdModifier = data
				actualModifierId = data.id!
			} else {
				// Update existing modifier via API
				if (!actualModifierId) return toast.error('No modifier ID')
				const modifierWithId = { ...modifier, id: actualModifierId }
				const { data, success } = await updateModifier(modifierWithId)
				if (!success) {
					toast.error('Failed to update variable')
					return
				}
				createdModifier = data
			}

			// Initialize modifiers object if it doesn't exist
			if (!project.spec.modifiers) {
				project.spec.modifiers = {}
			}

			// Initialize the array for this node path if it doesn't exist
			if (!project.spec.modifiers[nodePath]) {
				project.spec.modifiers[nodePath] = []
			}

			if (isNew) {
				// Add new modifier to the project
				project.spec.modifiers[nodePath].push({
					modifier_id: actualModifierId,
					spec: createdModifier
				})
			} else {
				// Update existing modifier in the project
				const index = project.spec.modifiers[nodePath].findIndex(
					m => m.modifier_id === actualModifierId
				)
				if (index !== -1) {
					project.spec.modifiers[nodePath][index] = {
						modifier_id: actualModifierId,
						spec: createdModifier
					}
				}
			}

			// Save the project
			const res = await saveProject(project)

			if (!res.success) {
				// Revert the project to its previous state using snapshot
				Object.assign(project, snapshot)
				toast.error('Failed to save variable to project')
				return
			}

			toast.success(isNew ? 'Variable created successfully' : 'Variable updated successfully')
			dialog?.close()
		} catch (e) {
			// Revert the project to its previous state using snapshot
			Object.assign(project, snapshot)
			console.error('Failed to save variable:', e)
			toast.error('Failed to save variable')
		} finally {
			isCreating = false
		}
	}

	// Load data when dialog is opened
	const loadData = () => {
		data = sourceData
		isNew = !data

		// Set modifierId - use existing one or empty for new variables (we'll get it from API)
		modifierId = sourceModifierId || ''

		// Load existing data or reset for new variable
		if (data?.resource === 'variable/v1') {
			name = data.meta.name || ''
			key = data.spec.key || ''
			value = data.spec.value || ''
		} else {
			name = ''
			key = ''
			value = ''
		}

		setTimeout(() => {
			dialog?.querySelector<HTMLInputElement>('input[name="name"]')?.focus()
		})
	}
</script>

<Dialog appearance="right" bind:dialog onOpen={loadData}>
	<div class="grid grid-rows-[auto_1fr]">
		<div class="mb-8 grid auto-rows-min grid-cols-[auto_1fr] items-start gap-x-3">
			<IconVariable class="row-span-2 size-8" />
			<h2 class="font-semibold">
				{isNew ? 'Create variable' : `Edit ${data?.meta.name}`}
			</h2>
			<p class="text-main-400">Environment variables are used to configure your components</p>
		</div>

		<form method="POST" class="grid" onsubmit={handleSubmit}>
			<div class="flex flex-col gap-4">
				<InputField name="name" label="Name" containerClass="" bind:value={name} class="mb-2" />
				<div class="grid grid-cols-2 gap-4">
					<InputField name="key" label="Key" containerClass="" bind:value={key} />
					<InputField name="value" label="Value" containerClass="" bind:value />
				</div>
			</div>

			<div class="mt-auto grid grid-cols-2 gap-4">
				<Button type="button" onClick={() => dialog?.close()}>
					{#snippet body()}
						Cancel
					{/snippet}
				</Button>

				<Button variation="vibrant" type="submit" isLoading={isCreating} disabled={hasErrors}>
					{#snippet body()}
						Save
					{/snippet}
				</Button>
			</div>
		</form>
	</div>
</Dialog>
