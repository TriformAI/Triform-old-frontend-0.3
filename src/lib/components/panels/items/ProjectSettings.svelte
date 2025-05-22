<script lang="ts">
	import InputField from '$lib/components/atoms/InputField.svelte'
	import TextField from '$lib/components/atoms/TextField.svelte'
	import Button from '$lib/components/atoms/Button.svelte'
	import { toast } from 'svelte-sonner'
	import { enhance } from '$app/forms'
	import { clone } from '$lib/utils/clone'
	import { onDestroy } from 'svelte'
	import PanelItem from '../PanelItem.svelte'
	import { type Component } from '$lib/types/agent'

	const { componentData }: { componentData: Component } = $props()

	interface FormData {
		name: string
		intention: {
			purpose: string
		}
	}

	let initialData = $state<FormData>()!
	let formData = $state<FormData>()!

	function setFormdata() {
		const meta = componentData.meta

		initialData = {
			name: meta.name,
			intention: (meta.intention as FormData['intention']) ?? {
				purpose: ''
			}
		}

		formData = clone(initialData)
	}

	setFormdata()

	function updateData() {
		if (!componentData) {
			return
		}

		const meta = componentData.meta
		componentData.meta = {
			...meta,
			...formData,
			intention: {
				...meta.intention,
				...formData.intention
			}
		}
	}

	onDestroy(() => {
		//updateData()
	})

	let isLoading = $state(false)
</script>

<PanelItem {componentData} title="Project Settings" forceOpen={true}>
	<form
		action={`/project/${componentData.meta.id}?/update`}
		method="POST"
		class="grid gap-3"
		use:enhance={() => {
			isLoading = true
			return async ({ update, result }) => {
				if (result.type === 'success') {
					toast.success('Project updated!')
				}

				if (result.type === 'error') {
					toast.error('Could not update project')
				}

				await update({ reset: false })
				isLoading = false
			}
		}}
	>
		<InputField required label="Name" name="name" value={formData.name} />

		<TextField required label="Intention" name="intention" value={formData.intention.purpose} />

		<div class="flex justify-end">
			<Button variation="vibrant" type="submit" class="py-2" {isLoading}>
				{#snippet body()}
					Save
				{/snippet}
			</Button>
		</div>
	</form>
</PanelItem>
