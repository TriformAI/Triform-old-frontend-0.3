<script lang="ts">
	import { onMount } from 'svelte'
	import { writable } from 'svelte/store'
	import { SvelteFlow, Background } from '@xyflow/svelte'

	import { openWindow, openWindows } from '$lib/stores/windows.svelte'

	import { mainAreaRef, setMainAreaRef } from '$lib/stores/layoutRefs.svelte'
	// 👇 this is important! You need to import the styles for Svelte Flow to work
	import '@xyflow/svelte/dist/style.css'

	import CreateModuleModal from '$lib/components/old-modals/CreateModuleModal.svelte'
	import {
		canvasToolsModal,
		moduleInfoModal,
		shareCanvaModal,
		statusModal,
		thresholdModal,
		createModuleModal,
		attachTemplateModal,
		templateModal,
		templateLibraryModal,
		attachComponentModal,
		accountInformationModal,
		billingInformationModal,
		teamInformationModal
	} from '$lib/stores/modals'
	import StatusModal from '$lib/components/old-modals/StatusModal.svelte'
	import ThresholdAlertModal from '$lib/components/old-modals/ThresholdAlertModal.svelte'
	import AttachTemplate from '$lib/components/old-modals/AttachTemplate.svelte'
	import ModuleInfoModal from '$lib/components/old-modals/ModuleInfoModal.svelte'
	import ActionNode from '$lib/components/custom-nodes/ActionNode.svelte'
	import AgentNode from '$lib/components/custom-nodes/AgentNode.svelte'
	import ApiNode from '$lib/components/custom-nodes/ApiNode.svelte'
	import TemplateDetailsModal from '$lib/components/old-modals/TemplateDetailsModal.svelte'
	import ShareCanvaModal from '$lib/components/old-modals/ShareCanvaModal.svelte'
	import AttachComponent from '$lib/components/old-modals/AttachComponent.svelte'
	import AccountInformationModal from '$lib/components/old-modals/AccountInformationModal.svelte'
	import BillingInformationModal from '$lib/components/old-modals/BillingInformationModal.svelte'
	import TeamInformationModal from '$lib/components/old-modals/TeamInformationModal.svelte'

	import ShareCanvasModal from '$lib/components/modals/ShareCanvas.svelte'

	const toggleAttachComponentModal = () => {
		createModuleModal.update(() => false)
		attachTemplateModal.update(() => false)
		attachComponentModal.update(value => !value)
	}

	const toggleCreateModuleModal = () => {
		attachComponentModal.update(() => false)
		attachTemplateModal.update(() => false)
		createModuleModal.update(value => !value)
	}

	const toggleAttachTemplateModal = () => {
		attachComponentModal.update(() => false)
		createModuleModal.update(() => false)
		attachTemplateModal.update(value => !value)
	}

	const toggleModuleInfoModal = () => {
		attachComponentModal.update(() => false)
		attachTemplateModal.update(() => false)
		moduleInfoModal.update(value => !value)
	}

	const toggleTemplateModal = () => {
		templateLibraryModal.update(() => false)
		templateModal.update(value => !value)
	}

	const toggleShareCanvaModal = () => {
		shareCanvaModal.update(value => !value)
	}

	const toggleAccountInfoModal = () => {
		accountInformationModal.update(value => !value)
	}

	const toggleBillingInfoModal = () => {
		billingInformationModal.update(value => !value)
	}

	const toggleTeamInfoModal = () => {
		teamInformationModal.update(value => !value)
	}

	const nodeTypes = {
		'action-node': ActionNode,
		'agent-node': AgentNode,
		'api-node': ApiNode
	}

	// We are using writables for the nodes and edges to sync them easily. When a user drags a node for example, Svelte Flow updates its position.
	const nodes = writable([
		{
			id: '1',
			type: 'api-node',
			position: { x: 80, y: 0 },
			data: {
				name: 'API Node A',
				mode: 'running'
			}
		},
		{
			id: '2',
			type: 'agent-node',
			position: { x: 0, y: 120 },
			data: {
				name: 'Agent Node A',
				mode: 'error'
			}
		},
		{
			id: '3',
			type: 'action-node',
			position: { x: 80, y: 250 },
			data: {
				name: 'Action Node A',
				mode: 'success'
			}
		},
		{
			id: '4',
			type: 'api-node',
			position: { x: 300, y: 0 },
			data: {
				name: 'API Node B',
				mode: 'success'
			}
		},
		{
			id: '5',
			type: 'agent-node',
			position: { x: 230, y: 120 },
			data: {
				name: 'Agent Node B',
				mode: 'running'
			}
		},
		{
			id: '6',
			type: 'action-node',
			position: { x: 300, y: 250 },
			data: {
				name: 'Action Node B',
				mode: 'error'
			}
		}
	])

	// same for edges
	const edges = writable([
		{
			id: '1-2',
			type: 'default',
			source: '1',
			target: '2',
			animated: true
		},
		{
			id: '2-3',
			type: 'default',
			source: '2',
			target: '3',
			animated: true
		},
		{
			id: '4-5',
			type: 'default',
			source: '4',
			target: '5',
			animated: true
		},
		{
			id: '5-6',
			type: 'default',
			source: '5',
			target: '6',
			animated: true
		},

		{
			id: '5-3',
			type: 'default',
			source: '5',
			target: '3',
			animated: true
		}
	])

	const snapGrid: [number, number] = [1, 1]

	const proOptions = { hideAttribution: true }

	const defaultEdgeOptions = {
		animated: true // Ensures all edges are animated
	}
	let instance: HTMLElement
	onMount(() => {
		setMainAreaRef(instance)
	})
</script>

<section class="h-[calc(100vh-156.1px)] relative" bind:this={instance}>
	{#each openWindows() as window}
		{@const {
			component: Component,
			customProps,
			...defaultProps
		} = window}
		<Component
			{...defaultProps}
			{customProps}
		/>
	{/each}

	<ShareCanvasModal />

	{#if $statusModal}
		<StatusModal />
	{/if}
	{#if $thresholdModal}
		<ThresholdAlertModal />
	{/if}
	{#if $attachComponentModal}
		<AttachComponent
			{toggleAttachTemplateModal}
			{toggleCreateModuleModal}
			{toggleAttachComponentModal}
		/>
	{/if}
	{#if $createModuleModal}
		<CreateModuleModal
			{toggleCreateModuleModal}
			{toggleAttachTemplateModal}
			{toggleAttachComponentModal}
		/>
	{/if}
	{#if $attachTemplateModal}
		<AttachTemplate {toggleAttachTemplateModal} {toggleCreateModuleModal} {toggleModuleInfoModal} />
	{/if}
	{#if $moduleInfoModal}
		<ModuleInfoModal {toggleModuleInfoModal} />
	{/if}
	{#if $templateModal}
		<TemplateDetailsModal {toggleTemplateModal} />
	{/if}
	{#if $shareCanvaModal}
		<ShareCanvaModal {toggleShareCanvaModal} />
	{/if}
	{#if $accountInformationModal}
		<AccountInformationModal {toggleAccountInfoModal} />
	{/if}
	{#if $billingInformationModal}
		<BillingInformationModal {toggleBillingInfoModal} />
	{/if}
	{#if $teamInformationModal}
		<TeamInformationModal {toggleTeamInfoModal} />
	{/if}
	<SvelteFlow {nodes} {edges} {nodeTypes} fitView {snapGrid} {proOptions} {defaultEdgeOptions}>
		<Background bgColor="#181819" patternColor="#1D1E20" variant="lines" gap={20} size={1} />
	</SvelteFlow>
</section>
