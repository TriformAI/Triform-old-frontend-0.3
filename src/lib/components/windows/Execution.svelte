<script lang="ts">
  import Window from '$lib/components/common/Window.svelte'
  import { T } from '@tolgee/svelte'

  import { canvasStore } from '$lib/stores/canvas.svelte'
  import { runAgent } from '$lib/actions/executor'

  import Button from '../atoms/Button.svelte'
  import InputField from '../atoms/InputField.svelte'
  import Code from '../atoms/Code.svelte'

  import IconPlay from '~icons/material-symbols/play-arrow-outline-rounded'

  // Just pass through all props
  const props = $props()

  let input = $state('{ "url": "https://pdfobject.com/pdf/sample.pdf" }')
  let result = $state('')

  const run = async () => {
    const res = await runAgent(canvasStore[0].resource, JSON.parse(input))
    console.log(res)
    result = res
  }
</script>

<Window
  {...props}
>
  {#snippet header()}
    <T
      keyName="window-execution-header"
      defaultValue="Execution"
    />
  {/snippet}

  {#snippet body()}
    <div class="flex flex-col gap-y-4">
      <div class="grid grid-cols-2 gap-x-2 w-full min-w-64">
        <Button
          class="w-full"
          onClick={run}
          autoLoad={true}
        >
          {#snippet icon()}
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
      <InputField
        label="Test data"
        placeholder="Temporary test data"
        type="text"
        bind:value={input}
      />
      {#if result}
        <div class="max-w-lg">
          <Code code={JSON.stringify(result, null, 2)} />
        </div>
      {/if}
    </div>
  {/snippet}
</Window>
