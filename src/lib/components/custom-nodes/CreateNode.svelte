<script lang="ts">
	import InputField from '../atoms/InputField.svelte'
	import AddIcon from '~icons/material-symbols/add-rounded'
	import RightIcon from '~icons/material-symbols/arrow-right-alt-rounded'
	import { createComponent } from '$lib/actions/components'
	import { addNode } from '$lib/stores/canvas.svelte'
	import { getFlowModel } from '$lib/nodeModels'
	import { toast } from 'svelte-sonner'
	import { clickOutside } from '$lib/utils/clickOutside'

	const props = $props()

	let name = $state('')
	let inputRef: HTMLInputElement
	let isEditing = $state(false)
	let isCreating = $state(false)

	function handleInputRef(el: HTMLInputElement) {
		inputRef = el
	}

	function startEditing() {
		isEditing = true
		setTimeout(() => {
			inputRef?.focus()
			inputRef?.select()
		}, 0)
	}

	function stopEditing() {
		isEditing = false
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter') {
			createFlow()
		} else if (e.key === 'Escape') {
			stopEditing()
		}
	}

	const createFlow = async () => {
		isCreating = true
		isEditing = false
		const flow = getFlowModel()
		flow.meta.name = name
		try {
			const newFlow = await createComponent(flow)
			console.log('newFlow', newFlow)

			await addNode(
				newFlow,
				{
					x: props.positionAbsoluteX,
					y: props.positionAbsoluteY
				},
				[]
			)
			stopEditing()
		} catch (e) {
			console.log(e)

			toast.error('Failed to create flow')
		} finally {
			isCreating = false
		}
	}
</script>

<div
	class="relative grid items-end justify-center pb-1 transition-all"
	use:clickOutside={{
		handler: stopEditing
	}}
>
	<div
		role={isEditing ? 'div' : 'button'}
		class={[
			'place-items-center justify-self-center rounded-md border border-dashed transition-all duration-200',
			isEditing
				? 'bg-main-900 border-main-300 mt-5 ml-10 h-12 w-40 -translate-x-1/2'
				: 'border-main-500 hover:border-main-300 size-20 cursor-pointer active:scale-95',
			isCreating && 'animate-pulse',
			'group flex items-center justify-center'
		]}
		onclick={!isEditing ? startEditing : undefined}
		tabindex="-1"
	>
		{#if isEditing}
			<InputField
				bind:value={name}
				use={handleInputRef}
				placeholder="Name of flow"
				onkeydown={handleKeydown}
				variation="tight"
				class="ml-2 border-none bg-transparent text-white"
			/>
			<button onclick={createFlow} class="text-main-500 hover:text-main-300 mr-2">
				<RightIcon />
			</button>
		{:else}
			<AddIcon class="text-main-500 group-hover:text-main-300 size-6 transition" />
		{/if}
	</div>
</div>
