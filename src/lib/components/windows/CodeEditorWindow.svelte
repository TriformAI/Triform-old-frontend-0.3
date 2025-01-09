<script lang="ts">
	import Window from '$lib/components/common/Window.svelte'
	import Tabs from '$lib/components/atoms/Tabs.svelte'
	import CodeEditor from '../CodeEditor.svelte'

	// Props passed to the component
	const props = $props()
	const { customProps } = props

	// Get the keys from customProps as dynamic tabs
	const tabs = Object.keys(customProps).map((key, index) => ({
		key: (index + 1).toString(),
		label: key.charAt(0).toUpperCase() + key.slice(1) // Capitalize the tab labels
	}))

	// Variable to keep track of the active tab
	let activeTab = $state(tabs[0]) // Default to the first tab

	// Function to parse Markdown content for the "ReadMe" tab
	const parseMarkdown = (md: string) => {
		let lines = md.split('\n')
		return lines
			.map(line => {
				if (line.startsWith('# ')) {
					const text = line.slice(2).trim()
					return `<h1 style="font-weight: bold; font-size: 28px; margin: 10px 0; color: #d1d1d1; padding-bottom: 5px; border-bottom: 0.25px solid #252B31;">${text}</h1>`
				}
				if (line.startsWith(' ## ')) {
					const text = line.slice(3).trim()
					return `<h2 style="font-weight: bold; font-size: 24px; margin: 15px 0; color: #c1c1c1; padding-bottom: 5px; border-bottom: 0.1px solid #252B31;">${text}</h2>`
				}
				if (line.startsWith(' > ')) {
					const text = line.slice(2).trim()
					return `<blockquote style="border-left: 4px solid #ccc; padding-left: 20px; margin: 10px 0; color: #d1d1d1;">${text}</blockquote>`
				}
				if (line.startsWith(' - ')) {
					const text = line.slice(2).trim()
					return `<ul style="padding-left: 20px; color: #d1d1d1;"><li style="margin-bottom: 5px; list-style: disc;">${text}</li></ul>`
				}
				return `<p style="font-size: 16px; line-height: 1.6; margin: 10px 0; color: #D1D1D1;">${line.trim()}</p>`
			})
			.join('')
	}
</script>

<Window {...props}>
	{#snippet header()}
		Code Editor
	{/snippet}

	{#snippet body()}
		<Tabs {tabs} bind:activeTab />

		<div class="py-4">
			<div class="w-full h-full min-w-[800px] min-h-[500px]">
				{#if activeTab?.key === '1'}
					<CodeEditor code={customProps[activeTab.label]} />
				{:else if activeTab?.key === '2'}
					<div class="h-full p-6 overflow-y-auto text-white">
						<!-- eslint-disable-next-line svelte/no-at-html-tags -->
						{@html parseMarkdown(customProps[activeTab.label] || '')}
					</div>
				{:else if activeTab?.key === '3'}
					<CodeEditor code={customProps[activeTab.label]} />
				{:else if activeTab}
					<div>{customProps[activeTab.label]}</div>
				{/if}
			</div>
		</div>
	{/snippet}
</Window>
