<script lang="ts">
	import { type Component as SvelteComponent, type Snippet } from 'svelte'
	import PanelItems from './PanelItems.svelte'
	import {
		getCurrentContainer,
		getProject,
		getVisibleComponent,
		updateLocalComponent
	} from '$lib/stores/canvas.svelte'
	import { isAction, isProject } from '$lib/schemas'
	import GenerateButton from '../atoms/GenerateButton.svelte'
	import { getUserMessage, chat } from '$lib/stores/chat.svelte'
	import { toast } from 'svelte-sonner'
	import EditIcon from '~icons/material-symbols/edit-square-outline-rounded'
	import IconCheck from '~icons/material-symbols/check-rounded'
	import { saveProject } from '$lib/actions/project'
	import { updateComponent } from '$lib/actions/components'
	import { requirements } from '$lib/stores/requirements.svelte'
	import { inProgressComponents } from '$lib/stores/builder.svelte'
	import { toggleOpenPanelItem } from '$lib/stores/panel.svelte'
	import { nodeTypesDict, type NodeType } from '$lib/constants/nodeTypes'
	import { getActiveContext, setActiveContext, selected } from '$lib/stores/panel.svelte'

	interface Props {
		nodeId: string
		Icon?: SvelteComponent
		panelItems: Snippet<[typeof PanelItems]>
	}

	const { nodeId, Icon, panelItems }: Props = $props()

	const selectedNodeId = $derived.by(() => {
		if (selected.node?.id.endsWith(':input') || selected.node?.id.endsWith(':output'))
			return 'container'
		return selected.node?.id ?? 'container'
	})
	const selectedNodeComponent = $derived(getVisibleComponent(selectedNodeId))
	const nodeType = $derived(
		nodeTypesDict[selectedNodeComponent?.resource.split('/')[0] as NodeType]
	)
	const contextToggles = $derived([
		{
			id: 'project',
			icon: nodeTypesDict.project.icon,
			iconClasses: nodeTypesDict.project.iconClasses,
			disabled: false
		},
		{
			id: 'node',
			icon: nodeType?.icon,
			iconClasses: nodeType?.iconClasses,
			disabled:
				!selectedNodeComponent ||
				(nodeId === 'container' && getCurrentContainer()?.resource === 'project/v1')
		}
	] as const)
	const activeContext = $derived(getActiveContext())

	const componentData = $derived(activeContext === 'project' ? getProject() : selectedNodeComponent)
	const title = $derived(componentData?.meta?.name ?? 'Project')
	const desc = $derived(
		'intention' in (componentData?.meta ?? {}) ? (componentData?.meta?.intention ?? '') : ''
	)
	$inspect(componentData)

	function buildAction() {
		if (!componentData) return
		const msg = getUserMessage()
		msg.data.content[0].text = `build action`
		msg.data.context = {
			[`@${componentData.meta.name}`]: {
				component_id: componentData.id
			}
		}

		if (!chat.socket) {
			toast.error('Could not start building action')
			return
		}

		chat.socket.send(JSON.stringify(msg))

		inProgressComponents.add(componentData.id as string)
		// switch to the code editor tab
		toggleOpenPanelItem('codeEditor')
	}

	let isEditingName = $state(false)
	let newName = $state(componentData?.meta.name ?? '')

	const onEditStart = (el: HTMLInputElement) => {
		el.focus()
		el.select()
	}
	const saveName = async () => {
		const name = newName.trim()

		if (!name) return toast.error('Name cannot be empty')

		componentData.meta.name = name

		if (isProject(componentData)) await saveProject(componentData)
		else {
			await updateComponent(componentData)
			updateLocalComponent(componentData)
		}

		isEditingName = false
	}
</script>

<div
	class="border-b-main-800 bg-main-950 sticky top-0 z-20 grid grid-rows-[auto_1fr] border-b pe-5"
>
	<div class="border-main-800 flex flex-row">
		{#each contextToggles as toggle (toggle.id)}
			{@const isActive = activeContext === toggle.id}
			{#if !toggle.disabled}
				<div
					class={[
						'group flex h-12 items-center justify-center',
						'border-main-800 box-content',
						'border-b border-l first:border-t-0 first:border-l-0 nth-last-2:border-r-0',
						'rounded-b first:rounded-bl-none',
						'text-main-300 shrink-0',
						'transition-all',
						isActive ? 'border-b-0 border-l-0 bg-transparent' : 'bg-main-900/80 not-last:border-r'
					]}
				>
					<button
						class={[
							'flex h-full w-full items-center justify-center px-4 transition active:scale-95'
						]}
						onclick={() => setActiveContext(toggle.id)}
					>
						<toggle.icon
							class={[
								'size-6 transition',
								isActive ? 'opacity-100' : 'opacity-50 group-hover:opacity-85',
								toggle.iconClasses
							].join(' ')}
						/>
						<span
							class={[
								'text-sm capitalize transition',
								isActive ? 'text-main-200' : 'text-main-400 group-hover:text-main-300'
							]}
						>
							{toggle.id === 'project' ? 'Project' : nodeType?.label}
						</span>
					</button>
				</div>
			{/if}
		{/each}
		<div class="border-main-800 grow rounded-bl border-b border-l"></div>
	</div>
	<div class="grid grid-cols-[auto_1fr] items-center gap-y-1 py-3 pl-4">
		<!-- {#if Icon}
			<Icon
				class={[
					'row-span-2 mt-1 mb-auto size-6 drop-shadow-[0px_0px_5px]',
					componentData.resource === 'flow/v1'
						? 'text-complement-400 drop-shadow-complement-500'
						: 'text-main-300 drop-shadow-main-300/50'
				]}
			/>
		{/if} -->

		{#if !isEditingName}
			<h2
				class="group col-start-2 flex items-center gap-x-4 truncate text-lg font-semibold"
				ondblclick={() => (isEditingName = true)}
			>
				{title}
				<button
					class="icon-btn hover:text-main-50 mt-0.5 opacity-0 group-hover:opacity-100"
					onclick={() => (isEditingName = true)}
				>
					<EditIcon class="size-5" />
				</button>
			</h2>
		{:else}
			<form onsubmit={saveName} class="flex flex-row items-center gap-x-4">
				<input
					type="text"
					bind:value={newName}
					class="input-text-light -mt-2 ml-1 text-lg font-semibold"
					onblur={saveName}
					use:onEditStart
				/>
				<button class="icon-btn hover:text-main-50 mt-0.5" type="submit">
					<IconCheck class="size-5" />
				</button>
			</form>
		{/if}

		{#if desc}
			<p class="text-main-500 col-span-2 col-start-2 line-clamp-2 text-sm font-medium">{desc}</p>
		{/if}

		<!-- {#if isAction(componentData)}
			<div class="col-start-3 row-span-2 row-start-1">
				<GenerateButton
					label="Build action"
					onClick={buildAction}
					type="build"
					disabled={!componentData?.meta?.intention?.trim().length ||
						inProgressComponents.has(componentData?.id)}
					loading={inProgressComponents.has(componentData?.id)}
				/>
			</div>
		{/if} -->
	</div>
</div>

{#if componentData}
	{@render panelItems?.(PanelItems)}
{/if}
