<script lang="ts">
  import type { NodeData } from "$lib/types/flow"
  import type { Snippet } from 'svelte'
  import { Position } from '@xyflow/svelte'

  import CustomHandle from './CustomHandle.svelte'

	const {
		id,
		data,
		selected,
    icon,
    handles = []
	}: {
		id: string,
		data: NodeData,
		selected: boolean,
    icon: Snippet,
    handles: Position[]
	} = $props()

	const { name, state, version } = data

  const getBorderClass = (state: string) => {
    switch (state) {
      case 'success':
        return 'border-emerald-500'
      case 'error':
        return 'border-red-500'
      case 'running':
        return 'border-indigo-500'
      default:
        return selected
          ? 'border-slate-200'
          : 'border-slate-300'
    }
  }
</script>

<div>
  {#if handles.includes(Position.Top)}
    <CustomHandle
      {id}
      type="target"
      position={Position.Top}
    />
  {/if}
	<div>
    <span
      class="
        absolute flex-shrink-0 w-max text-[8px] font-bold right-14 top-5 float-right transition
        {selected ? 'text-slate-200' : 'text-slate-300'}
      "
    >
      {name}
      <span class="block transition {selected ? 'text-slate-300' : 'text-slate-400'}">
        v{version}
      </span>
    </span>
      <div
        class="
          rounded-full w-11 h-11 p-2 border flex justify-center items-center relative transition-all
          {selected ? 'border-2' : ''}
          {getBorderClass(state)}
        "
      >
        {@render icon()}
        <div
          class="custom-node-icon-shadow absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transform"
        >
          {@render icon()}
        </div>
      </div>
  </div>
  {#if handles.includes(Position.Bottom)}
    <CustomHandle
      {id}
      type="source"
      position={Position.Bottom}
    />
  {/if}
</div>

<style>
  /* Bit of a hack to lower the opacity of the shadow (currentColor) */
  :global(.custom-node-icon-shadow > *) {
    opacity: 0.35;
    filter: drop-shadow(0px 0px 10px currentColor);
  }
</style>