<script lang="ts">
	import { getBezierPath, BaseEdge, EdgeLabel } from '@xyflow/svelte'
	import { type EdgeProps } from '$lib/types/flow'
	import { removeEdge } from '$lib/stores/canvas.svelte'
	import IconCloseRounded from '~icons/material-symbols/close-rounded'
	import { saveProject } from '$lib/actions/project'
	import { updateComponent } from '$lib/actions/components'
	import { confirmStore } from '$lib/stores/confirm.svelte'
	import { page } from '$app/state'
	import { getNodes, getEdges } from '$lib/stores/canvas.svelte'

	const {
		id,
		sourceX,
		sourceY,
		sourcePosition,
		targetX,
		targetY,
		targetPosition,
		data
	}: EdgeProps = $props()

	const [path, midX, midY, diffX] = $derived(
		getBezierPath({
			sourceX,
			sourceY,
			sourcePosition,
			targetX,
			targetY,
			targetPosition
		})
	)

	// Small hack to move the delete button a bit upwards when the edge is straight
	// as otherwise it might get obscured by the node label
	const pathIsStraight = $derived(Math.abs(diffX) < 3)

	// Hack #2 to get the button to show up only when the edge is hovered
	const style = /<|>/.test(id) // rudimentary anti-xss check
		? ''
		: /*css*/ `
      <style>
        .svelte-flow:has(.svelte-flow__edge[data-id="${id}"]:hover) .edge-delete-btn[data-id="${id}"],
        .edge-delete-btn[data-id="${id}"]:hover
        {
          display: block;
        }
      </style>
    `

	const deleteEdge = async () => {
		const confirmed = await confirmStore.show({
			title: 'Are you sure?',
			message: 'Please confirm that you want to delete this edge'
		})
		if (!confirmed) return

		// Mark the edge as deleted and then delete it after a little delay
		const edge = getEdges().find(e => e.id === id)
		if (edge) edge.data.props.deleted = true

		setTimeout(async () => {
			let removeEdgeReturn: ReturnType<typeof removeEdge> | undefined
			try {
				removeEdgeReturn = removeEdge(id)
				const { toSave } = removeEdgeReturn
				if (toSave === 'project') {
					const proj = page.data.project
					if (!proj) throw new Error('Project not loaded')
					await saveProject(proj)
				} else {
					const node = getNodes().find(n => n.id === toSave)
					if (!node) throw new Error('Node not found')
					await updateComponent(node.data.trinode.spec)
				}
			} catch (e) {
				console.error(e)
			}
		}, 150)
	}
</script>

<BaseEdge
	{path}
	interactionWidth={40}
	class={[data.props.deleted ? 'opacity-0' : '', 'transition-opacity'].filter(Boolean).join(' ')}
/>

<EdgeLabel>
	<div
		style:transform="translate(-50%, -{pathIsStraight ? 60 : 50}%) translate({midX}px, {midY}px)"
		class="absolute"
	>
		<button
			class={[
				'bg-main-950/20 text-main-500 rounded p-1 backdrop-blur-sm',
				'hover:text-danger-400 hover:bg-danger-950/20',
				'active:scale-90',
				'pointer-events-auto hidden',
				'edge-delete-btn'
			]}
			data-id={id}
			onclick={deleteEdge}
		>
			<IconCloseRounded />
		</button>
	</div>
</EdgeLabel>

<svelte:head>
	{@html style}
</svelte:head>

<style>
	@starting-style {
		.edge-delete-btn {
			opacity: 0;
		}
	}

	.edge-delete-btn {
		transition:
			opacity 0.2s ease-in-out 0.25s,
			color 0.15s ease-in-out 0s,
			background-color 0.15s ease-in-out 0s,
			scale 0.2s ease-in-out 0s;
	}
</style>
