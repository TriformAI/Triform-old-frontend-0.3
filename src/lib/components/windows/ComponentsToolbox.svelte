<script lang="ts">
  import Window from '$lib/components/common/Window.svelte'

  // Just pass through all props
  const props = $props()
</script>

<Window
  {...props}
>
  {#snippet header()}
    Components Toolbox
  {/snippet}

  {#snippet body()}
    Temporary body
  {/snippet}
</Window>
