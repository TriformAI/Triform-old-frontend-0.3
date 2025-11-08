<script lang="ts">
	import type { z } from 'zod'
	import { modifierModel } from '$lib/schemas'
	import TagSelector from '$lib/components/atoms/TagSelector.svelte'
	import Button from '$lib/components/atoms/Button.svelte'
	import Select from '$lib/components/atoms/Select.svelte'
	import { oauthProviders } from '$lib/constants/oauthProviders'
	import { tick } from 'svelte'
	import { updateModifier } from '$lib/actions/modifiers'

	const { modifier }: { nodeId: string; modifier: z.infer<typeof modifierModel> } = $props()

	const modifierData = $derived(
		oauthProviders.find(provider => provider.id === modifier.spec.provider)
	)

	let isUpdating = $state(false)
	const onChange = async () => {
		isUpdating = true
		await tick()
		await updateModifier(modifier)
		isUpdating = false
	}

	const authorise = async () => {
		window.open(`/api/external/authorize/${modifier.id}`, '_blank')
	}

	const invalidScopes = $derived(modifierData?.scopes ? !modifier.spec.scopes.length : false)
</script>

<div class="flex flex-col gap-8 pt-4">
	<div class="flex flex-col gap-4">
		<Select
			bind:value={modifier.spec.provider}
			items={oauthProviders.map(provider => ({
				value: provider.id,
				label: provider.label,
				icon: provider.icon
			}))}
			label="Provider"
			{onChange}
		/>
		{#if modifierData?.scopes}
			<TagSelector
				bind:tags={modifier.spec.scopes}
				placeholder="List of requested scopes"
				label="Scopes"
				{onChange}
				allowNewTags={false}
				presetTags={modifierData?.scopes
					? Array.isArray(modifierData.scopes)
						? modifierData.scopes
						: []
					: []}
			/>
		{:else}
			<p class="text-main-400 text-sm">The scopes for this provider cannot be customised.</p>
		{/if}
	</div>

	<div class="flex flex-col gap-3">
		<Button
			variation="vibrant"
			onClick={authorise}
			autoLoad="promise"
			disabled={isUpdating || invalidScopes}
			tooltip={isUpdating
				? 'Please wait for your changes to be saved first'
				: invalidScopes
					? 'Please add at least one scope'
					: undefined}
			tooltipPos="down"
		>
			Authorise
			<span class="capitalize">
				{modifier.spec.provider}
			</span>
		</Button>
	</div>
</div>
