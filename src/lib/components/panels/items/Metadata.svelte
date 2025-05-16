<script lang="ts">
	import InputField from '$lib/components/atoms/InputField.svelte'
	import TextField from '$lib/components/atoms/TextField.svelte'
	import Button from '$lib/components/atoms/Button.svelte'
	import type { Action } from '$lib/types/agent'
	import { toast } from 'svelte-sonner'
	import { selected, nodes, setIsDirty } from '$lib/stores/canvas.svelte'
	import { onDestroy } from 'svelte'
	import compare from 'just-compare'
	import { clone } from '$lib/utils/clone'
	import { API } from '$lib/api'
	import PanelItem from '../PanelItem.svelte'
	import IconMagic from '~icons/material-symbols/magic-button'
	import { confirmStore } from '$lib/stores/confirm.svelte'
	import { source } from 'sveltekit-sse'
	import {
		inProgressComponents,
		type TaskCreated,
		type CodeInstallPackagesStarted,
		type CodeInstallPackagesCompleted,
		type CodeEditStarted,
		type CodeEditCompleted,
		type CodeDocumentStarted,
		type CodeDocumentCompleted
	} from '$lib/stores/builder.svelte'
	import { toggleOpenPanelItem, isAction } from '$lib/stores/canvas.svelte'
	const api = new API()

	const nodeId = selected.node?.id
	const node = $derived(nodes[nodeId])

	interface FormData {
		name: string
		intention: {
			purpose: string
			input: string
			output: string
		}
	}

	let initialData = $state<FormData>()!
	let formData = $state<FormData>()!

	const dataIsDirty = $derived(selected.isDirty || !compare(formData, initialData))

	function setFormdata() {
		if (!nodeId) return

		const meta = nodes[nodeId].data.trinode.spec.meta

		initialData = {
			name: meta.name,
			intention: (meta.intention as FormData['intention']) ?? {
				purpose: '',
				input: '',
				output: ''
			}
		}

		formData = clone(initialData)
	}

	setFormdata()

	function updateNode(isDirty: boolean) {
		if (!nodeId) return
		setIsDirty(nodeId, isDirty)
		const meta = nodes[nodeId].data.trinode.spec.meta
		nodes[nodeId].data.trinode.spec.meta = { ...meta, ...formData }
	}

	onDestroy(() => {
		updateNode(dataIsDirty)
	})

	let isLoading = $state(false)
	const isBuilding = $derived(node.data.trinode.spec.meta.id in inProgressComponents)

	async function onSubmit(e: SubmitEvent) {
		e.preventDefault()

		if (!nodeId) {
			return
		}

		isLoading = true

		const payload = clone(nodes[nodeId].data.trinode.spec)
		payload.meta = { ...payload.meta, ...formData }

		try {
			const result = await api.put<Action>(`components/${payload.meta.id}`, payload)
			toast.success('Metadata successfully updated!')
			updateNode(false)
			initialData = clone(formData)
			console.log(result)
		} catch (error) {
			toast.error('Failed to update metadata')
			console.error(error)
		}

		isLoading = false
	}

	// TODO: perhaps move this to the builder store, or some util function, but this will
	// be moved soon either way when we transition to a global chat interface
	const buildComponent = async () => {
		// currently we only allow building actions
		// this should never happen (for now) cause the button is disabled if the node is not an action
		if (!isAction(node.data.trinode)) return toast.error('Only actions can be built right now')
		// Make sure all the metadata is filled out
		const missingFields = []
		if (!formData.name) missingFields.push('name')
		if (!formData.intention.purpose) missingFields.push('intention')
		if (!formData.intention.input) missingFields.push('input')
		if (!formData.intention.output) missingFields.push('output')
		if (missingFields.length)
			return toast.error(`Missing required fields: ${missingFields.join(', ')}`)

		const confirmed = await confirmStore.show({
			title: 'This will overwrite your current component',
			message:
				node.type === 'action-node'
					? 'Any code written in the action will be overwritten by the new component. Are you sure?'
					: 'Any flows created within this flow will be overwritten by new components. Are you sure?'
		})

		if (!confirmed) return

		// make sure the code tab is open
		if (!selected.openPanelItems.includes('Code')) {
			toggleOpenPanelItem(nodeId, 'Code')
		}

		const componentId = node.data.trinode.spec.meta.id
		// clone the component so we can modify it without affecting the original
		const component = structuredClone($state.snapshot(node.data.trinode.spec))
		inProgressComponents[componentId] = {
			component,
			message: 'Queuing build...'
		}

		let stream
		try {
			stream = source(`/api/components/${node.data.trinode.spec.meta.id}/build`, {
				options: {
					body: JSON.stringify({
						payload: {
							component: {
								resource: node.data.trinode.spec.resource,
								meta: {
									...node.data.trinode.spec.meta,
									...formData
								},
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
			component: node.data.trinode.spec,
			message: 'Build queued...'
		}

		const eventHandlers = {
			'task:created': (payload: TaskCreated) => {
				inProgressComponents[componentId].message = 'Started building...'
			},
			'code:install_packages:started': (payload: CodeInstallPackagesStarted) => {
				inProgressComponents[componentId].message =
					`Installing packages: ${payload.details.requirements.split('\n').join(', ')}`
				Object.assign(inProgressComponents[componentId].component, {
					spec: {
						...inProgressComponents[componentId].component.spec,
						requirements: payload.details.requirements
					}
				})
			},
			'code:install_packages:completed': (payload: CodeInstallPackagesCompleted) => {
				inProgressComponents[componentId].message = 'Packages installed'
			},
			'code:edit:started': (payload: CodeEditStarted) => {
				inProgressComponents[componentId].message = payload.agent_message
			},
			'code:edit:completed': (payload: CodeEditCompleted) => {
				Object.assign(inProgressComponents[componentId].component, {
					spec: {
						...inProgressComponents[componentId].component.spec,
						source: payload.details.code
					}
				})
			},
			'code:document:started': (payload: CodeDocumentStarted) => {
				inProgressComponents[componentId].message = 'Documenting code...'
			},
			'code:document:completed': (payload: CodeDocumentCompleted) => {
				inProgressComponents[componentId].message = 'Finished documenting code'
				Object.assign(inProgressComponents[componentId].component, {
					spec: {
						...inProgressComponents[componentId].component.spec,
						readme: payload.details.description
					}
				})
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
</script>

<PanelItem title="Metadata">
	<form method="POST" class="grid grid-cols-2 gap-3" onsubmit={onSubmit}>
		<InputField
			containerClass="col-span-2"
			required
			label="Name"
			name="name"
			bind:value={formData.name}
		/>

		<TextField
			rows={3}
			class="col-span-2"
			label="Intention"
			name="intention"
			bind:value={formData.intention.purpose}
		/>

		<TextField
			rows={2}
			label="Expected input"
			name="intention"
			bind:value={formData.intention.input}
		/>

		<TextField
			rows={2}
			label="Expected output"
			name="intention"
			bind:value={formData.intention.output}
		/>

		<div class="col-span-2 flex justify-between">
			<p class="text-main-400 text-sm">
				{#if dataIsDirty}
					You have unsaved changes
				{/if}
			</p>

			<div class="flex flex-row justify-end gap-x-4">
				{#if node.type === 'action-node'}
					<Button variation="primary" type="button" onClick={buildComponent} isLoading={isBuilding}>
						{#snippet icon()}
							<IconMagic />
						{/snippet}
						{#snippet body()}
							Build
						{/snippet}
					</Button>
				{/if}

				<Button variation="vibrant" type="submit" class="ms-auto py-2" {isLoading}>
					{#snippet body()}
						Save
					{/snippet}
				</Button>
			</div>
		</div>
	</form>
</PanelItem>
