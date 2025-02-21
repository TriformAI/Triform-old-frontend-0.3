<script lang="ts">
	import Button from '$lib/components/atoms/Button.svelte'
	import LightEditor from '$lib/components/atoms/LightEditor.svelte'
	import Tabs from '$lib/components/atoms/Tabs.svelte'
	import Window from '$lib/components/common/Window.svelte'
	import type { Node } from '$lib/types/flow'
	import IconPublish from '~icons/mdi/cloud-upload-outline'
	import CodeEditor from '../CodeEditor.svelte'

	import { API } from '$lib/api'
	import { T } from '@tolgee/svelte'

	const api = new API()

	interface Props {
		customProps: {
			files: {
				'action.py': string
				'README.md': string
				'requirements.txt': string
				[k: string]: string
			}
			node: Node
		}
	}

	const props: Props = $props()
	const { files, node } = $derived(props.customProps)

	// Get the keys from customProps as dynamic tabs
	const tabs = $derived.by(() => {
		return Object.keys(files).map(key => ({
			key,
			label: key
		}))
	})

	let activeTab = $state(0) // Default to the first tab

	const publish = async () => {
		console.log('publishing')
		const newComponent = await api.put('components', node.data.spec)
		console.log('new component', newComponent)
	}
</script>

<Window {...props}>
	{#snippet header()}
		<T keyName="code-editor-header" defaultValue="Code editor" />
	{/snippet}

	{#snippet body()}
		<div class="grid min-h-[400px] min-w-[600px] grid-rows-[auto_1fr_auto]">
			<Tabs {tabs} bind:activeTab />

			{#each tabs as tab, idx}
				{@const language = tab.key.split('.').pop() as 'py' | 'md' | 'txt'}

				<div class={[idx === activeTab ? 'block' : 'hidden']}>
					{#if language === 'py'}
						<CodeEditor code={files[tab.key]} class="h-full rounded-md" />
					{:else}
						<LightEditor
							{language}
							wordWrap={true}
							class="bg-main-800 h-full w-full rounded-md ps-6 pt-2.5 text-sm"
							onUpdate={val => {
								console.log(val)
							}}
						/>
					{/if}
				</div>
			{/each}

			<div class="mt-6 flex items-center justify-between">
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
