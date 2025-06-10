<script lang="ts">
	import { type Component } from '$lib/types/agent'
	import EarthIcon from '~icons/mdi/earth'
	import AlarmIcon from '~icons/material-symbols/alarm-rounded'
	import IconDelete from '~icons/material-symbols/delete-rounded'
	import IconSettings from '~icons/material-symbols/settings-rounded'
	import Dialog from './Dialog.svelte'
	import type { Cron, Trigger } from '$lib/types/project'
	import { API } from '$lib/api'
	import { toast } from 'svelte-sonner'
	import { invalidate } from '$app/navigation'
	import { confirmStore } from '$lib/stores/confirm.svelte'

	const api = new API()

	let {
		componentData,
		trigger
	}: {
		componentData: Component
		trigger: Trigger
	} = $props()

	let dialog = $state<HTMLDialogElement>()
	let data = $state<Trigger>()

	const actions = $state([
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

				// await api.delete(`modifiers/${trigger.meta.id}`)
				// toast.success('Trigger removed')

				// to delete a trigger (before they're modifiers) we just need to set the
				// component_id to some uuid that doesn't exist
				// DISCLAIMER: this is genuinely the most brain-dead thing in this codebase
				// but it's temporary, and I 100% blame christoffer for it :)
				trigger.spec.component_id = '00000000-0000-0000-0000-000000000000'
				await api.put(`components/${trigger.meta.id}`, trigger)
				toast.success('Trigger removed')

				await invalidate('project')
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

<Dialog bind:dialog {data} {componentData} />
<div
	class={[
		'flex flex-row items-start justify-between',
		'border-main-700 bg-main-850 rounded-md border px-4 py-3'
	]}
>
	<div class="flex flex-row gap-3">
		<div class="text-main-400 mt-1">
			{#if trigger.resource === 'endpoint/v1'}
				<EarthIcon class="size-6" />
			{:else}
				<AlarmIcon class="size-6" />
			{/if}
		</div>
		<div class="flex flex-col text-sm">
			<h4 class="text-main-200 font-semibold">
				{trigger.meta.name}
			</h4>
			<span class={['text-main-400', trigger.resource === 'cron/v1' && 'font-mono']}>
				{trigger.resource === 'endpoint/v1'
					? `https://api.tricore.dev/v1/endpoints/${trigger.meta.id}`
					: (trigger as Cron).spec.schedule}
			</span>
		</div>
	</div>
	<div class="flex flex-row gap-2">
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
