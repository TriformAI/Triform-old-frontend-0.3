<script lang="ts">
	import { API } from '$lib/api'
	import Editor from '$lib/components/atoms/Editor.svelte'
	import LightEditor from '$lib/components/atoms/LightEditor.svelte'
	import Tabs from '$lib/components/atoms/Tabs.svelte'
	import Button from '$lib/components/atoms/Button.svelte'
	import type { z } from 'zod'
	import type { actionModel } from '$lib/schemas'
	import { toast } from 'svelte-sonner'
	import compare from 'just-compare'
	import IconWarning from '~icons/material-symbols/warning-rounded'

	import PanelItem from '../PanelItem.svelte'
	import { inProgressComponents } from '$lib/stores/builder.svelte'
	import { blur, fade } from 'svelte/transition'
	import { debounce } from '$lib/utils/debounce'
	import { buildComponent, updateComponent } from '$lib/actions/components'
	import { getVisibleComponent, updateLocalComponent } from '$lib/stores/canvas.svelte'

	const { nodeId }: { nodeId: string } = $props()

	// Get the component data directly from the store
	const componentData = $derived(getVisibleComponent(nodeId) as z.infer<typeof actionModel>)

	const filenames = {
		source: 'action.py',
		readme: 'README.md',
		requirements: 'requirements.txt'
	} as const

	type FileType = keyof typeof filenames

	// if we're building, we need to sync the component that's being built to our
	// local form data, so it's as if we've written it ourselves
	$effect(() => {
		const newComponent = inProgressComponents[componentId]?.component as z.infer<typeof actionModel>
		if (!newComponent || !componentData) return

		// important that this is in the same order as the tabs
		const newData = {
			source: newComponent.spec.source,
			readme: newComponent.spec.readme,
			requirements: newComponent.spec.requirements
		}

		// switch tab depending on which file was updated
		const idx = Object.keys(newData).findIndex(
			key => newData[key as FileType] !== componentData.spec[key as FileType]
		)

		if (idx > -1) activeTab = idx

		// Update component data directly
		Object.assign(componentData.spec, newData)
	})

	let activeTab = $state(0) // Default to the first tab

	// Get the keys from files as dynamic tabs
	const tabs = $derived.by(() => {
		return Object.entries(filenames).map(([key, label]) => ({
			key,
			label
		}))
	})

	const componentId = $derived(componentData?.id)
	const isBuilding = $derived(componentId ? componentId in inProgressComponents : false)

	// Current file info
	const currentFileKey = $derived(Object.keys(filenames)[activeTab] as FileType)
	const currentFileName = $derived(filenames[currentFileKey])
	const currentLanguage = $derived(currentFileName.split('.').pop() as 'py' | 'md' | 'txt')

	const debouncedSave = debounce(async () => {
		const res = await updateComponent(componentData, false)
		console.log('res', res)
		if (!res.success)
			toast.error(
				// @ts-expect-error - errors arent typed in api client
				`Failed saving ${componentData.meta.name}: ${'issues' in res ? res.issues?.[0]?.message : (res.error ?? 'unknown error')}`
			)
		// don't overwrite the source so:
		// 1. the cursor stays still
		// 2. any potential changes during the saving are not lost
		else
			updateLocalComponent(res.data as z.infer<typeof actionModel>, {
				spec: ['source', 'readme']
			})
	}, 500)

	let isBuildingDeps = $state(false)
	const buildAction = async () => {
		isBuildingDeps = true
		const res = await buildComponent(componentId)
		updateComponent(res.data, false)
		// don't overwrite the source in case the user has changed it while building
		updateLocalComponent(res.data as z.infer<typeof actionModel>, { spec: ['source'] })
		if (!res.success) toast.error(`Failed building ${componentData.meta.name}`)
		else toast.success('Successfully built dependencies')
		isBuildingDeps = false
	}

	const buildButtonIsActive = $derived.by(() => {
		return !componentData.spec.checksum && componentData.spec.requirements
	})
</script>

<PanelItem title="Code" {nodeId}>
	<div class={['relative grid grid-rows-[auto_1fr]']}>
		<Tabs {tabs} bind:activeTab />

		<div class={['relative mt-2.5 grid transition-all', isBuilding && 'opacity-50 grayscale-75']}>
			{#if componentData}
				{#key activeTab}
					{#if currentLanguage === 'py'}
						<Editor
							bind:code={componentData.spec[currentFileKey]}
							class="h-full w-full rounded-md"
							readOnly={isBuilding}
							onUpdate={debouncedSave}
						/>
					{:else}
						<LightEditor
							language={currentLanguage}
							bind:value={componentData.spec[currentFileKey]}
							wordWrap={true}
							class="bg-main-800 h-full w-full rounded-md ps-6 pt-2.5 text-sm"
							readOnly={isBuilding}
							onUpdate={debouncedSave}
						/>
					{/if}
				{/key}
			{/if}
		</div>

		<div class="mt-4 flex items-start gap-2" transition:fade={{ duration: 150 }}>
			{#if buildButtonIsActive}
				<p
					class="text-main-400 grid shrink grid-cols-[auto_1fr] items-start gap-2 text-sm text-pretty opacity-100 transition-opacity duration-300 starting:opacity-0"
				>
					<IconWarning class="mt-1 size-4" />
					Your requirements.txt file has changed, please re-build your dependencies before executing
					this action
				</p>
			{/if}

			<Button
				disabled={!buildButtonIsActive}
				variation="vibrant"
				class="ms-auto"
				onClick={buildAction}
				isLoading={isBuildingDeps}
			>
				{#snippet body()}
					Build
				{/snippet}
			</Button>
		</div>
	</div>
</PanelItem>
