<script lang="ts">
  import type { Snippet } from 'svelte'

  import IconClose from '~icons/mdi/close'
  import IconDrag from '~icons/mdi/drag'

  const {
    header,
    body,
    footer,
    onClose,
    onDragStart: onDragStartProp,
    onDragEnd: onDragEndProp
  }: {
    header?: Snippet,
    body: Snippet,
    footer?: Snippet,
    onClose?: () => void,
    onDragStart?: (e: MouseEvent) => void,
    onDragEnd?: (e: MouseEvent) => void
  } = $props()

  const isDraggable = typeof onDragStartProp === 'function' || typeof onDragEndProp === 'function'

  const onDragStart = (e: MouseEvent) => {
    onDragStartProp?.(e)
    window.addEventListener('mouseup', onDragEnd)
  }
  const onDragEnd = (e: MouseEvent) => {
    onDragEndProp?.(e)
    window.removeEventListener('mouseup', onDragEnd)
  }
</script>

<div class="border rounded-md shadow-lg bg-zinc-900 text-zinc-200 border-zinc-700">
  <div class="bg-zinc-800 border border-b border-t-0 border-x-0 border-inherit rounded-t-md flex justify-between items-center flex-row pr-4">
    <div
      class="flex flex-row gap-3 font-semibold items-center text-left text-zinc-50 text-md p-5 {isDraggable ? 'cursor-move select-none' : ''}"
      onmousedown={onDragStart}
      role={isDraggable ? 'dialog' : undefined}
      aria-label={isDraggable ? 'Drag' : ''}
    >
      {#if isDraggable}
        <IconDrag class="w-[1.25rem] h-[1.25rem]" />
      {/if}
      {@render header?.()}
    </div>
    {#if typeof onClose === 'function'}
      <button
        class="text-zinc-300 hover:bg-zinc-700 p-2 rounded-md transition"
        onclick={onClose}
      >
        <IconClose
          class="w-[1.25rem] h-[1.25rem]"
        />
      </button>
    {/if}
  </div>
  <div class="p-5">
    {@render body()}
  </div>
  {#if footer}
    <div class="border border-inherit">
      {@render footer()}
    </div>
  {/if}
</div>