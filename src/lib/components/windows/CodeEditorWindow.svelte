<script lang="ts">
	import Window from '$lib/components/common/Window.svelte'
	import CodeEditor from '../CodeEditor.svelte'
	import ReadMe from '../ReadMe.svelte'
	import Requirement from '../Requirement.svelte'
	// Props passed to the component
	const props = $props()
	const { customProps } = props

	// Get the keys from customProps as dynamic tabs
	const tabs = Object.keys(customProps)

	// Variable to keep track of the active tab
	let activeTab = $state(tabs[0]) // Default to the first tab

	// Function to set the active tab
	function setActiveTab(tab: string) {
		activeTab = tab
	}
</script>

<Window {...props}>
	{#snippet header()}
		Code Editor
	{/snippet}

	{#snippet body()}
		<div class="flex items-center w-full px-4 my-3 text-sm gap-x-5">
			{#each tabs as tab}
				<button
					class="p-1.5 cursor-pointer border-b-white"
					class:border-b-2={activeTab === tab}
					onclick={() => setActiveTab(tab)}
				>
					{tab}
				</button>
			{/each}
		</div>

		<div class="px-4">
			<div class="container-size">
				{#if tabs.indexOf(activeTab) === 0}
					<CodeEditor code={customProps[activeTab]} />
				{:else if tabs.indexOf(activeTab) === 1}
					<ReadMe content={customProps[activeTab]} />
				{:else if tabs.indexOf(activeTab) === 2}
					<Requirement content={customProps[activeTab]} />
				{:else}
					<div>{customProps[activeTab]}</div>
				{/if}
			</div>
		</div>
	{/snippet}
</Window>

<style>
	.container-size {
		width: 1000px;
		height: 500px;
	}
</style>
