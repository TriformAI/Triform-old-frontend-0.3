<script lang="ts">
	import { type Component as SvelteComponent, type Snippet } from 'svelte'
	import PanelItems from './PanelItems.svelte'
	import { getVisibleComponent } from '$lib/stores/canvas.svelte'

	import { isAction } from '$lib/schemas'
	import GenerateButton from '../atoms/GenerateButton.svelte'
	import { getUserMessage, chat } from '$lib/components/Chat/chatStore.svelte'
	import { toast } from 'svelte-sonner'

	interface Props {
		nodeId: string
		Icon?: SvelteComponent
		panelItems: Snippet<[typeof PanelItems]>
	}

	const { nodeId, Icon, panelItems }: Props = $props()

	const componentData = $derived(getVisibleComponent(nodeId))
	const title = $derived(componentData?.meta?.name ?? 'Project')
	const desc = $derived(
		'intention' in componentData?.meta ? (componentData?.meta?.intention ?? '') : ''
	)

	function buildAction() {
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
	}
</script>

<div class="border-b-main-800 bg-main-950 sticky top-0 z-20 grid border-b p-3 py-5 pe-5">
	<div class="grid grid-cols-[auto_1fr_auto] items-end gap-x-4">
		{#if Icon}
			<Icon
				class={[
					'row-span-2 mt-1 mb-auto size-6 drop-shadow-[0px_0px_5px]',
					componentData.resource === 'flow/v1'
						? 'text-complement-400 drop-shadow-complement-500'
						: 'text-main-300 drop-shadow-main-300/50'
				]}
			/>
		{/if}

		<h2 class="col-start-2 truncate text-lg font-semibold">
			{title}
		</h2>

		{#if desc}
			<p class="text-main-500 col-start-2 line-clamp-2 text-sm font-medium">{desc}</p>
		{/if}

		{#if isAction(componentData)}
			<div class="col-start-3 row-span-2 row-start-1">
				<GenerateButton label="Build action" onClick={buildAction} />
			</div>
		{/if}
	</div>
</div>

{#if componentData}
	{@render panelItems?.(PanelItems)}
{/if}
