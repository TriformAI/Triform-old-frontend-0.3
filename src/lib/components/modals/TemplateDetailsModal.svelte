<script>
	import { fade, scale } from 'svelte/transition';
	import { onMount } from 'svelte';
	import modal_title_icon from '$lib/icons/Modal_Title_Icon.svg';
	import modal_cross from '$lib/icons/modal_cross.svg';
	import CodeEditor from '../CodeEditor.svelte';
	import ReadMe from '../ReadMe.svelte';
	import Requirement from '../Requirement.svelte';
	import { PUBLIC_API_URL } from '$env/static/public';
	import { getAuthToken } from '$lib/stores/cookie';

	export let toggleModuleInfoModal;

	export let toggleTemplateModal;

	let apiUrl = PUBLIC_API_URL;
	let authToken = getAuthToken();
	let templateID = '';
	let TemplateDetails = [];
	let loading = false;

	async function fetchTemplatesDetails() {
		try {
			loading = true;
			const urlParams = new URLSearchParams(window.location.search);
			templateID = urlParams.get('TID');
			const response = await fetch(`${apiUrl}/api/v1/templates`, {
				method: 'GET',
				headers: {
					Authorization: `Bearer ${authToken}`
				}
			});
			const data = await response.json();
			//filter the data based on the ID
			TemplateDetails = data.data.filter((template) => template.id == templateID);
			loading = false;
		} catch (error) {
			loading = false;
			console.error('Error fetching variables:', error);
		}
	}

	onMount(() => {
		fetchTemplatesDetails();
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

<div
	class="absolute w-[75rem] right-64 bg-website-secondary text-brand-tertiary-gray border border-brand-primary-gray rounded-lg shadow-lg z-50"
	in:scale={{ start: 0.9, duration: 200 }}
	out:fade={{ duration: 150 }}
>
	<!-- Modal Header -->
	<div class="flex items-center justify-between px-6 py-4 border-b border-brand-primary-gray">
		<div class="flex items-center gap-x-3">
			<img src={modal_title_icon} alt="modal_title_icon" class="w-6" />
			{#if TemplateDetails.length > 0}
				<h2 class="text-lg text-white">{TemplateDetails[0].name} Details</h2>
			{:else}
				<h2 class="text-lg text-white">Template Details</h2>
			{/if}
		</div>
		<button type="button" class="cursor-pointer w-9" onclick={toggleTemplateModal}>
			<img src={modal_cross} alt="Close modal" class="w-7" />
		</button>
	</div>

	<!-- Tab Headers -->
	<div class="flex items-center w-full my-3 text-sm px-7 gap-x-5">
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
	<div class="container px-7">
		{#if TemplateDetails.length === 0}
			<div class="flex items-center justify-center h-96">
				<p class="text-lg text-center text-white">No data available</p>
			</div>
		{:else if loading}
			<div class="flex items-center justify-center h-96">
				<p class="text-lg text-center text-white">Loading...</p>
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

<style>
	.container {
		width: 100%;
		height: 500px;
	}
</style>
