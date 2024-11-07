<script>
	import { writable } from 'svelte/store';
	import { SvelteFlow, Controls, Background, BackgroundVariant, MiniMap } from '@xyflow/svelte';

	// 👇 this is important! You need to import the styles for Svelte Flow to work
	import '@xyflow/svelte/dist/style.css';

	import Button from '$lib/components/Button.svelte';
	import Add from '$lib/icons/add.svg';

	import {
		canvasToolsModal,
		moduleInfoModal,
		statusModal,
		thresholdModal
	} from '$lib/stores/modals';

	import CanvasToolsModal from '$lib/components/modals/CanvasToolsModal.svelte';
	import CreateModuleModal from '$lib/components/modals/CreateModuleModal.svelte';
	import { createModuleModal, attachTemplateModal } from '$lib/stores/modals';
	import StatusModal from '$lib/components/modals/StatusModal.svelte';
	import ThresholdAlertModal from '$lib/components/modals/ThresholdAlertModal.svelte';
	import AttachTemplate from '$lib/components/modals/AttachTemplate.svelte';
	import ModuleInfoModal from '$lib/components/modals/ModuleInfoModal.svelte';
	import ActionNode from '$lib/components/custom-nodes/ActionNode.svelte';
	import AgentNode from '$lib/components/custom-nodes/AgentNode.svelte';
	import ApiNode from '$lib/components/custom-nodes/ApiNode.svelte';

	const toggleCreateModuleModal = () => {
		attachTemplateModal.update((value) => false);
		createModuleModal.update((value) => !value);
	};

	const toggleAttachTemplateModal = () => {
		createModuleModal.update((value) => false);
		attachTemplateModal.update((value) => !value);
	};

	const toggleModuleInfoModal = () => {
		attachTemplateModal.update((value) => false);
		moduleInfoModal.update((value) => !value);
	};

	const nodeTypes = {
		'action-node': ActionNode,
		'agent-node': AgentNode,
		'api-node': ApiNode
	};

	// We are using writables for the nodes and edges to sync them easily. When a user drags a node for example, Svelte Flow updates its position.
	const nodes = writable([
		{
			id: '1',
			type: 'api-node',
			position: { x: 80, y: 0 },
			data: {
				name: 'API Node A'
			}
		},
		{
			id: '2',
			type: 'agent-node',
			position: { x: 0, y: 120 },
			data: {
				name: 'Agent Node A'
			}
		},
		{
			id: '3',
			type: 'action-node',
			position: { x: 80, y: 250 },
			data: {
				name: 'Action Node A'
			}
		},
		{
			id: '4',
			type: 'api-node',
			position: { x: 300, y: 0 },
			data: {
				name: 'API Node B'
			}
		},
		{
			id: '5',
			type: 'agent-node',
			position: { x: 230, y: 120 },
			data: {
				name: 'Agent Node B'
			}
		},
		{
			id: '6',
			type: 'action-node',
			position: { x: 300, y: 250 },
			data: {
				name: 'Action Node B'
			}
		}
	]);

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
	]);

	const snapGrid = [1, 1];

	const proOptions = { hideAttribution: true };
</script>

<!-- <section
	class={`flex flex-col justify-center items-center bg-website-dark-primary text-brand-white min-h-[calc(100vh-16.4rem)]`}
>
	{#if $canvasToolsModal}
		<CanvasToolsModal />
	{/if}
	{#if $statusModal}
		<StatusModal />
	{/if}
	{#if $thresholdModal}
		<ThresholdAlertModal />
	{/if}
	{#if $createModuleModal}
		<CreateModuleModal {toggleCreateModuleModal} {toggleAttachTemplateModal} />
	{/if}
	{#if $attachTemplateModal}
		<AttachTemplate {toggleAttachTemplateModal} {toggleCreateModuleModal} {toggleModuleInfoModal} />
	{/if}
	{#if $moduleInfoModal}
		<ModuleInfoModal {toggleAttachTemplateModal} {toggleModuleInfoModal} />
	{/if} -->

<!-- <div class="relative flex flex-col items-center max-w-xl my-auto top-32">
		<h2
			class={`text-2xl leading-normal text-center text-brand-light-gray ${($statusModal || $thresholdModal) && 'hidden'}`}
		>
			Right-click to Create Action/Agent/API or Drag from Toolbox
		</h2>
	</div> -->

<!-- This div will push the buttons to the bottom -->
<!-- <div class="flex items-center justify-center pb-10 mt-auto gap-x-6">
		<Button content={{ icon: Add, text: 'New Action' }} on:click={toggleCreateModuleModal} />
		<Button content={{ icon: Add, text: 'New API' }} />
		<Button content={{ icon: Add, text: 'New Agent' }} />
	</div> -->
<!-- </section> -->
<section class="h-[calc(100vh-16.4rem)]">
	{#if $canvasToolsModal}
		<CanvasToolsModal />
	{/if}
	{#if $statusModal}
		<StatusModal />
	{/if}
	{#if $thresholdModal}
		<ThresholdAlertModal />
	{/if}
	{#if $createModuleModal}
		<CreateModuleModal {toggleCreateModuleModal} {toggleAttachTemplateModal} />
	{/if}
	{#if $attachTemplateModal}
		<AttachTemplate {toggleAttachTemplateModal} {toggleCreateModuleModal} {toggleModuleInfoModal} />
	{/if}
	{#if $moduleInfoModal}
		<ModuleInfoModal {toggleAttachTemplateModal} {toggleModuleInfoModal} />
	{/if}
	<SvelteFlow {nodes} {edges} {nodeTypes} fitView {snapGrid} {proOptions}>
		<Background bgColor="#181819" patternColor="#1D1E20" variant="lines" gap={20} size={1} />
	</SvelteFlow>
</section>
