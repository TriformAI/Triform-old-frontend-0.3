<script lang="ts">
	import type { Component } from '$lib/types/agent'
	import type { Node, NodeData } from '$lib/types/flow'
	import type { Window as WindowType } from '$lib/stores/windows.svelte'

	import Button from '$lib/components/atoms/Button.svelte'
	import LightEditor from '$lib/components/atoms/LightEditor.svelte'
	import Tabs from '$lib/components/atoms/Tabs.svelte'
	import Window from '$lib/components/common/Window.svelte'
	import IconPublish from '~icons/mdi/cloud-upload-outline'
	import CodeEditor from '../CodeEditor.svelte'

	import { updateNode } from '$lib/stores/canvas.svelte'
	import { API } from '$lib/api'
	import { T } from '@tolgee/svelte'
	import { toast } from 'svelte-sonner'
	import { useNodesData } from '@xyflow/svelte'

	const api = new API()

	interface Props extends WindowType {
		customProps: {
			// Explicitly pass in a node id instead of node so we're forced
			// to fetch it from the store instead so it's reactive
			nodeId: Node['id']
		}
	}

	const props: Props = $props()
	const { nodeId } = $derived(props.customProps)

	// Watch the node state and update the nodeData whenever it changes
	// We do it like this instead of just passing node from props because
	// that won't be reactive (because of the way windows are opened/stored)
	let nodeData = $state<NodeData>()
	$inspect(nodeData)
	$effect(() => {
		useNodesData(nodeId).subscribe(d => {
			if (!d) return
			console.log('nodedata', d)
			nodeData = d.data as NodeData
		})
	})

	const files = $derived<Record<string, string>>({
		'action.py': (nodeData?.spec.spec.source ?? '') as string,
		'README.md': (nodeData?.spec.spec.readme ?? '') as string,
		'requirements.txt': (nodeData?.spec.spec.deps ?? '') as string
	})

	// Get the keys from files as dynamic tabs
	const tabs = $derived.by(() => {
		return Object.keys(files).map(key => ({
			key,
			label: key
		}))
	})

	let activeTab = $state(0) // Default to the first tab

	const publishComponent = async () => {
		if (!nodeData) return
		// Update the code files (locally) before publishing
		nodeData.spec.spec.source = files['action.py']
		nodeData.spec.spec.readme = files['README.md']
		nodeData.spec.spec.deps = files['requirements.txt']

		try {
			const newComponent = await api.put<Component>('components', nodeData.spec)
			console.log('new component', newComponent)
			// Update the node in the project with the new data
			updateNode(nodeId, {
				component_version: newComponent.meta.version,
				component_id: newComponent.meta.id,
				spec: newComponent
			})
		} catch (e) {
			console.error('Failed to publish component', e)
			toast.error('Failed to publish component')
		}
	}
</script>

<Window {...props}>
	{#snippet header()}
		<span>
			<T keyName="code-editor-header" defaultValue="Edit" />
			{nodeData?.component_name ?? ''} v{nodeData?.component_version ?? ''}
		</span>
	{/snippet}

	{#snippet body()}
		<div class="grid min-h-[400px] min-w-[600px] grid-rows-[auto_1fr_auto]">
			<Tabs {tabs} bind:activeTab class="-mt-3 mb-4" />

			{#each tabs as tab, idx}
				{@const language = tab.key.split('.').pop() as 'py' | 'md' | 'txt'}

				<div class={['relative', idx === activeTab ? 'block' : 'hidden']}>
					{#if language === 'py'}
						<CodeEditor bind:code={files[tab.key]} class="absolute h-full w-full rounded-md" />
					{:else}
						<LightEditor
							{language}
							value={files[tab.key]}
							wordWrap={true}
							class="bg-main-800 h-full w-full rounded-md ps-6 pt-2.5 text-sm"
							onUpdate={val => {
								files[tab.key] = val
							}}
						/>
					{/if}
				</div>
			{/each}

			<div class="mt-6 flex items-center justify-between">
				<Button variation="vibrant" class="ml-auto" autoLoad="promise" onClick={publishComponent}>
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
