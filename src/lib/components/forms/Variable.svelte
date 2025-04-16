<script lang="ts">
	import Button from '../atoms/Button.svelte'
	import InputField from '$lib/components/atoms/InputField.svelte'
	import TextField from '$lib/components/atoms/TextField.svelte'
	import IconVariable from '~icons/mdi/key'
	import Dialog from '$lib/components/common/Dialog.svelte'
	import { enhance } from '$app/forms'
	import { toast } from 'svelte-sonner'
	import { type SubmitFunction } from '@sveltejs/kit'

	interface Props {
		dialog: HTMLDialogElement | undefined
	}

	let { dialog = $bindable() }: Props = $props()

	const handleSubmit: SubmitFunction = () => {
		return async ({ update, result }) => {
			console.log(result)

			if (result.type === 'success') {
				dialog?.close()
				toast.success('Variable created!')

				setTimeout(async () => {
					await update()
				}, 300)
			}

			if (result.type === 'error') {
				toast.error('Could not create variable')
			}
		}
	}

	function toSnakeUpperCase(str: string) {
		return str.trim().replace(/ /g, '_').toUpperCase()
	}
</script>

<Dialog
	appearance="right"
	bind:dialog
	onOpen={() => {
		setTimeout(() => {
			dialog?.querySelector<HTMLInputElement>('input[name="name"]')?.focus()
		})
	}}
>
	<div class="grid grid-rows-[auto_1fr]">
		<div class="mb-8 grid auto-rows-min grid-cols-[auto_1fr] items-start gap-x-3">
			<IconVariable class="row-span-2 size-8" />
			<h2 class="font-semibold">Create variable</h2>
			<p class="text-main-400">Injected as an environment variable</p>
		</div>

		<form action="/api/variables" method="POST" class="grid" use:enhance={handleSubmit}>
			<div class="mb-auto grid grid-cols-2 gap-2">
				<InputField name="name" label="Name" containerClass="col-span-2" />

				<TextField name="intention" label="Intention" class="col-span-2" />

				<InputField
					name="key[]"
					label="Key"
					oninput={e => {
						const target = e.target as HTMLInputElement
						target.value = toSnakeUpperCase(target.value)
					}}
					onpaste={e => {
						const target = e.target as HTMLInputElement
						const pastedText = e.clipboardData?.getData('text')
						e.preventDefault()

						if (!pastedText) {
							return
						}

						const parts = pastedText.split('=')

						target.value = toSnakeUpperCase(parts[0])

						if (parts[1]) {
							const nextInput = document.querySelector<HTMLInputElement>('input[name="value[]"]')
							if (nextInput) {
								nextInput.value = parts[1].trim()
								nextInput.focus()
							}
						}
					}}
				/>
				<InputField name="value[]" label="Value" />
			</div>

			<div class="mt-auto grid grid-cols-2 gap-4">
				<Button type="button" onClick={() => dialog?.close()}>
					{#snippet body()}
						Cancel
					{/snippet}
				</Button>

				<Button variation="vibrant" type="submit">
					{#snippet body()}
						Create
					{/snippet}
				</Button>
			</div>
		</form>
	</div>
</Dialog>
