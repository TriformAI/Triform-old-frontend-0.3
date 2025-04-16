<script lang="ts">
	import { page } from '$app/state'
	import IconEye from '~icons/mdi/eye-outline'
	import IconEyeOff from '~icons/mdi/eye-off-outline'
	import { enhance } from '$app/forms'
	import { toast } from 'svelte-sonner'
	import { invalidate } from '$app/navigation'
	import { confirmStore } from '$lib/stores/confirm.svelte'
	import { type SubmitFunction } from '@sveltejs/kit'
	import IconTrash from '~icons/material-symbols/delete-outline'

	let { modifier } = $props()

	const value = 'This is a value'
	const maskedValue = $derived(value.replace(/\w/g, '•').replace(/ /g, ''))
	let showValue = $state(false)

	const handleDelete: SubmitFunction = async ({ formElement, cancel }) => {
		const isConfirmed = await confirmStore.show({
			title: 'Are you sure?',
			message: `Please confirm that you want to delete this variable`
		})

		if (!isConfirmed) {
			cancel()
		}

		return async ({ update, result }) => {
			console.log(result)

			if (result.type === 'success') {
				invalidate('project')
				toast.success('Variable deleted!')
			} else if (result.type === 'failure') {
				toast.error('Could not delete variable')
			}

			await update()
		}
	}
</script>

<li
	class="border-main-800 group animate-fade-in grid grid-cols-12 items-center gap-3 border-b py-2"
>
	<span class="col-span-5 truncate font-medium uppercase" title={modifier.name.toUpperCase()}>
		{modifier.name}
	</span>

	<span class="text-main-400 col-span-5 flex items-center gap-2">
		<button type="button" onclick={() => (showValue = !showValue)}>
			{#if showValue}
				<IconEyeOff class="size-[20px]" />
			{:else}
				<IconEye class="size-[20px]" />
			{/if}
		</button>
		<span>
			{showValue ? value : maskedValue}
		</span>
	</span>

	<form
		class="invisible col-span-2 ms-auto group-hover:visible"
		action={`${page.url.pathname}?/deleteModifier`}
		method="post"
		use:enhance={handleDelete}
	>
		<input type="hidden" name="id" value={modifier.id} />
		<button type="submit" title="Delete variable">
			<IconTrash class="text-main-400 size-[20px]" />
		</button>
	</form>
</li>
