<script lang="ts">
	import Button from '$lib/components/atoms/Button.svelte'
	import InputField from '$lib/components/atoms/InputField.svelte'
	import IconVariable from '~icons/mdi/key'
	import Dialog from '$lib/components/common/Dialog.svelte'
	import { toast } from 'svelte-sonner'
	import { API } from '$lib/api'
	import { invalidate } from '$app/navigation'
	import Tabs from '$lib/components/atoms/Tabs.svelte'
	import CronInput from './CronInput.svelte'
	import EarthIcon from '~icons/mdi/earth'
	import AlarmIcon from '~icons/material-symbols/alarm-rounded'
	import Payload from '../common/Payload.svelte'
	import type { Cron, Trigger, Modifier } from '$lib/types/resources'
	import type { Component } from '$lib/types/resources'
	import { sleep } from '$lib/utils/sleep'

	interface Props {
		dialog: HTMLDialogElement | undefined
		data?: Trigger
		componentData: Component
	}

	let { dialog = $bindable(), data: sourceData, componentData }: Props = $props()

	const tabs = [
		{
			key: 'endpoint',
			label: 'Endpoint',
			icon: EarthIcon
		},
		{
			key: 'cron',
			label: 'Scheduled',
			icon: AlarmIcon
		}
	]

	let activeTab = $state(0)
	let payload = $state('')
	let name = $state('')
	let isCreating = $state(false)
	let hasCronErrors = $state(false)
	let hasJsonErrors = $state(false)
	let isNew = $state(false)
	let data = $state<Trigger>()

	const hasErrors = $derived.by(() => {
		// no validation if it's an endpoint
		if (activeTab === 0) return false

		// crons need both valid cron syntax and valid payload
		return hasCronErrors || hasJsonErrors || !payload
	})

	let cronFields = $state({
		minute: '',
		hour: '',
		day: '',
		month: '',
		weekday: ''
	})

	const handleSubmit = async (e: SubmitEvent) => {
		e.preventDefault()
		const resource = `${tabs[activeTab].key === 'endpoint' ? 'endpoint' : 'cron'}/v1`

		if (hasCronErrors && resource === 'cron/v1') return toast.error('Invalid cron expression')

		const api = new API()
		const currTab = tabs[activeTab]
		isCreating = true

		const spec =
			currTab.key === 'endpoint'
				? {}
				: {
						schedule: Object.values(cronFields).join(' '),
						input: JSON.parse(payload)
					}

		const body = {
			resource,
			meta: {
				...data?.meta,
				name,
				id: data?.id ?? crypto.randomUUID()
			},
			spec: {
				component_id: componentData.id,
				...spec
			}
		}

		try {
			if (isNew) {
				await api.post<Modifier>('components', body)
			} else {
				await api.put<Modifier>(`components/${data?.id}`, body)
			}
			await sleep(150)
			await invalidate('project')
			dialog?.close()
		} catch (e) {
			toast.error('Failed to save trigger')
		} finally {
			isCreating = false
		}
	}

	// update the loaded data whenever the dialog is opened
	const loadData = () => {
		data = sourceData
		// if it's a brand new trigger, default to endpoint
		isNew = !data
		if (!data) {
			data = {
				resource: 'endpoint/v1',
				meta: {
					id: crypto.randomUUID(),
					name: ''
				},
				spec: {
					component_id: componentData.id
				}
			}
		}
		activeTab = data.resource === 'endpoint/v1' ? 0 : 1
		name = 'meta' in data ? (data.meta.name as string) : ''
		if (data.resource === 'cron/v1') {
			let unparsedPayload = (data as Cron).spec.input
			payload =
				typeof unparsedPayload === 'string'
					? unparsedPayload
					: JSON.stringify(unparsedPayload, null, 2)
			const [minute, hour, day, month, weekday] = (data as Cron).spec.schedule.split(' ')
			cronFields = {
				minute,
				hour,
				day,
				month,
				weekday
			}
		}
		setTimeout(() => {
			dialog?.querySelector<HTMLInputElement>('input[name="name"]')?.focus()
		})
	}
</script>

<Dialog appearance="right" bind:dialog onOpen={loadData}>
	<div class="grid grid-rows-[auto_1fr]">
		<div class="mb-8 grid auto-rows-min grid-cols-[auto_1fr] items-start gap-x-3">
			<IconVariable class="row-span-2 size-8" />
			<h2 class="font-semibold">
				{isNew ? 'Create trigger' : `Edit ${data?.meta.name}`}
			</h2>
			<p class="text-main-400">Triggers are used to start a flow</p>
		</div>

		<form method="POST" class="grid" onsubmit={handleSubmit}>
			<div class="flex flex-col gap-4">
				<InputField name="name" label="Name" containerClass="" bind:value={name} class="mb-2" />

				<Tabs {tabs} bind:activeTab />

				<div class="mx-2 flex flex-col gap-y-4 [&_h4]:mb-3">
					{#if activeTab === 1}
						<div>
							<h4 class="eyebrow">Schedule</h4>
							<CronInput bind:cronFields bind:hasErrors={hasCronErrors} />
						</div>
						<div>
							<h4 class="eyebrow">Payload</h4>
							<Payload usePortal={true} bind:value={payload} bind:hasJsonErrors />
						</div>
					{/if}
				</div>
			</div>

			<div class="mt-auto grid grid-cols-2 gap-4">
				<Button type="button" onClick={() => dialog?.close()}>
					{#snippet body()}
						Cancel
					{/snippet}
				</Button>

				<Button
					variation="vibrant"
					type="submit"
					isLoading={isCreating}
					disabled={hasErrors || !name}
				>
					{#snippet body()}
						Save
					{/snippet}
				</Button>
			</div>
		</form>
	</div>
</Dialog>
