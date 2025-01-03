<script lang="ts">
  import Window from '$lib/components/common/Window.svelte'

  import Button from '../atoms/Button.svelte';

  import IconPlay from '~icons/material-symbols/play-arrow-outline-rounded'

  // Just pass through all props
  const props = $props()
</script>

<Window
  {...props}
>
  {#snippet header()}
    Execution
  {/snippet}

  {#snippet body()}
    <div class="grid grid-cols-2 gap-x-2 w-full min-w-64">
      <Button
        class="w-full"
      >
        {#snippet body()}
          <IconPlay />
        {/snippet}
      </Button>
      <Button
        class="w-full"
      >
        {#snippet body()}
          Publish
        {/snippet}
      </Button>
    </div>
  {/snippet}
</Window>
