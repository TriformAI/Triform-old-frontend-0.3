<script lang="ts">
  import type { Snippet } from 'svelte'

  import { fly, scale } from 'svelte/transition'

  import AutorenewIcon from '~icons/material-symbols/autorenew-rounded'

  const {
    variation = 'primary',
    body,
    onClick: onClickProp,
    disableAutoLoad = false,
    icon
  }: {
    // Will have secondary, muted, link etc as we need them
    variation?: 'primary' | 'link',
    // disabled
    // href
    // etc...
    body?: Snippet,
    icon?: Snippet,
    // Optionally disable the automatic loading indicator
    disableAutoLoad?: boolean,
    // If it returns a promise, show loading indicator until it resolves
    onClick?: () => void | Promise<void>
  } = $props()

  let isLoading = $state(false)
  const onClick = () => {
    if (typeof onClickProp === 'function') {
      try {
        // If it wasn't a promise this will just resolve immediately
        Promise.resolve(onClickProp()).then(() => {
          if (disableAutoLoad) return
          isLoading = false
          // hack, in case the promise is resolved too fast
          // (basically never happens but its pretty catastrophic if it does
          // so better to just fix it like this)
          setTimeout(() => isLoading = false, 50)
        })
        if (!disableAutoLoad) {
          console.log('loading')
          isLoading = true
        }
      } catch (e) {
        if (!disableAutoLoad) isLoading = false
        throw e
      }
    }
  }
</script>

<button
  class="
    {variation === 'primary'
    ? 'border-zinc-700 border bg-zinc-800 hover:border-zinc-600 hover:bg-zinc-700'
    : ''}
    {variation === 'link'
    ? 'hover:bg-zinc-500/10'
    : ''}
    p-3 flex items-center justify-center gap-x-2 flex-row
    rounded-md text-zinc-200
    active:scale-95 active:border-zinc-500
    transition transform
  "
  onclick={onClick}
>
  <!-- If we have an icon, animate it for loading state -->
  {#if !!icon}
    <div
      class="grid grid-cols-[1fr] grid-rows-[1fr]"
    >
      {#if isLoading}
        <div
          in:scale={{ start: 1.5, opacity: 0, duration: 500, delay: 50 }}
          out:scale={{ start: 0.5, opacity: 0, duration: 500, delay: 0 }}
          class="col-start-1 row-start-1"
        >
          <AutorenewIcon class="animate-spin" />
        </div>
      {:else}
        <div
          in:scale={{ start: 1.5, opacity: 0, duration: 500, delay: 75 }}
          out:scale={{ start: 0.5, opacity: 0, duration: 500, delay: 0 }}
          class="col-start-1 row-start-1"
        >
          {@render icon?.()}
        </div>
      {/if}
    </div>
    {@render body?.()}
  {:else}
    <!-- If we don't have an icon, replace the entire text with the loading icon -->
    {@const animY = 10}
    <div class="grid grid-cols-[1fr] grid-rows-[1fr]">
      {#if isLoading}
        <div
          in:fly={{ y: animY, duration: 300, delay: 50 }}
          out:fly={{ y: -animY, duration: 300, delay: 0 }}
          class="col-start-1 row-start-1 mx-auto flex items-center"
        >
          <AutorenewIcon class="animate-spin" />
        </div>
      {:else}
        <div
          in:fly={{ y: animY, duration: 300, delay: 50 }}
          out:fly={{ y: -animY, duration: 300, delay: 0 }}
          class="col-start-1 row-start-1"
        >
          {@render body?.()}
        </div>
      {/if}
      <!-- Copy of the body to make sure the button is always the same width even when loading -->
      <div
        class="col-start-1 row-start-1 invisible pointer-events-none"
      >
        {@render body?.()}
      </div>
    </div>
  {/if}
</button>