<script lang="ts">
  import type { Snippet } from 'svelte'

  import CustomHandle from './CustomHandle.svelte'
  import { Position } from '@xyflow/svelte'
  
  const {
    id,
    body
  }: {
    id: string
    body: Snippet
  } = $props()
</script>

<div class="flex flex-col w-full h-full justify-between">
  <div>
    <CustomHandle
      {id}
      type="target"
      position={Position.Top}
    />
    <CustomHandle
      {id}
      type="source"
      position={Position.Top}
    />
  </div>
  <div class="flex flex-row w-full h-full items-center justify-between">
    <div>
      <CustomHandle
        {id}
        type="target"
        position={Position.Left}
      />
      <CustomHandle
        {id}
        type="source"
        position={Position.Left}
      />
    </div>
    <div class="w-full h-full">
      {@render body()}
    </div>
    <div>
      <CustomHandle
        {id}
        type="target"
        position={Position.Right}
      />
      <CustomHandle
        {id}
        type="source"
        position={Position.Right}
      />
    </div>
  </div>
  <div>
    <CustomHandle
      {id}
      type="target"
      position={Position.Bottom}
    />
    <CustomHandle
      {id}
      type="source"
      position={Position.Bottom}
    />
  </div>
</div>