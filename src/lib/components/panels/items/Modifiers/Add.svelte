<script lang="ts">
	import IconAdd from '~icons/mdi/plus-circle-outline'
	import IconBack from '~icons/material-symbols/arrow-back-rounded'
	import { slide, fade, fly } from 'svelte/transition'
	import InputField from '$lib/components/atoms/InputField.svelte'
	import Button from '$lib/components/atoms/Button.svelte'
	import { modifierTypes, modifierTypesDict, type ModifierType } from '$lib/constants/modifierTypes'
	import { modifierModel } from '$lib/schemas'
	import type { z } from 'zod'
	import { createModifier } from '$lib/actions/modifiers'
	import { toast } from 'svelte-sonner'
	import {
		attachModifier,
		getCurrentNodePath,
		getModifiers,
		getNodeModifiers
	} from '$lib/stores/canvas.svelte'

	const {
		nodeId,
		onAdd
	}: { nodeId: string; onAdd?: (modifier: z.infer<typeof modifierModel>) => void } = $props()

	let step = $state(0)
	let filter = $state('')

	const nodePath = $derived(
		[...getCurrentNodePath(), nodeId !== 'container' && nodeId].filter(Boolean) as string[]
	)
	const modifiers = $derived(getModifiers())
	const attachedModifiers = $derived(getNodeModifiers(nodePath))

	const filteredModifiers = $derived(
		Object.values(modifiers).filter(
			m =>
				(!filter.trim() ||
					m.meta.name.toLowerCase().includes(filter.toLowerCase()) ||
					m.spec.identifier?.toLowerCase().includes(filter.toLowerCase())) &&
				// ensure it's not already attached to this node
				(!attachedModifiers.length || attachedModifiers.every(am => am.id !== m.id))
		)
	)

	const selectType = async (type: ModifierType) => {
		const data = modifierTypesDict[type]
		try {
			const newModifier = await modifierModel.parseAsync({
				resource: type,
				meta: {
					name: `New ${data.name}`,
					intention: ''
				},
				spec:
					type === 'oauth/v1'
						? {
								provider: 'google',
								scopes: []
							}
						: {}
			})
			const created = await createModifier(newModifier)
			if (!created.success || !created.data?.id)
				throw 'error' in created ? created.error : 'Failed to create modifier'
			// add the new modifier to the list of existent modifiers so we don't have to refetch them all
			if (modifiers) modifiers[created.data.id] = created.data
			// attach modifier to this node
			await attachModifier(nodePath, created.data)
			step = 0
			onAdd?.(created.data)
		} catch (err) {
			toast.error('Failed to create modifier')
			console.error(err)
		}
	}

	const selectModifier = async (modifier: z.infer<typeof modifierModel>) => {
		await attachModifier(nodePath, modifier)
		step = 0
		onAdd?.(modifier)
	}

	const hasExistingStorage = $derived(attachedModifiers.some(m => m.resource === 'storage/v1'))
</script>

<div
	class="border-main-800 hover:border-main-700 group/add @container relative min-h-24 w-full overflow-hidden rounded-md border border-dashed p-4 transition-all"
>
	{#if step === 0}
		<button
			class="absolute inset-0 flex items-center justify-center gap-2 transition active:scale-[0.98]"
			onclick={() => (step = 1)}
			transition:fade={{ duration: 300 }}
		>
			<IconAdd class="text-main-500 group-hover/add:text-main-200 size-5 transition" />
			<span class="text-main-500 group-hover/add:text-main-200 transition">Add modifier</span>
		</button>
	{:else if step === 1}
		<div
			class="flex flex-col gap-x-4 gap-y-6 @sm:grid @sm:grid-cols-[1fr_auto_1fr]"
			transition:slide={{ axis: 'y', duration: 400 }}
		>
			<div class="@container">
				<p class="text-main-400 pb-2 text-center text-sm">Create new</p>
				<div class="grid grid-cols-1 gap-2 @3xs:grid-cols-2 @md:grid-cols-3">
					{#each modifierTypes as modifier}
						{@const hasStorage = modifier.resource === 'storage/v1' && hasExistingStorage}
						<Button
							variation="item"
							disabled={!modifier.available || hasStorage}
							tooltip={!modifier.available
								? 'Coming soon'
								: hasStorage
									? 'You can only have one storage modifier per action'
									: undefined}
							tooltipPos="down"
							onClick={async () => await selectType(modifier.resource)}
							autoLoad="promise"
						>
							{#snippet body()}
								<div class="flex w-full flex-row flex-wrap items-center gap-2">
									<div class="size-6 shrink-0" style={`color: ${modifier.colour};`}>
										<modifier.icon class="size-6 shrink-0" />
									</div>
									<span class="text-main-300 flex-1 font-semibold whitespace-normal">
										{modifier.name}
									</span>
								</div>
								<span class="text-main-400 mt-1 text-sm">{modifier.description}</span>
							{/snippet}
						</Button>
					{/each}
				</div>
			</div>
			<div class="bg-main-800 h-px w-full @sm:h-full @sm:w-px"></div>
			<div class="flex flex-col gap-4">
				<p class="text-main-400 text-center text-sm">Use existing</p>
				<InputField placeholder="Search modifiers" bind:value={filter} />
				<div class="flex flex-col gap-2">
					{#each filteredModifiers as modifier}
						{@const modifierType = modifierTypesDict[modifier.resource as ModifierType]}
						{@const hasStorage = modifier.resource === 'storage/v1' && hasExistingStorage}
						<Button
							variation="item"
							contentClass="w-full"
							onClick={async () => await selectModifier(modifier)}
							autoLoad="promise"
							disabled={hasStorage}
							tooltip={hasStorage ? 'You can only have one storage modifier per action' : undefined}
							tooltipPos="down"
						>
							{#snippet body()}
								<div class="flex w-full flex-row flex-wrap items-center gap-2">
									<div class="contents" style={`color: ${modifierType?.colour};`}>
										{#if modifierType}
											<modifierType.icon class="-ml-0.5 size-6 shrink-0" />
										{/if}
									</div>
									<span class="text-main-300 truncate font-semibold">
										{modifier.meta.name}
									</span>
								</div>
								<span class="text-main-400 text-sm">
									<span class="text-main-300 capitalize">
										{modifier.spec.provider}
									</span>
									{#if modifier.spec.identifier}
										<span>
											({modifier.spec.identifier})
										</span>
									{/if}
								</span>
							{/snippet}
						</Button>
					{/each}
				</div>
			</div>
		</div>
	{/if}
	{#if step !== 0}
		<div class="absolute top-3 left-3" transition:fly={{ x: -10, duration: 300 }}>
			<Button variation="icon" onClick={() => (step = 0)}>
				{#snippet icon()}
					<IconBack class="text-main-500 size-4" />
				{/snippet}
			</Button>
		</div>
	{/if}
</div>
