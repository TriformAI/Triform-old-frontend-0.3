<script lang="ts">
  import { untrack, type Snippet } from 'svelte'
  import type { ModalId } from '$lib/stores/modals.svelte'

  import * as modalStore from '$lib/stores/modals.svelte'
  
  import { createDialog } from 'svelte-headlessui'
  import { fade, scale } from 'svelte/transition'
  import Card from './Card.svelte'

  let {
    header,
    body,
    footer,
    id
  }: {
    header?: Snippet | undefined,
    body: Snippet,
    footer?: Snippet | undefined,
    id: ModalId
  } = $props()

  const dialog = createDialog({ expanded: false })

  const { activeModals } = modalStore

  $effect(() => {
    activeModals.has(id)
      ? dialog.open()
      : dialog.close()
  })

  const onClose = () => {
    dialog.close()
    modalStore.closeModal(id)
  }
</script>

<div class="relative z-50">
  {#if $dialog.expanded}
    <div
      class="fixed inset-0 overflow-y-auto bg-zinc-950/85 backdrop-blur flex justify-center items-center"
      transition:fade={{ duration: 200 }}
      onclose={onClose}
    >
      <div
        class="max-w-xl w-full"
        use:dialog.modal
        transition:scale={{ duration: 300, start: 0.9 }}
      >
        <Card
          {header}
          {body}
          {footer}
          {onClose}
        />
      </div>
    </div>
  {/if}
</div>