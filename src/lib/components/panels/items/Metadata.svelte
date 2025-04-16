<script lang="ts">
	import InputField from '$lib/components/atoms/InputField.svelte'
	import TextField from '$lib/components/atoms/TextField.svelte'
	import Button from '$lib/components/atoms/Button.svelte'
	import type { Action } from '$lib/types/agent'
	import { toast } from 'svelte-sonner'
	import { selected, nodes, setIsDirty } from '$lib/stores/canvas.svelte'
	import { onDestroy } from 'svelte'
	import compare from 'just-compare'
	import { clone } from '$lib/utils/clone'
	import { page } from '$app/state'
	import { API } from '$lib/api'

	const api = new API()

	const nodeId = selected.node?.id

	interface FormData {
		name: string
		intention: {
			purpose: string
			input: string
			output: string
		}
	}

	let initialData = $state<FormData>()!
	let formData = $state<FormData>()!

	const dataIsDirty = $derived(selected.isDirty || !compare(formData, initialData))

	function setFormdata() {
		if (!nodeId) return

		const meta = nodes[nodeId].data.trinode.spec.meta

		initialData = {
			name: meta.name,
			intention: (meta.intention as FormData['intention']) ?? {
				purpose: '',
				input: '',
				output: ''
			}
		}

		formData = clone(initialData)
	}

	setFormdata()

	function updateNode() {
		if (!nodeId) return
		setIsDirty(nodeId, dataIsDirty)
		const meta = nodes[nodeId].data.trinode.spec.meta
		nodes[nodeId].data.trinode.spec.meta = { ...meta, ...formData }
	}

	onDestroy(() => {
		updateNode()
	})

	let isLoading = $state(false)

	async function onSubmit(e: SubmitEvent) {
		e.preventDefault()

		if (!nodeId) {
			return
		}

		isLoading = true

		const payload = clone(nodes[nodeId].data.trinode.spec)
		payload.meta = { ...payload.meta, ...formData }

		try {
			const result = await api.put<Action>(`components/${payload.meta.id}`, payload)
			toast.success('Metadata successfully updated!')
			updateNode()
			console.log(result)
		} catch (error) {
			toast.error('Failed to update metadata')
			console.error(error)
		}

		isLoading = false
	}
</script>

<form method="POST" class="grid grid-cols-2 gap-3" onsubmit={onSubmit}>
	<InputField
		containerClass="col-span-2"
		required
		label="Name"
		name="name"
		bind:value={formData.name}
	/>

	<TextField
		rows={2}
		class="col-span-2"
		label="Intention"
		name="intention"
		bind:value={formData.intention.purpose}
	/>

	<TextField
		rows={2}
		label="Expected input"
		name="intention"
		bind:value={formData.intention.input}
	/>

	<TextField
		rows={2}
		label="Expected output"
		name="intention"
		bind:value={formData.intention.output}
	/>

	<div class="col-span-2 flex justify-between">
		{#if dataIsDirty}
			<p class="text-main-400 text-sm">You have unsaved changes</p>
		{/if}

		<Button variation="vibrant" type="submit" class="ms-auto py-2" {isLoading}>
			{#snippet body()}
				Save
			{/snippet}
		</Button>
	</div>
</form>
