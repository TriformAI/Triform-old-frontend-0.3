<script lang="ts">
	import { API } from '$lib/api'
	import Editor from '$lib/components/atoms/Editor.svelte'
	import LightEditor from '$lib/components/atoms/LightEditor.svelte'
	import Tabs from '$lib/components/atoms/Tabs.svelte'
	import { selected } from '$lib/stores/canvas.svelte'
	import Button from '$lib/components/atoms/Button.svelte'
	import { nodes, setIsDirty } from '$lib/stores/canvas.svelte'
	import type { Action } from '$lib/types/agent'
	import { onDestroy } from 'svelte'
	import { toast } from 'svelte-sonner'
	import compare from 'just-compare'
	import pick from 'just-pick'
	import { clone } from '$lib/utils/clone'

	const api = new API()

	const nodeId = selected.node?.id

	interface FormData {
		source: string
		readme: string
		deps: string
	}

	let initialData = $state<FormData>()!
	let formData = $state<FormData>()!

	const dataIsDirty = $derived(selected.isDirty || !compare(initialData, formData))

	function setFormdata() {
		if (!nodeId) return

		initialData = pick(nodes[nodeId].data.trinode.spec.spec, ['source', 'readme', 'deps'])
		formData = clone(initialData)
	}

	setFormdata()

	const filenames = {
		source: 'action.py',
		readme: 'README.md',
		deps: 'requirements.txt'
	}

	type FileType = keyof typeof initialData

	function updateData(isDirty: boolean) {
		if (!nodeId) return
		// Save current state to node when panel is closing
		setIsDirty(nodeId, isDirty)
		const spec = nodes[nodeId].data.trinode.spec.spec

		nodes[nodeId].data.trinode.spec.spec = {
			...spec,
			...formData
		}
	}

	onDestroy(() => {
		updateData(dataIsDirty)
	})

	const publishComponent = async () => {
		if (!selected.node) {
			return
		}

		try {
			const result = await api.put<Action>(
				`components/${selected.node.data.trinode.spec.meta.id}`,
				selected.node?.data.trinode.spec
			)

			// Reset original files to current files and set isDirty to false
			updateData(false)
			initialData = clone(formData)
			toast.success('Component successfully published!')
		} catch (e) {
			console.error('Failed to publish component', e)
			toast.error('Failed to publish component')
		}
	}

	let activeTab = $state(0) // Default to the first tab

	// Get the keys from files as dynamic tabs
	const tabs = $derived.by(() => {
		if (!formData) {
			return []
		}
		return Object.keys(formData).map(key => ({
			key: key as FileType,
			label: filenames[key as FileType]
		}))
	})
</script>

<Tabs {tabs} bind:activeTab />

<div class="relative mt-2.5 grid h-[300px]">
	{#each Object.entries(formData) as [key, value], idx}
		{@const language = filenames[key as FileType].split('.').pop() as 'py' | 'md' | 'txt'}

		{#if language === 'py'}
			<Editor
				bind:code={formData[key as FileType]}
				class={`${idx === activeTab ? 'block' : 'hidden'} absolute h-full w-full rounded-md`}
			/>
		{:else}
			<LightEditor
				{language}
				bind:value={formData[key as FileType]}
				wordWrap={true}
				class={`${idx === activeTab ? 'block' : 'hidden'} bg-main-800 absolute h-full w-full rounded-md ps-6 pt-2.5 text-sm`}
			/>
		{/if}
	{/each}
</div>

<div class="mt-4 flex items-center justify-between">
	{#if dataIsDirty}
		<p class="text-main-400 text-sm">You have unsaved changes</p>
	{/if}

	<Button
		class="ms-auto"
		type="button"
		onClick={publishComponent}
		autoLoad="promise"
		disabled={!dataIsDirty}
		variation="vibrant"
	>
		{#snippet body()}
			Publish
		{/snippet}
	</Button>
</div>
