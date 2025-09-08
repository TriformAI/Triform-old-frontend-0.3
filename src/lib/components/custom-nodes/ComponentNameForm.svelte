<script lang="ts">
	import InputField from '../atoms/InputField.svelte'
	import IconCheck from '~icons/mdi/check-bold'
	import Button from '$lib/components/atoms/Button.svelte'
	import type { NodeType } from '$lib/constants/nodeTypes'
	import { capitalize } from '$lib/utils/capitalize'

	interface Props {
		onsubmit: (e: Event) => Promise<void>
		value: string
		isLoading: boolean
		componentTypeName?: NodeType | 'Component'
	}

	let {
		onsubmit,
		value = $bindable(),
		isLoading,
		componentTypeName = 'Component'
	}: Props = $props()
</script>

<form class="my-auto px-3 transition-opacity duration-500 starting:opacity-0" {onsubmit}>
	<div class="grid grid-cols-[1fr_auto] gap-2">
		<InputField
			autofocus={true}
			label="Name"
			hideLabel={true}
			placeholder={`${capitalize(componentTypeName)} name`}
			required
			bind:value
			id="component-name-form-input"
		/>

		<Button
			variation="vibrant"
			class="!px-2 !py-1"
			type="submit"
			{isLoading}
			disabled={isLoading || value.trim() === ''}
			id="component-name-form-submit"
		>
			{#snippet body()}
				<IconCheck class="size-4" />
			{/snippet}
		</Button>
	</div>
</form>
