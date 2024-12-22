<script>
	import { fade, scale } from 'svelte/transition';
	import { onMount } from 'svelte';
	import modal_title_icon from '$lib/icons/Modal_Title_Icon.svg';
	import modal_cross from '$lib/icons/modal_cross.svg';
	import CodeEditor from '../CodeEditor.svelte';
	import ReadMe from '../ReadMe.svelte';
	import Requirement from '../Requirement.svelte';
	import { get } from 'svelte/store';
	import { templateStore, templateID } from '$lib/stores/template';

	export let toggleTemplateModal;

	let TemplateDetails = [];
	let loading = false;
	let TemplateID = get(templateID);

	function loadTemplateDetails() {
		const templates = get(templateStore);
		if (templates.length > 0) {
			// Find the specific template by ID
			TemplateDetails = templates.filter((template) => template.id == TemplateID);
		} else {
			// Fallback in case templates are not available (re-fetch if necessary)
			console.warn('Templates not found in store; you may consider re-fetching if needed.');
		}
	}

	onMount(() => {
		loadTemplateDetails();
		document.body.style.overflow = 'hidden'; // Disable scrolling
	});

	// Variable to keep track of the active tab
	let activeTab = 'Edit Action';

	// Function to set the active tab
	function setActiveTab(tab) {
		activeTab = tab;
	}
</script>

<!-- Background Overlay -->
<div class="fixed inset-0 z-40 bg-black bg-opacity-20 backdrop-blur-lg"></div>

<div class="flex items-center justify-center">
	<div
		class="w-[60rem] bg-website-secondary text-brand-tertiary-gray border border-brand-primary-gray rounded-lg shadow-lg z-50"
		in:scale={{ start: 0.9, duration: 200 }}
		out:fade={{ duration: 150 }}
	>
		<!-- Modal Header -->
		<div class="flex items-center justify-between p-4 border-b border-brand-primary-gray">
			<div class="flex items-center gap-x-3">
				<img src={modal_title_icon} alt="modal_title_icon" class="w-6" />
				{#if TemplateDetails.length > 0}
					<h2 class="text-sm text-white">{TemplateDetails[0].name} Details</h2>
				{:else}
					<h2 class="text-sm text-white">Template Details</h2>
				{/if}
			</div>
			<button type="button" class="cursor-pointer w-9" onclick={toggleTemplateModal}>
				<img src={modal_cross} alt="Close modal" class="w-6" />
			</button>
		</div>

		<!-- Tab Headers -->
		<div class="flex items-center w-full px-4 my-3 text-sm gap-x-5">
			<button
				class="p-1.5 cursor-pointer border-b-white"
				class:border-b-2={activeTab === 'Edit Action'}
				onclick={() => setActiveTab('Edit Action')}
			>
				Code
			</button>
			<button
				class="p-1.5 cursor-pointer border-b-white"
				class:border-b-2={activeTab === 'README.md'}
				onclick={() => setActiveTab('README.md')}
			>
				README.md
			</button>
			<button
				class="p-1.5 cursor-pointer border-b-white"
				class:border-b-2={activeTab === 'Requirements'}
				onclick={() => setActiveTab('Requirements')}
			>
				Requirements
			</button>
		</div>

		<!-- Tab Content -->
		<div class="container px-4">
			{#if TemplateDetails.length === 0}
				<div class="flex items-center justify-center h-96">
					<p class="text-sm text-center text-white">No data available</p>
				</div>
			{:else if loading}
				<div class="flex items-center justify-center h-96">
					<p class="text-sm text-center text-white">Loading...</p>
				</div>
			{:else if activeTab === 'Edit Action'}
				<CodeEditor code={TemplateDetails[0].code} />
			{:else if activeTab === 'README.md'}
				<ReadMe content={TemplateDetails[0].readme} />
			{:else if activeTab === 'Requirements'}
				<Requirement content={TemplateDetails[0].requirements} />
			{:else if activeTab === 'Folder Structure'}
				<h2>Folder Structure</h2>
			{/if}
		</div>
	</div>
</div>

<style>
	.container {
		width: 100%;
		height: 500px;
	}
</style>
