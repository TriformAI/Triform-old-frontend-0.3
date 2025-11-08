<script lang="ts">
	import { getNodeModifiers, getCurrentNodePath } from '$lib/stores/canvas.svelte'
	import { tick } from 'svelte'
	import PanelItem from '../../PanelItem.svelte'
	import Add from './Add.svelte'
	import Modifier from './Modifier.svelte'
	import type { z } from 'zod'
	import { modifierModel } from '$lib/schemas'
	import { slide } from 'svelte/transition'

	const { nodeId }: { nodeId: string } = $props()

	const nodePath = $derived(
		[...getCurrentNodePath(), nodeId !== 'container' && nodeId].filter(Boolean) as string[]
	)

	const modifiers = $derived(getNodeModifiers(nodePath))
	$inspect(modifiers)

	const createStateMap = () => {
		const map = $state<Record<string, boolean>>({})
		return new Proxy(map, {
			get(target, prop: string) {
				if (!(prop in target)) target[prop] = false
				return target[prop]
			},
			set(target, prop: string, value: boolean) {
				target[prop] = value
				return true
			}
		})
	}

	const open = createStateMap()
	const renaming = createStateMap()

	const onAdd = async (modifier: z.infer<typeof modifierModel>) => {
		await tick()
		const { id } = modifier
		if (!id) return
		open[id] = true
		renaming[id] = true
	}
</script>

<PanelItem title="Modifiers" {nodeId}>
	<div class="flex flex-col gap-2">
		{#each modifiers as modifier (modifier.id)}
			<div transition:slide={{ axis: 'y', duration: 400 }}>
				<Modifier
					{nodeId}
					{modifier}
					bind:open={open[modifier.id!]}
					bind:renaming={renaming[modifier.id!]}
				/>
			</div>
		{/each}
		<Add {nodeId} {onAdd} />
	</div>
</PanelItem>
