<script lang="ts">
	import Button from '../atoms/Button.svelte'
	import InputField from '$lib/components/atoms/InputField.svelte'
	import IconVariable from '~icons/mdi/key'
	import Dialog from '$lib/components/common/Dialog.svelte'
	import { toast } from 'svelte-sonner'
	import { page } from '$app/state'
	import { API } from '$lib/api'
	import type { Variable, Project } from '$lib/types/project'
	import { invalidate } from '$app/navigation'
	import { getNodePath } from '$lib/stores/canvas.svelte'

	interface Props {
		dialog: HTMLDialogElement | undefined
	}

	let { dialog = $bindable() }: Props = $props()

	const payload = $state({
		name: '',
		key: '',
		value: {
			dev: '',
			stage: '',
			prod: ''
		},
		projectId: page.data.project?.meta.id,
		nodePath: getNodePath()
	})

	let isCreating = $state(false)

	const handleSubmit = async (e: SubmitEvent) => {
		e.preventDefault()

		const api = new API()

		isCreating = true

		// Create variable
		try {
			// copy dev to stage and prod for now (until we have support for all 3)
			payload.value.stage = payload.value.dev
			payload.value.prod = payload.value.dev
			const result = await api.post<Variable>('variables', payload)

			// Attach variable to node
			await api.post<Project>(`projects/${payload.projectId}/variable`, {
				nodePath: payload.nodePath,
				modifierId: result.meta.id
			})

			invalidate('project')
			dialog?.close()
			toast.success('Variable created!')
		} catch (error) {
			toast.error('Could not create variable')
		} finally {
			isCreating = false
		}
	}

	function toSnakeUpperCase(str: string) {
		return str.replace(/ /g, '_').toUpperCase()
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

		<form method="POST" class="grid" onsubmit={handleSubmit}>
			<div class="mb-auto grid gap-4">
				<InputField name="name" label="Name" containerClass="" bind:value={payload.name} />

				<div class="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
					<InputField
						name="key"
						label="Key"
						bind:value={() => payload.key, value => (payload.key = toSnakeUpperCase(value))}
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
								const nextInput =
									document.querySelector<HTMLInputElement>('input[name="value_dev"]')
								if (nextInput) {
									nextInput.value = parts[1].trim()
									nextInput.focus()
								}
							}
						}}
						class="font-mono"
					/>
					<span class="text-main-400 mt-4">=</span>
					<InputField
						class="col-span-5 font-mono"
						name={`value_dev`}
						label="Value"
						bind:value={payload.value.dev}
					/>
				</div>

				<!-- <p class="mt-2 font-medium opacity-60">Values</p>
				<div class="grid gap-2">
					{#each ['Dev', 'Stage', 'Prod'] as item}
						<InputField
							containerClass="grid items-center grid-cols-6"
							class="col-span-5 font-mono"
							name={`value_${item.toLowerCase()}`}
							label={item}
							bind:value={payload.value[item.toLowerCase() as keyof typeof payload.value]}
						/>
					{/each}
				</div> -->
			</div>

			<div class="mt-auto grid grid-cols-2 gap-4">
				<Button type="button" onClick={() => dialog?.close()}>
					{#snippet body()}
						Cancel
					{/snippet}
				</Button>

				<Button variation="vibrant" type="submit" isLoading={isCreating}>
					{#snippet body()}
						Create
					{/snippet}
				</Button>
			</div>
		</form>
	</div>
</Dialog>
