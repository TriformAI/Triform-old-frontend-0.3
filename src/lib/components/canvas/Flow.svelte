<script lang="ts">
  import { processResource, type Canvas } from '$lib/stores/canvas.svelte'
  import type { Node, Edge, NodeTypes } from '@xyflow/svelte'
  import type { ActionSpecV1 } from '$lib/types/agent'

	import ActionNode from '$lib/components/custom-nodes/ActionNode.svelte'
	import AgentNode from '$lib/components/custom-nodes/AgentNode.svelte'
	import ApiNode from '$lib/components/custom-nodes/ApiNode.svelte'
  import CodeEditorWindow from '$lib/components/windows/CodeEditorWindow.svelte'
  import ContextMenu from '../custom-nodes/ContextMenu.svelte'

	import { writable, get } from 'svelte/store'
	import { untrack } from 'svelte'
	import { SvelteFlow, Background, BackgroundVariant } from '@xyflow/svelte'
  import dagre from '@dagrejs/dagre'

	import { openWindow } from '$lib/stores/windows.svelte'
  import { menuIsOpen, toggleMenu } from '$lib/stores/contextMenu.svelte'

  import '@xyflow/svelte/dist/style.css'

  const {
    canvas
  }: {
    canvas: Canvas
  } = $props()

	const nodeTypes: NodeTypes = {
    // @ts-expect-error type issue, not crucial but should probs be fixed
		'action-node': ActionNode,
    // @ts-expect-error type issue, not crucial but should probs be fixed
		'agent-node': AgentNode,
    // @ts-expect-error type issue, not crucial but should probs be fixed
		'api-node': ApiNode
	}

  const nodes = writable<Node[]>([])
  const edges = writable<Edge[]>([])

  // Compute nodes & edges using the canvas data
  $effect(() => {
    // Clear the nodes and edges
    nodes.set([])
    edges.set([])

    if (!canvas) return

    // Used to get effect to trigger on canvas.resource change
    const ref = canvas.resource

    untrack(async () => {
      const dagreGraph = new dagre.graphlib.Graph()
      dagreGraph.setDefaultEdgeLabel(() => ({}))
      dagreGraph.setGraph({ rankdir: 'TB' })
      const layoutNodes: Node[] = []
      const layoutEdges: Edge[] = []

      const nodeSize = 60

      await new Promise<void>(resolve => processResource(
        canvas.resource,
        // Resource is an action, as this is only applied to actions
        resource => {
          const spec: ActionSpecV1 = resource.spec as ActionSpecV1

          const node = {
            id: resource.key,
            type: 'action-node',
            position: { x: 0, y: 0 },
            data: {
              name: spec.name,
              version: spec.version,
              id: resource.id,
              // Don't define onOpen, since if it's undefined it'll
              // be the first context menu action, which is good for ux
              // onOpen: openEditor
            }
          }

          const vertices = (resource.inputs || []).map(input => ({
            id: `${input}-${resource.key}`,
            source: input,
            target: resource.key,
            type: 'default'
          }))
          layoutNodes.push(node)
          layoutEdges.push(...vertices)
          dagreGraph.setNode(resource.key, {width: nodeSize + (spec.name.length * 3), height: nodeSize})
          vertices.forEach(v => dagreGraph.setEdge(v.source, v.target))
        },
        () => resolve()
      ))

      // Create all the handles on all the nodes
      // for (const edge of get(edges)) {
      //   const ns = get(nodes)
      //   const sourceNode = ns.filter(n => n.id === edge.source)[0]
      //   const targetNode = ns.filter(n => n.id === edge.target)[0]
      //   if (!sourceNode.handles?.includes(Position.Top)) sourceNode.handles?.push(Position.Top)
      // }

      dagre.layout(dagreGraph)
      layoutNodes.map(n => {
        const d = dagreGraph.node(n.id)
        n.position = {
          x: d.x - nodeSize / 2,
          y: d.y - nodeSize / 2
        }
      })
      
      nodes.set(layoutNodes)
      edges.set(layoutEdges)
    })
  })

  let contextMenuProps: {
    node?: Node
    top: number
    left: number
    right: number
    bottom: number
  } = $state({
    node: undefined,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0
  })

  let wrapper: HTMLElement

  const openContextMenu = (args: CustomEvent) => {
    const { detail: {
      event,
      node
    }}: {
      detail: {
        event: MouseEvent,
        node: Node
      }
    } = args

    event.preventDefault()

    contextMenuProps = {
      node,
      // TODO: use the width/height of wrapper to make sure it doesn't get placed off screen
      top: event.clientY - wrapper.offsetTop,
      left: event.clientX - wrapper.offsetLeft,
      right: event.clientX,
      bottom: event.clientY
    }
    toggleMenu(true)
  }
</script>

<div
  class="h-full w-full relative"
  bind:this={wrapper}
>
	<SvelteFlow
		{nodes}
		{edges}
		{nodeTypes}
		fitView
		snapGrid={[1, 1]}
		proOptions={{ hideAttribution: true }}
		defaultEdgeOptions={{}}
    on:nodecontextmenu={openContextMenu}
	>
    {#if menuIsOpen()}
      <ContextMenu {...contextMenuProps} />
    {/if}
		<Background
			bgColor="#181819"
			patternColor="#1D1E20"
			gap={20}
			size={1}
			variant={BackgroundVariant.Lines}
		/>
	</SvelteFlow>
</div>