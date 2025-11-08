<script lang="ts">
	import type { z } from 'zod'
	import { modifierModel } from '$lib/schemas'
	import type { Snippet } from 'svelte'
	import Disclosure from '$lib/components/atoms/Disclosure.svelte'
	import { modifierTypesDict, type ModifierType } from '$lib/constants/modifierTypes'
	import OAuth from './OAuth.svelte'
	import type { Component } from 'svelte'
	import Button from '$lib/components/atoms/Button.svelte'
	import { confirmStore } from '$lib/stores/confirm.svelte'
	import { detachModifier, getCurrentNodePath } from '$lib/stores/canvas.svelte'
	import EditIcon from '~icons/material-symbols/edit-square-rounded'
	import IconCheck from '~icons/material-symbols/check-rounded'
	import { updateModifier } from '$lib/actions/modifiers'
	import { toast } from 'svelte-sonner'
	import IconWarning from '~icons/material-symbols/warning-rounded'

	let {
		nodeId,
		modifier,
		open = $bindable(false),
		renaming = $bindable(false)
	}: {
		nodeId: string
		modifier: z.infer<typeof modifierModel>
		open: boolean
		renaming: boolean
	} = $props()

	const modifierMap = {
		'oauth/v1': OAuth
	} as Record<ModifierType, Component>

	const modifierData = $derived(modifierTypesDict[modifier.resource as ModifierType])
	const Comp = $derived(modifierMap[modifier.resource as ModifierType])

	const nodePath = $derived(
		[...getCurrentNodePath(), nodeId !== 'container' && nodeId].filter(Boolean) as string[]
	)

	const detach = async () => {
		const confirmed = await confirmStore.show({
			title: 'Are you sure?',
			message:
				'This will remove the modifier from this node immediately. It will still be available within your organisation and may be attached to other nodes.',
			btnLabel: 'Detach',
			danger: true
		})
		if (!confirmed) return
		await detachModifier(nodePath, modifier.id!)
	}

	let newName = $state(modifier.meta.name)

	const onEditStart = (el: HTMLInputElement) => {
		el.focus()
		el.select()
	}

	const saveName = async () => {
		const name = newName.trim()

		if (!name) return toast.error('Name cannot be empty')

		modifier.meta.name = name

		await updateModifier(modifier)

		renaming = false
	}
</script>

<div class="bg-main-900 rounded-md p-4">
	<Disclosure bind:open showChevron={true} triggerClass={['w-full']}>
		{#snippet trigger()}
			<div class="flex flex-row items-center gap-2">
				{#if modifierData}
					<div style={`color: ${modifierData.colour}`}>
						<modifierData.icon class="size-5" />
					</div>
				{/if}
				{#if !renaming}
					<span
						role="button"
						tabindex="0"
						class={[
							'group text-main-400 flex items-center gap-2 transition',
							'group-hover/trigger:text-main-300 group-aria-expanded/trigger:text-main-300'
						]}
						ondblclick={() => (renaming = true)}
					>
						{modifier.meta.name}
						<button
							class={[
								'icon-btn hover:text-main-50 -ml-7 opacity-0 transition-all',
								'group-hover/trigger:ml-0 group-aria-expanded/trigger:ml-0',
								'group-hover/trigger:opacity-100 group-aria-expanded/trigger:opacity-100'
							]}
							onclick={e => {
								e.stopPropagation()
								renaming = true
							}}
						>
							<EditIcon class="size-4" />
						</button>
					</span>
				{:else}
					<form
						onsubmit={e => {
							e.preventDefault()
							e.stopPropagation()
							saveName()
						}}
						class="flex flex-row items-center gap-2"
					>
						<input
							type="text"
							bind:value={newName}
							class="input-text-light text-main-300 px-2 py-0.5 text-sm"
							onblur={saveName}
							use:onEditStart
							onclick={e => e.stopPropagation()}
							onkeydown={e => {
								if (e.key === 'Enter') {
									e.preventDefault()
									e.stopPropagation()
									saveName()
								}
							}}
						/>
						<button
							class="icon-btn hover:text-main-50"
							type="submit"
							onclick={e => e.stopPropagation()}
						>
							<IconCheck class="size-4" />
						</button>
					</form>
				{/if}
				{#if modifier.spec.identifier}
					<span
						class="text-main-500 group-hover/trigger:text-main-400 group-aria-expanded/trigger:text-main-400 mt-0.5 text-sm transition"
					>
						(<span class="capitalize">{modifier.spec.provider}</span>: {modifier.spec.identifier})
					</span>
				{/if}
			</div>
		{/snippet}
		{#if Comp}
			<div class="flex flex-col gap-4">
				<Comp {nodeId} {modifier} />
				<div class="flex flex-row justify-between gap-8">
					<span class="text-warning-300/70 text-sm">
						{#if modifier.resource === 'oauth/v1' && modifier.spec.identifier}
							<IconWarning class="inline size-4 align-top" /> Authorising again will overwrite the currently
							saved credentials
							<span class="text-warning-400/90 font-medium">
								({modifier.spec.identifier})
							</span>
						{/if}
					</span>
					<Button
						variation="danger"
						onClick={detach}
						autoLoad="promise"
						tooltip="Remove the modifier from this node immediately"
						tooltipPos="left"
					>
						Detach
					</Button>
				</div>
			</div>
		{:else}
			<div>Unknown modifier</div>
		{/if}
	</Disclosure>
</div>
