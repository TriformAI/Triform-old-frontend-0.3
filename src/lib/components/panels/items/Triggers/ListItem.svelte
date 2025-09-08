<script lang="ts">
	import type { Component, Cron, Trigger } from '$lib/types/resources'
	import EarthIcon from '~icons/mdi/earth'
	import AlarmIcon from '~icons/material-symbols/alarm-rounded'
	import IconDelete from '~icons/material-symbols/delete-rounded'
	import IconSettings from '~icons/material-symbols/settings-rounded'
	import Dialog from './Dialog.svelte'
	import { API } from '$lib/api'
	import { toast } from 'svelte-sonner'
	import { invalidate } from '$app/navigation'
	import { confirmStore } from '$lib/stores/confirm.svelte'
	import { getProject } from '$lib/stores/canvas.svelte'
	import type { triggerModel } from '$lib/schemas'
	import type * as z from 'zod'
	import { saveProject } from '$lib/actions/project'
	import { clone } from '$lib/utils/clone'
	import IconCopy from '~icons/material-symbols/content-copy-rounded'

	const api = new API()

	let {
		nodeId,
		triggerId,
		trigger
	}: {
		nodeId: string
		triggerId: string
		trigger: z.infer<typeof triggerModel>
	} = $props()

	let dialog = $state<HTMLDialogElement>()
	let data = $state<Trigger>()

	// triggers can only exist on top-level nodes
	const node = $derived(getProject().spec.nodes[nodeId])

	const actions = $state([
		...(trigger.resource === 'endpoint/v1'
			? [
					{
						icon: IconCopy,
						tooltip: 'Copy URL',
						dangerous: false,
						onClick: async () => {
							const url = `https://triform.dev/api/in/${getProject().id}/${triggerId}`
							await navigator.clipboard.writeText(url)
							toast.success('URL copied to clipboard')
						}
					}
				]
			: []),
		{
			icon: IconDelete,
			tooltip: 'Delete',
			dangerous: true,
			onClick: async () => {
				const confirmed = await confirmStore.show({
					title: 'Are you sure?',
					message: 'This will delete the trigger immediately'
				})

				if (!confirmed) return

				const snapshot = clone($state.snapshot(node))

				delete node.triggers[triggerId]

				const res = await saveProject(getProject())

				if (!res.success) {
					toast.error('Failed to delete trigger')
					getProject().spec.nodes[nodeId] = snapshot
				}
			}
		},
		{
			icon: IconSettings,
			tooltip: 'Edit',
			dangerous: false,
			onClick: () => {
				data = trigger
				dialog?.showModal()
			}
		}
	])
</script>

<Dialog bind:dialog {data} {nodeId} {triggerId} />
<div
	class={[
		'flex flex-row items-start justify-between',
		'border-main-700 bg-main-850 rounded-md border px-4 py-3'
	]}
	data-tf-id={`panel-trigger-item`}
>
	<div class="flex min-w-0 flex-1 flex-row gap-3">
		<div class="text-main-400 mt-1 flex-shrink-0">
			{#if trigger.resource === 'endpoint/v1'}
				<EarthIcon class="size-6" />
			{:else}
				<AlarmIcon class="size-6" />
			{/if}
		</div>
		<div class="flex min-w-0 flex-1 flex-col text-sm">
			<h4 class="text-main-200 truncate font-semibold">
				{trigger.meta.name}
			</h4>
			<span class={['text-main-400', trigger.resource === 'cron/v1' && 'font-mono', 'truncate']}>
				{trigger.resource === 'endpoint/v1'
					? `${trigger.spec.method} https://triform.dev/api/in/${getProject().id}/${triggerId}`
					: (trigger as Cron).spec.schedule}
			</span>
		</div>
	</div>
	<div class="flex flex-shrink-0 flex-row gap-2">
		{#each actions as action}
			<button
				type="button"
				onclick={action.onClick}
				class={[
					'text-main-500 transition',
					action.dangerous ? 'hover:text-danger-300' : 'hover:text-main-200'
				]}
				aria-label={action.tooltip}
				data-balloon-pos="up"
				data-balloon-nofocus
			>
				<action.icon class="size-5" />
			</button>
		{/each}
	</div>
</div>
