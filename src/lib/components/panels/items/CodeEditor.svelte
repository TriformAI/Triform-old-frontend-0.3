<script lang="ts">
	import { API } from '$lib/api'
	import Editor from '$lib/components/atoms/Editor.svelte'
	import LightEditor from '$lib/components/atoms/LightEditor.svelte'
	import Tabs from '$lib/components/atoms/Tabs.svelte'
	import { selected } from '$lib/stores/canvas.svelte'
	import Button from '$lib/components/atoms/Button.svelte'
	import { nodes, updateNode } from '$lib/stores/canvas.svelte'
	import type { Action } from '$lib/types/agent'
	import { onDestroy } from 'svelte'
	import { toast } from 'svelte-sonner'

	const api = new API()

	const filenames = {
		source: 'action.py',
		readme: 'README.md',
		deps: 'requirements.txt'
	}

	const nodeId = selected.node?.id

	// Get files contents from node
	let originalFiles = $state(
		(selected.node?.data.trinode.spec.spec as typeof filenames) ?? {
			source: '',
			readme: '',
			deps: ''
		}
	)

	type FileType = keyof typeof originalFiles

	// Set files initially
	// There could be other values on originalFiles, so only take the ones we need
	let files = $state({
		source: originalFiles.source,
		readme: originalFiles.readme,
		deps: originalFiles.deps
	})

	// Has files changed during this panel session?
	const hasChangedFiles = $derived(
		Object.entries(files).some(([key, value]) => originalFiles[key as FileType] !== value)
	)

	// Is the node dirty or have files changed?
	const isDirty = $derived((nodeId && nodes[nodeId].data.props.isDirty) || hasChangedFiles)

	function setIsDirty(val: boolean) {
		if (!nodeId) return
		nodes[nodeId].data.props.isDirty = val
	}

	onDestroy(() => {
		// Save current state to node when panel is closing
		setIsDirty(isDirty)
	})

	let activeTab = $state(0) // Default to the first tab

	const publishComponent = async () => {
		if (!selected.node) {
			return
		}

		try {
			const result = await api.put<Action>('components', selected.node?.data.trinode.spec)

			// Reset original files to current files and set isDirty to false
			originalFiles = { ...files }
			setIsDirty(false)
			toast.success('Component successfully published!')
		} catch (e) {
			console.error('Failed to publish component', e)
			toast.error('Failed to publish component')
		}
	}

	// Save to node when any of the files are updated
	function updateFiles() {
		if (!selected.node || !files) {
			return
		}

		const payload = selected.node.data.trinode
		payload.spec.spec = {
			...payload.spec.spec,
			...files
		}

		updateNode(selected.node.id, payload)
	}

	// Get the keys from files as dynamic tabs
	const tabs = $derived.by(() => {
		return Object.keys(files).map(key => ({
			key: key as FileType,
			label: filenames[key as FileType]
		}))
	})
</script>

<Tabs {tabs} bind:activeTab />

{#if files}
	<div class="relative mt-2.5 grid h-[300px]">
		{#each Object.entries(files) as [key, value], idx}
			{@const language = filenames[key as FileType].split('.').pop() as 'py' | 'md' | 'txt'}

			{#if language === 'py'}
				<Editor
					bind:code={files[key as FileType]}
					class={`${idx === activeTab ? 'block' : 'hidden'} absolute h-full w-full rounded-md`}
					onUpdate={updateFiles}
				/>
			{:else}
				<LightEditor
					{language}
					bind:value={files[key as FileType]}
					wordWrap={true}
					class={`${idx === activeTab ? 'block' : 'hidden'} bg-main-800 absolute h-full w-full rounded-md ps-6 pt-2.5 text-sm`}
					onUpdate={updateFiles}
				/>
			{/if}
		{/each}
	</div>

	<div class="mt-4 flex items-center justify-between">
		{#if isDirty}
			<p class="text-main-400 text-sm">You have unsaved changes</p>
		{/if}

		<Button
			class="ms-auto"
			type="button"
			onClick={publishComponent}
			autoLoad="promise"
			disabled={!isDirty}
			variation="vibrant"
		>
			{#snippet body()}
				Publish
			{/snippet}
		</Button>
	</div>
{/if}
