<script>
	import { scale } from 'svelte/transition';
	import modal_title_icon from '$lib/icons/Modal_Title_Icon.svg';
	import modal_cross from '$lib/icons/modal_cross.svg';
	import CodeEditor from '../CodeEditor.svelte';

	export let toggleModuleInfoModal;

	// Variable to keep track of the active tab
	let activeTab = 'Edit Action';

	// Function to set the active tab
	function setActiveTab(tab) {
		activeTab = tab;
	}
</script>

<!-- Background Overlay -->
<div class="fixed inset-0 z-40 bg-black bg-opacity-20 backdrop-blur-lg"></div>

<div class="relative flex items-center justify-center top-10">
	<div
		class="w-[60rem] bg-website-secondary text-brand-tertiary-gray border border-brand-primary-gray rounded-lg shadow-lg z-50"
		in:scale={{ start: 0.9, duration: 200 }}
	>
		<!-- Modal Header -->
		<div class="flex items-center justify-between p-4 border-b border-brand-primary-gray">
			<div class="flex items-center gap-x-3">
				<img src={modal_title_icon} alt="modal_title_icon" class="w-6" />
				<h3 class="font-semibold text-left text-white text-md">Action Name</h3>
			</div>
			<button type="button" class="cursor-pointer w-9" on:click={toggleModuleInfoModal}>
				<img src={modal_cross} alt="Close modal" class="w-6" />
			</button>
		</div>

		<!-- Tab Headers -->
		<div class="flex items-center w-full my-3 text-sm px-7 gap-x-5">
			<button
				class="p-1.5 cursor-pointer border-b-white"
				class:border-b-2={activeTab === 'Edit Action'}
				on:click={() => setActiveTab('Edit Action')}
			>
				Edit Action
			</button>
			<button
				class="p-1.5 cursor-pointer border-b-white"
				class:border-b-2={activeTab === 'README.md'}
				on:click={() => setActiveTab('README.md')}
			>
				README.md
			</button>
			<button
				class="p-1.5 cursor-pointer border-b-white"
				class:border-b-2={activeTab === 'Requirements'}
				on:click={() => setActiveTab('Requirements')}
			>
				Requirements
			</button>
			<button
				class="p-1.5 cursor-pointer border-b-white"
				class:border-b-2={activeTab === 'Folder Structure'}
				on:click={() => setActiveTab('Folder Structure')}
			>
				Folder Structure
			</button>
		</div>

		<!-- Tab Content -->
		<div class="container px-7">
			{#if activeTab === 'Edit Action'}
				<CodeEditor
					code={`
	import json
	
	## start here
	def handler(event, context): ## your code here
		input = event.get("input_0", "default value")
		return json.dumps({"input_0": input})
	`}
				/>
			{:else if activeTab === 'README.md'}
				<h2>README Content</h2>
			{:else if activeTab === 'Requirements'}
				<h2>Requirements</h2>
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
