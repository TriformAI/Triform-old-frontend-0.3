<script lang="ts">
	import type { Node } from '$lib/types/flow'
	import IconPublish from '~icons/mdi/cloud-upload-outline'
	import Window from '$lib/components/common/Window.svelte'
	import Tabs from '$lib/components/atoms/Tabs.svelte'
	import CodeEditor from '../CodeEditor.svelte'
	import Button from '$lib/components/atoms/Button.svelte'

	import { API } from '$lib/api'
	import { T } from '@tolgee/svelte'

	const api = new API()

	// Props passed to the component
	const props = $props()
	const {
		customProps: { files, node }
	}: {
		customProps: {
			files: {
				'action.py': string
				'README.md': string
				'requirements.txt': string
				[k: string]: string
			}
			node: Node
		}
	} = props

	// Get the keys from customProps as dynamic tabs
	const tabs = Object.keys(files).map(key => ({
		key,
		label: key
	}))

	// Variable to keep track of the active tab
	let activeTab = $state(tabs[0]) // Default to the first tab

	const publish = async () => {
		console.log('publishing')
		const newComponent = await api.put('components', node.data.spec)
		console.log('new component', newComponent)
	}
</script>

<Window {...props}>
	{#snippet header()}
		<T keyName="code-editor-header" defaultValue="Code Editor" />
	{/snippet}

	{#snippet body()}
		<Tabs {tabs} bind:activeTab />

		<div class="flex flex-col gap-y-4 py-4">
			<div class="container-size">
				{#each tabs as tab}
					{#if activeTab?.key === tab.key}
						<CodeEditor code={files[tab.key]} />
					{/if}
				{/each}
			</div>
			<div class="flex items-center justify-between">
				<!-- for testing purpose -->
				<!-- <Select bind:selected {options} singleValue={false} /> -->
				<Button variation="vibrant" class="ml-auto" autoLoad={true} onClick={publish}>
					{#snippet icon()}
						<IconPublish class="size-5.5" />
					{/snippet}
					{#snippet body()}
						<T keyName="code-editor-publish-button" defaultValue="Publish" />
					{/snippet}
				</Button>
			</div>
		</div>
	{/snippet}
</Window>
