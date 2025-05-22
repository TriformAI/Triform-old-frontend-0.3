<script lang="ts">
	import { API } from '$lib/api'
	import Editor from '$lib/components/atoms/Editor.svelte'
	import LightEditor from '$lib/components/atoms/LightEditor.svelte'
	import Tabs from '$lib/components/atoms/Tabs.svelte'
	import { selected } from '$lib/stores/panel.svelte'
	import Button from '$lib/components/atoms/Button.svelte'
	import type { Action } from '$lib/types/agent'
	import { onDestroy } from 'svelte'
	import { toast } from 'svelte-sonner'
	import compare from 'just-compare'
	import pick from 'just-pick'
	import { clone } from '$lib/utils/clone'
	import PanelItem from '../PanelItem.svelte'
	import { getCurrentFlowId, getNodes, isAction } from '$lib/stores/canvas.svelte'
	import { inProgressComponents } from '$lib/stores/builder.svelte'
	import { blur } from 'svelte/transition'
	import { type Component } from '$lib/types/agent'
	import { invalidate } from '$app/navigation'

	const { componentData }: { componentData: Component } = $props()

	const api = new API()

	const nodeId = $derived(selected.node?.id ?? getCurrentFlowId())
	const node = $derived(getNodes().find(n => n.id === nodeId))

	interface FormData {
		source: string
		readme: string
		deps: string
	}

	const filenames = {
		source: 'action.py',
		readme: 'README.md',
		deps: 'requirements.txt'
	}

	type FileType = keyof typeof initialData

	let initialData = $state<FormData>()!
	let formData = $state<FormData>()

	const dataIsDirty = $derived(selected.isDirty || !compare(initialData, formData))

	function setFormdata() {
		if (!isAction(componentData)) {
			return
		}

		initialData = pick(componentData.spec, ['source', 'readme', 'deps'])
		formData = clone(initialData)
	}

	setFormdata()

	// if we're building, we need to sync the component that's being bult to our
	// local form data, so it's as if we've written it ourselves
	$effect(() => {
		const newComponent = inProgressComponents[componentId]?.component as Action
		if (!newComponent) return

		// important that this is in the same order as the tabs
		const newData: FormData = {
			source: newComponent.spec.source,
			readme: newComponent.spec.readme,
			deps: newComponent.spec.deps
		}
		// switch tab depending on which file was updated
		const idx = Object.keys(newData).findIndex(
			key => newData[key as FileType] !== formData[key as FileType]
		)
		if (idx > -1) activeTab = idx
		Object.assign(formData, newData)
	})

	function updateData(isDirty: boolean) {
		if (!node || !node.data || !node.data.trinode || !componentData) {
			return
		}

		const meta = componentData.meta
		node.data.trinode.spec.meta = { ...meta, ...formData }
		node.data.props.isDirty = isDirty
	}

	onDestroy(() => {
		//updateData(dataIsDirty)
	})

	const updateComponent = async () => {
		const nodeId = selected.node?.id ?? getCurrentFlowId()

		if (!nodeId) {
			return toast.error('No node selected')
		}

		const payload = clone(componentData)
		payload.spec = { ...payload.spec, ...formData }

		try {
			const _result = await api.put<Action>(`components/${componentData.meta.id}`, payload)

			// Reset original files to current files and set isDirty to false
			updateData(false)
			invalidate('project')
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

	const componentId = $derived(componentData.meta.id)
	const isBuilding = $derived(componentId in inProgressComponents)
</script>

<PanelItem title="Code" {componentData}>
	<div class="relative">
		<Tabs {tabs} bind:activeTab />
		<div
			class={[
				'relative mt-2.5 grid h-[300px] transition-all',
				isBuilding && 'opacity-50 grayscale-75'
			]}
		>
			{#if formData}
				{#each Object.entries(formData) as [key, _value], idx (key)}
					{@const language = filenames[key as FileType].split('.').pop() as 'py' | 'md' | 'txt'}
					{#if language === 'py'}
						<Editor
							bind:code={formData[key as FileType]}
							class={`${idx === activeTab ? 'block' : 'hidden'} absolute h-full w-full rounded-md`}
							readOnly={isBuilding}
						/>
					{:else}
						<LightEditor
							{language}
							bind:value={formData[key as FileType]}
							wordWrap={true}
							class={`${idx === activeTab ? 'block' : 'hidden'} bg-main-800 absolute h-full w-full rounded-md ps-6 pt-2.5 text-sm`}
							readOnly={isBuilding}
						/>
					{/if}
				{/each}
			{/if}
		</div>

		{#if isBuilding}
			{@const message = inProgressComponents[componentId].message}
			{#key message}
				<div
					class="pointer-events-none absolute inset-0 flex items-center justify-center px-6 py-4 opacity-100 transition starting:opacity-0"
				>
					<div
						class="bg-main-950/40 animate-border h-fit w-fit rounded px-8 py-4 backdrop-blur-2xl"
					>
						<span
							class="text-main-200 truncate-lines-5 text-center"
							transition:blur={{
								duration: 800,
								opacity: 0,
								amount: 5
							}}
						>
							{message}
						</span>
					</div>
				</div>
			{/key}
		{/if}
	</div>

	<div class="mt-4 flex items-center justify-between">
		{#if dataIsDirty}
			<p class="text-main-400 text-sm">You have unsaved changes</p>
		{/if}

		<Button
			class="ms-auto"
			type="button"
			onClick={updateComponent}
			autoLoad="promise"
			disabled={!dataIsDirty || isBuilding}
			variation="vibrant"
		>
			{#snippet body()}
				Save
			{/snippet}
		</Button>
	</div>
</PanelItem>
