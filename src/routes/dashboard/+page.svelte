<script>
	import Button from '$lib/components/Button.svelte';
	import Add from '$lib/icons/add.svg';

	import { canvasToolsModal, statusModal, thresholdModal } from '$lib/stores/modals';

	import CanvasToolsModal from '$lib/components/modals/CanvasToolsModal.svelte';
	import CreateModuleModal from '$lib/components/modals/CreateModuleModal.svelte';
	import { createModuleModal } from '$lib/stores/modals';
	import StatusModal from '$lib/components/modals/StatusModal.svelte';
	import ThresholdAlertModal from '$lib/components/modals/ThresholdAlertModal.svelte';

	const toggleCreateModuleModal = () => {
		createModuleModal.update((value) => !value);
	};
</script>



<section
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
		<CreateModuleModal {createModuleModal} {toggleCreateModuleModal} />
	{/if}

	<!-- This div centers the h2 element vertically -->
	<div class="relative flex flex-col items-center max-w-xl my-auto top-32">
		<h2 class="text-2xl text-brand-light-gray leading-normal text-center">
			Right-click to Create Module/Agent/API or Drag from Toolbox
		</h2>
	</div>

	<!-- This div will push the buttons to the bottom -->
	<div class="flex items-center justify-center pb-10 mt-auto gap-x-6">
		<Button content={{ icon: Add, text: 'New Module' }} on:click={toggleCreateModuleModal} />
		<Button content={{ icon: Add, text: 'New API' }} />
		<Button content={{ icon: Add, text: 'New Agent' }} />
	</div>
</section>
