<script lang="ts">
  import Window from '$lib/components/common/Window.svelte'

  import Tabs from '$lib/components/atoms/Tabs.svelte'
  import type { Tab } from '$lib/components/atoms/Tabs.svelte'

  // Just pass through all props
  const props = $props()

  let activeTab: Tab
</script>

<Window
  {...props}
>
  {#snippet header()}
    Components Toolbox
  {/snippet}

  {#snippet body()}
    Temporary body

    <Tabs
      tabs={[
        { key: '1', label: 'Actions' },
        { key: '2', label: 'Agents' }
      ]}
      {activeTab}
    />
  {/snippet}
</Window>
