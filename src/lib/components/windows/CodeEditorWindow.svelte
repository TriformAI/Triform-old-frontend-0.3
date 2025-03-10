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
	import IconEdit from '~icons/material-symbols/edit-outline'
	import InputField from '../atoms/InputField.svelte'

	import { updateNode } from '$lib/stores/canvas.svelte'
	import { API } from '$lib/api'
	import { T } from '@tolgee/svelte'
	import { toast } from 'svelte-sonner'
	import { useNodesData } from '@xyflow/svelte'
	import { untrack } from 'svelte'
	import { debounce } from '$lib/utils/debounce'

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

	let hasUnsavedChanges = $state(false)
	let isRenaming = $state(false)
	let newName = $state('')

	// Watch the node state and update the nodeData whenever it changes
	// We do it like this instead of just passing node from props because
	// that won't be reactive (because of the way windows are opened/stored)
	let nodeData = $state<NodeData>()
	$effect(() => {
		untrack(() => {
			useNodesData(nodeId).subscribe(d => {
				if (!d) return
				nodeData = d.data as NodeData
				newName = nodeData.component_name
				// So typescript understands that it's an action
				if (nodeData.spec.resource !== 'action/v1') return
				files = {
					'action.py': (nodeData.spec.spec.source ?? '') as string,
					'README.md': (nodeData.spec.spec.readme ?? '') as string,
					'requirements.txt': (nodeData.spec.spec.deps ?? '') as string
				}
				// Keep track of the original files to know if the user has modified them yet
				if (!Object.values(originalFiles).join('').length) originalFiles = Object.assign({}, files)
			})
		})
	})

	type Files = Record<'action.py' | 'README.md' | 'requirements.txt', string>
	const initialFiles = {
		'action.py': '',
		'README.md': '',
		'requirements.txt': ''
	}
	let originalFiles = $state<Files>(initialFiles)
	let files = $state<Files>(initialFiles)
	const hasChangedFiles = $derived(
		Object.entries(files).some(([key, value]) => originalFiles[key as keyof Files] !== value)
	)

	const isUnsaved = $derived(hasUnsavedChanges || hasChangedFiles)

	// Get the keys from files as dynamic tabs
	const tabs = $derived.by(() => {
		return Object.keys(files).map(key => ({
			key,
			label: key
		}))
	})

	let activeTab = $state(0) // Default to the first tab

	// Whenever the files are updated, save them to the local representation of the project
	// so they're available from anywhere else in the app too
	// The updated code won't be persisted to the backend until we actually publish the component
	// and save the project
	const debounceSaveCode = debounce(async () => {
		if (!hasChangedFiles) return
		// So typescript understands that it's an action
		if (nodeData?.spec.resource !== 'action/v1') return

		nodeData.spec.spec.source = files['action.py']
		nodeData.spec.spec.readme = files['README.md']
		nodeData.spec.spec.deps = files['requirements.txt']
		await updateNode(
			nodeId,
			{
				spec: nodeData.spec
			},
			false
		)
	}, 300)

	const publishComponent = async () => {
		if (!nodeData) return

		try {
			const newComponent = await api.put<Component>('components', nodeData.spec)
			console.log('new component', newComponent)
			// Update the node in the project with the new data
			updateNode(
				nodeId,
				{
					// component_version: newComponent.meta.version,
					component_id: newComponent.meta.id,
					spec: newComponent
				},
				false
			)
			hasUnsavedChanges = false
		} catch (e) {
			console.error('Failed to publish component', e)
			toast.error('Failed to publish component')
		}
	}

	const bindRenameField = (el: HTMLInputElement) => {
		// Whenever the node starts being renamed, focus the input field
		if (!isRenaming) return
		el.focus()
		// Make sure entire selection is empty first
		document.getSelection()?.empty()
		el.select()
	}

	const saveName = async (e: FocusEvent | KeyboardEvent) => {
		if (!nodeData || !isRenaming) return

		if (e instanceof KeyboardEvent) {
			if (e.key === 'Escape') {
				isRenaming = false
				newName = nodeData.component_name
				return
			} else if (e.key === 'Enter') {
				e.preventDefault()
				// Continue as usual
			} else {
				// Some other key, just ignore it
				return
			}
		}

		if (!newName?.length) return toast.error('Please enter a name')

		nodeData.spec.meta.name = newName
		nodeData.component_name = newName // so it updates "locally" within this component

		isRenaming = false
		hasUnsavedChanges = true
	}
</script>

<Window disableDrag={isRenaming} {...props}>
	{#snippet header()}
		<div class="w-full">
			<span>
				<T keyName="code-editor-header" defaultValue="Edit" />
			</span>
			{#if isRenaming}
				<InputField
					containerClass="inline-block py-1"
					variation="tight"
					bind:value={newName}
					onblur={saveName}
					onkeydown={saveName}
					use={bindRenameField}
				/>
				<!-- <span>
					v{nodeData?.component_version ?? ''}
				</span> -->
			{:else}
				<div class="inline-flex flex-row items-center gap-2">
					<span>
						{nodeData?.component_name ?? ''}
						<!-- v{nodeData?.component_version ?? ''} -->
					</span>
					{#if isUnsaved}
						<span class="text-main-600 font-medium">(unpublished)</span>
					{/if}
					<Button
						variation="link"
						onClick={() => (isRenaming = true)}
						tooltip="Rename"
						tooltipPos="right"
						class="opacity-0 transition-opacity group-hover/card-header:opacity-100"
					>
						{#snippet icon()}
							<IconEdit />
						{/snippet}
					</Button>
				</div>
			{/if}
		</div>
	{/snippet}

	{#snippet body()}
		<div class="grid min-w-[600px] grid-rows-[auto_minmax(205px,1fr)_auto]">
			<Tabs {tabs} bind:activeTab class="-mt-3 mb-4" />

			<div class="relative grid">
				{#each tabs as tab, idx}
					{@const fileName = tab.key as keyof Files}
					{@const language = tab.key.split('.').pop() as 'py' | 'md' | 'txt'}

					{#if language === 'py'}
						<CodeEditor
							bind:code={files[fileName]}
							class={`${idx === activeTab ? 'block' : 'hidden'} absolute h-full w-full rounded-md`}
							onUpdate={() => {
								debounceSaveCode()
							}}
						/>
					{:else}
						<LightEditor
							{language}
							value={files[fileName]}
							wordWrap={true}
							class={`${idx === activeTab ? 'block' : 'hidden'} bg-main-800 absolute h-full w-full rounded-md ps-6 pt-2.5 text-sm`}
							onUpdate={val => {
								files[fileName] = val
								debounceSaveCode()
							}}
						/>
					{/if}
				{/each}
			</div>

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
