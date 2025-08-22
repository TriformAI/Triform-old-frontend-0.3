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
	import { getCurrentContainer, getProject, getVisibleComponent } from '$lib/stores/canvas.svelte'
	import type * as z from 'zod'
	import type { triggerModel } from '$lib/schemas'
	import { validateJSONPath } from '$lib/utils/validateJSONPath'
	import EndpointTrigger from './EndpointTrigger.svelte'
	import CronTrigger from './CronTrigger.svelte'
	import { saveProject } from '$lib/actions/project'
	import { clone } from '$lib/utils/clone'

	let {
		dialog = $bindable(),
		data: sourceData,
		nodeId,
		triggerId: sourceTriggerId
	}: {
		dialog: HTMLDialogElement | undefined
		data?: z.infer<typeof triggerModel>
		nodeId: string
		triggerId?: string
	} = $props()

	// triggers can only exist on top-level nodes
	const node = $derived(getProject()?.spec.nodes[nodeId])
	const componentData = $derived(node?.spec)

	const tabs = [
		{
			key: 'endpoint',
			label: 'Endpoint',
			icon: EarthIcon
		}
		// Cron tab disabled for now - we only support endpoints
		// {
		// 	key: 'cron',
		// 	label: 'Scheduled',
		// 	icon: AlarmIcon
		// }
	]

	let activeTab = $state(0)
	let payload = $state('')
	let name = $state('')
	let isCreating = $state(false)
	let hasCronErrors = $state(false)
	let hasJsonErrors = $state(false)
	let isNew = $state(false)
	let data = $state<Trigger>()
	let triggerId = $state('')

	const hasErrors = $derived.by(() => {
		// for endpoints the json paths need to be valid
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

	// Helper function to create default payload mapping for endpoint triggers
	const createDefaultPayloadMapping = (existingMapping: Record<string, string> = {}) => {
		let inputs: Record<string, unknown> = {}

		// Different component types have inputs in different places
		if (componentData?.spec) {
			if ('inputs' in componentData.spec) {
				inputs = (componentData.spec as any).inputs || {}
			}
		}

		const mapping: Record<string, string> = { ...existingMapping }
		for (const inputKey of Object.keys(inputs)) {
			// Only add default mapping if one doesn't already exist
			if (!(inputKey in mapping)) {
				mapping[inputKey] = `$.${inputKey}`
			}
		}
		return mapping
	}

	// Use activeTab as single source of truth - derive trigger from it
	const trigger = $derived.by(() => {
		if (!componentData?.id) return undefined

		if (activeTab === 0) {
			// Endpoint trigger
			return {
				resource: 'endpoint/v1' as const,
				meta: {
					name: name || ''
				},
				spec: {
					method: 'POST' as const,
					payload_mapping: createDefaultPayloadMapping(
						data?.resource === 'endpoint/v1' ? (data as any).spec.payload_mapping || {} : {}
					),
					ingress_tokens:
						data?.resource === 'endpoint/v1' ? (data as any).spec.ingress_tokens || [] : []
				}
			}
		} else {
			// Cron trigger - build schedule from cronFields
			const schedule = Object.values(cronFields).join(' ')
			const parsedPayload = (() => {
				if (!payload) return {}
				try {
					return JSON.parse(payload)
				} catch {
					return {}
				}
			})()

			return {
				resource: 'cron/v1' as const,
				meta: {
					name: name || ''
				},
				spec: {
					schedule: schedule || '0 0 * * *',
					timezone: data?.resource === 'cron/v1' ? (data as any).spec.timezone || 'UTC' : 'UTC',
					payload: parsedPayload
				}
			}
		}
	})

	const handleSubmit = async (e: SubmitEvent) => {
		e.preventDefault()

		if (!trigger) return toast.error('No trigger data')
		if (!node) return toast.error('No node found')
		if (!triggerId) return toast.error('No trigger ID')

		if (hasCronErrors && activeTab === 1) return toast.error('Invalid cron expression')

		if (activeTab === 0) {
			// Validate all JSON paths in payload_mapping
			for (const [key, path] of Object.entries(trigger.spec.payload_mapping || {})) {
				const { success, error } = validateJSONPath(String(path))
				if (!success) {
					console.error('failed to validate json path', error)
					return toast.error(`Invalid JSON path for ${key}: ${error}`)
				}
			}
		}

		isCreating = true

		// Create snapshot of the node before making changes for rollback
		const snapshot = clone($state.snapshot(node))

		try {
			// Initialize triggers object if it doesn't exist
			if (!node.triggers) {
				node.triggers = {}
			}

			// Update node.triggers[triggerId] with the new trigger data
			node.triggers[triggerId] = trigger

			// Save the project
			const res = await saveProject(getProject())

			if (!res.success) {
				// Revert the node to its previous state using snapshot
				getProject().spec.nodes[nodeId] = snapshot
				toast.error('Failed to save trigger')
				return
			}

			toast.success(isNew ? 'Trigger created successfully' : 'Trigger updated successfully')
			dialog?.close()
		} catch (e) {
			// Revert the node to its previous state using snapshot
			getProject().spec.nodes[nodeId] = snapshot
			console.error('Failed to save trigger:', e)
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

		// Set triggerId - use existing one or generate new one for new triggers
		triggerId = sourceTriggerId || (isNew ? crypto.randomUUID() : '')

		// Always default to endpoint (tab 0) since we only support endpoints now
		activeTab = 0
		name = data?.meta?.name || ''

		if (data?.resource === 'cron/v1') {
			let unparsedPayload = (data as any).spec.payload
			payload =
				typeof unparsedPayload === 'string'
					? unparsedPayload
					: JSON.stringify(unparsedPayload, null, 2)
			const [minute, hour, day, month, weekday] = (
				(data as any).spec.schedule || '0 0 * * *'
			).split(' ')
			cronFields = {
				minute: minute || '',
				hour: hour || '',
				day: day || '',
				month: month || '',
				weekday: weekday || ''
			}
		} else {
			// Reset cron fields for endpoint triggers
			cronFields = {
				minute: '',
				hour: '',
				day: '',
				month: '',
				weekday: ''
			}
			payload = ''
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

				{#if tabs.length > 1}
					<Tabs {tabs} bind:activeTab />
				{/if}

				<div class="mx-2 flex flex-col gap-y-6 [&_h4]:mb-3">
					{#if activeTab === 0}
						<EndpointTrigger {trigger} {componentData} {dialog} />
					{:else if activeTab === 1}
						<CronTrigger
							{trigger}
							bind:cronFields
							bind:payload
							bind:hasCronErrors
							bind:hasJsonErrors
						/>
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
