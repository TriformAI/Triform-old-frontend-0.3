<script lang="ts">
	import InputField from '$lib/components/atoms/InputField.svelte'
	import TextField from '$lib/components/atoms/TextField.svelte'
	import Button from '$lib/components/atoms/Button.svelte'
	import { page } from '$app/state'
	import { toast } from 'svelte-sonner'
	import { enhance } from '$app/forms'

	let isLoading = $state(false)
</script>

<form
	action={`/project/${page.data.project.meta.id}?/update`}
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
	<InputField required label="Name" name="name" value={page.data.project.meta.name} />

	<TextField
		required
		label="Intention"
		name="intention"
		value={page.data.project.meta.intention.purpose}
	/>

	<div class="flex justify-end">
		<Button variation="vibrant" type="submit" class="py-2" {isLoading}>
			{#snippet body()}
				Save
			{/snippet}
		</Button>
	</div>
</form>
