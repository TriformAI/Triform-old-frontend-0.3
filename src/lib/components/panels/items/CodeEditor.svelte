<script lang="ts">
	import { API } from '$lib/api'
	import Editor from '$lib/components/atoms/Editor.svelte'
	import LightEditor from '$lib/components/atoms/LightEditor.svelte'
	import Tabs from '$lib/components/atoms/Tabs.svelte'
	import Button from '$lib/components/atoms/Button.svelte'
	import type { Action } from '$lib/types/agent'
	import { toast } from 'svelte-sonner'
	import compare from 'just-compare'
	import PanelItem from '../PanelItem.svelte'
	import { drafts } from '$lib/stores/canvas.svelte'
	import { inProgressComponents } from '$lib/stores/builder.svelte'
	import { blur } from 'svelte/transition'
	import { type Component } from '$lib/types/agent'
	import { invalidate } from '$app/navigation'
	import DirtyNote from '$lib/components/DirtyNote.svelte'
	import { debounce } from '$lib/utils/debounce'
	import { getContext } from 'svelte'

	const { componentData }: { componentData: Component } = $props()

	const api = new API()

	const draftData = $derived.by(() => {
		return drafts[componentData.meta.id] as Action
	})

	const dataIsDirty = $derived.by(() => {
		return draftData ? !compare(componentData.spec, draftData.spec) : false
	})

	const filenames = {
		source: 'action.py',
		readme: 'README.md',
		deps: 'requirements.txt'
	} as const

	type FileType = keyof typeof filenames

	// if we're building, we need to sync the component that's being bult to our
	// local form data, so it's as if we've written it ourselves
	$effect(() => {
		const newComponent = inProgressComponents[componentId]?.component as Action
		if (!newComponent) return

		// important that this is in the same order as the tabs
		const newData = {
			source: newComponent.spec.source,
			readme: newComponent.spec.readme,
			deps: newComponent.spec.deps
		}
		// switch tab depending on which file was updated
		const idx = Object.keys(newData).findIndex(
			key => newData[key as FileType] !== draftData.spec[key]
		)

		if (idx > -1) activeTab = idx

		Object.assign(draftData.spec, newData)
	})

	const publishSpec = async () => {
		try {
			const payload = {
				...componentData,
				spec: draftData.spec
			}

			const result = await api.put<Action>(`components/${componentData.meta.id}`, payload)
			// If meta is not dirty, delete draft
			// Else, update draft with published spec
			if (compare(componentData.meta, draftData.meta)) {
				await api.delete<Action>(`components/${componentData.meta.id}/draft`)
			} else {
				await saveDraft({
					...draftData,
					spec: { ...result.spec }
				})
			}

			invalidate('project')
			toast.success('Code successfully published!')
		} catch (e) {
			console.error('Failed to publish code', e)
			toast.error('Failed to publish code')
		}
	}

	let activeTab = $state(0) // Default to the first tab

	// Get the keys from files as dynamic tabs
	const tabs = $derived.by(() => {
		return Object.entries(filenames).map(([key, label]) => ({
			key,
			label
		}))
	})

	const componentId = $derived(componentData.meta.id)
	const isBuilding = $derived(componentId in inProgressComponents)

	async function saveDraft(data?: Component) {
		if (!data) {
			data = draftData
		}

		await api.patch<Action>(`components/${componentData.meta.id}/draft`, data)
	}
</script>

<PanelItem title="Code" {componentData} isDirty={dataIsDirty}>
	<div class="relative">
		<Tabs {tabs} bind:activeTab />
		<div
			class={[
				'relative mt-2.5 grid h-[65vh] transition-all',
				isBuilding && 'opacity-50 grayscale-75'
			]}
		>
			{#if draftData}
				{#each Object.entries(filenames) as [key, value], idx (key)}
					{@const language = value.split('.').pop() as 'py' | 'md' | 'txt'}
					{#if language === 'py'}
						<Editor
							bind:code={draftData.spec[key as FileType]}
							class={`${idx === activeTab ? 'block' : 'hidden'} absolute h-full w-full rounded-md`}
							readOnly={isBuilding}
							onUpdate={debounce(saveDraft, 500)}
						/>
					{:else}
						<LightEditor
							{language}
							bind:value={draftData.spec[key as FileType]}
							wordWrap={true}
							class={`${idx === activeTab ? 'block' : 'hidden'} bg-main-800 absolute h-full w-full rounded-md ps-6 pt-2.5 text-sm`}
							readOnly={isBuilding}
							onUpdate={debounce(saveDraft, 500)}
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
		<DirtyNote show={dataIsDirty} />

		<Button
			class="ms-auto"
			type="button"
			onClick={publishSpec}
			autoLoad="promise"
			disabled={!dataIsDirty || isBuilding}
			variation="vibrant"
		>
			{#snippet body()}
				Publish
			{/snippet}
		</Button>
	</div>
</PanelItem>
