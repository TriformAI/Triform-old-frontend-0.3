<script lang="ts">
  import {
    getBezierPath,
    useInternalNode,
    type EdgeProps
  } from '@xyflow/svelte'
  import { getEdgeParams } from '$lib/utils/flow'

  const {
    source,
    target,
    id
  }: EdgeProps = $props()

  const sourceNode = useInternalNode(source)
  const targetNode = useInternalNode(target)

  const edgePath = $derived.by(() => {
    if ($sourceNode && $targetNode) {
      const edgeParams = getEdgeParams($sourceNode, $targetNode)
      return getBezierPath({
        sourceX: edgeParams.sx,
        sourceY: edgeParams.sy,
        targetX: edgeParams.tx,
        targetY: edgeParams.ty,
        sourcePosition: edgeParams.sourcePos,
        targetPosition: edgeParams.targetPos
      })[0]
    } else return undefined
  })
</script>

<path
  class="svelte-flow__edge-path"
  {id}
  d={edgePath}
/>