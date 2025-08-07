<script lang="ts">
	import { saveDraft } from '$lib/actions/drafts'
	import InputField from '$lib/components/atoms/InputField.svelte'
	import TextField from '$lib/components/atoms/TextField.svelte'
	import Button from '$lib/components/atoms/Button.svelte'
	import { toast } from 'svelte-sonner'
	import { debounce } from '$lib/utils/debounce'
	import { API } from '$lib/api'
	import PanelItem from '../PanelItem.svelte'
	import IconMagic from '~icons/material-symbols/magic-button'
	import { confirmStore } from '$lib/stores/confirm.svelte'
	import { source } from 'sveltekit-sse'
	import {
		inProgressComponents,
		type TaskCreated,
		type ActionBuildCompleted,
		type ActionBuildStarted,
		type ActionBuildProgress
	} from '$lib/stores/builder.svelte'
	import { isAction } from '$lib/schemas'
	import { openPanelItems, toggleOpenPanelItem } from '$lib/stores/panel.svelte'
	import type { z } from 'zod'
	import type { resolvedComponentModel } from '$lib/schemas'

	const { componentData }: { componentData: z.infer<typeof resolvedComponentModel> } = $props()

	const dataIsDirty = false // FIXME

	const isBuilding = $derived(componentData.id in inProgressComponents)

	const nodeType = $derived(isAction(componentData) ? 'action' : 'flow')

	// TODO: perhaps move this to the builder store, or some util function, but this will
	// be moved soon either way when we transition to a global chat interface
	const buildComponent = async (e: Event) => {
		e.preventDefault()
		// currently we only allow building actions
		// this should never happen (for now) cause the button is disabled if the node is not an action
		if (!isAction(componentData)) return toast.error('Only actions can be built right now')
		// Make sure all the metadata is filled out
		const missingFields = []
		if (!componentData.meta.name) missingFields.push('name')
		if (!componentData.meta.intention) missingFields.push('intention')
		if (missingFields.length)
			return toast.error(`Missing required fields: ${missingFields.join(', ')}`)

		const confirmed = await confirmStore.show({
			title: 'This will overwrite your current component',
			message: isAction(componentData)
				? 'Any code written in the action will be overwritten by the new component. Are you sure?'
				: 'Any flows created within this flow will be overwritten by new components. Are you sure?'
		})

		if (!confirmed) return

		// make sure the code tab is open

		if (!openPanelItems[nodeType].includes('Code')) {
			toggleOpenPanelItem(nodeType, 'Code')
		}

		const componentId = componentData.id
		// clone the component so we can modify it without affecting the original
		const component = structuredClone($state.snapshot(componentData))
		inProgressComponents[componentId] = {
			component,
			message: 'Queuing build...'
		}

		let stream
		try {
			stream = source(`/api/components/${componentId}/build`, {
				options: {
					body: JSON.stringify({
						payload: {
							component: {
								resource: componentData.resource,
								meta: componentData.meta,
								spec: {
									source: '',
									readme: ''
								}
							},
							static_analysis: false,
							review: false,
							component_type: 'action'
						}
					}),
					method: 'POST',
					credentials: 'include',
					headers: {
						'Content-Type': 'application/json'
					}
				},
				error: err => {
					throw err
				},
				cache: false
			})
		} catch (error) {
			console.error('Failed to build component', error)
			toast.error('Failed to build component')
			return
		}

		inProgressComponents[componentId] = {
			component: componentData,
			message: 'Build queued...'
		}

		const eventHandlers = {
			'task:created': (payload: TaskCreated) => {
				inProgressComponents[componentId].message = 'Started building...'
			},
			'action:build:started': (payload: ActionBuildStarted) => {
				inProgressComponents[componentId].message = 'Started building action...'
			},
			'action:build:progress': (payload: ActionBuildProgress) => {
				if (payload.agent_message) inProgressComponents[componentId].message = payload.agent_message
				const comp = inProgressComponents[componentId].component
				if (payload.details.code)
					Object.assign(comp, {
						spec: {
							...comp.spec,
							source: payload.details.code
						}
					})
				else if (payload.sub_step === 'install_packages' && payload.details.packages) {
					Object.assign(comp, {
						spec: {
							...comp.spec,
							requirements: payload.details.packages
						}
					})
					inProgressComponents[componentId].message =
						`Installing packages: ${payload.details.packages.split('\n').join(', ').trim()}`
				}
			},
			'action:build:completed': (payload: ActionBuildCompleted) => {
				inProgressComponents[componentId].message = 'Finished building action'
				const comp = payload.details.result[0]
				Object.assign(inProgressComponents[componentId].component, {
					spec: comp.spec
				})
				console.log(
					'finished',
					$state.snapshot(inProgressComponents[componentId].component),
					comp.spec
				)
			}
		}
		// where the data isnt parsed
		const rawEventHandlers = {
			error: (payload: string) => {
				console.error('Could not build component', payload)
				delete inProgressComponents[componentId]
				toast.error('Failed building component')
			},
			close: () => {
				setTimeout(() => {
					delete inProgressComponents[componentId]
					toast.success('Component built successfully!')
				}, 500)
			}
		}

		for (const [event, handler] of Object.entries(eventHandlers))
			stream.select(event).subscribe((payload: string) => {
				if (!payload) return
				try {
					handler(JSON.parse(payload))
				} catch (e) {
					console.error('Failed to parse payload', e)
					toast.error(`Encountered malformed event`)
					return
				}
			})
		for (const [event, handler] of Object.entries(rawEventHandlers))
			stream.select(event).subscribe((payload: string) => payload && handler(payload))
	}

	const debouncedSaveDraft = debounce(() => {}, 500) // FIXME
</script>

<!-- {#if draftData}
	<p>{JSON.stringify(draftData.meta)}</p>
{/if}
<p>---</p>
{#if componentData}
	<p>{JSON.stringify(componentData.meta)}</p>
{/if} -->

{#if componentData}
	<PanelItem {componentData} title="Metadata" isDirty={dataIsDirty}>
		<form class="grid grid-cols-2 gap-3" onsubmit={buildComponent}>
			<InputField
				containerClass="col-span-2"
				required
				label="Name"
				name="name"
				oninput={debouncedSaveDraft}
				bind:value={componentData.meta.name}
			/>

			<TextField
				rows={3}
				class="col-span-2"
				label="Intention"
				name="intention"
				oninput={debouncedSaveDraft}
				bind:value={componentData.meta.intention}
			/>

			<div class="col-span-2 mt-2 flex">
				<div class="ms-auto flex flex-row justify-end gap-x-4">
					{#if isAction(componentData)}
						<Button variation="primary" type="submit" isLoading={isBuilding}>
							{#snippet icon()}
								<IconMagic />
							{/snippet}
							{#snippet body()}
								Build
							{/snippet}
						</Button>
					{/if}
				</div>
			</div>
		</form>
	</PanelItem>
{/if}
