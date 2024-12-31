<script lang="ts">
  import type { Snippet } from 'svelte'

  import IconClose from '~icons/mdi/close'

  const {
    header,
    body,
    footer,
    onClose
  }: {
    header?: Snippet,
    body: Snippet,
    footer?: Snippet,
    onClose?: () => void
  } = $props()
</script>

<div class="border rounded-md shadow-lg bg-zinc-900 text-zinc-200 border-zinc-700">
  <div class="bg-zinc-800 border border-b border-t-0 border-x-0 border-inherit rounded-t-md flex justify-between items-center flex-row pr-4">
    <div class="font-semibold text-left text-zinc-50 text-md p-5">
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