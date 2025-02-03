<script lang="ts">
	import Window from '$lib/components/common/Window.svelte'
	import Tabs from '$lib/components/atoms/Tabs.svelte'
	import CodeEditor from '../CodeEditor.svelte'
	import Button from '$lib/components/atoms/Button.svelte'

	import IconDatabaseUpload from '~icons/material-symbols/database-upload-rounded'

	import { publishComponent } from '$lib/actions/executor'

	import type { Node } from '$lib/types/flow'

	// Props passed to the component
	const props = $props()
	const {
		customProps: {
			files,
			node
		}
	}: {
		customProps: {
			files: {
				'action.py': string
				'README.md': string
				'requirements.txt': string
				[k: string]: string
			}
			node: Node
		}
	} = props

	// Get the keys from customProps as dynamic tabs
	const tabs = Object.keys(files).map(key => ({
		key,
		label: key
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

	const publish = async () => {
		console.log('publishing')
		const newComponent = await publishComponent(node.data.spec)
		console.log('new component', newComponent)
	}
</script>

<Window {...props}>
	{#snippet header()}
		Code Editor
	{/snippet}

	{#snippet body()}
		<Tabs {tabs} bind:activeTab />

		<div class="py-4 flex gap-y-4 flex-col">
			<div class="container-size">
				{#each tabs as tab}
					{#if activeTab?.key === tab.key}
						<CodeEditor code={files[tab.key]} />
					{/if}
				{/each}
			</div>
			<Button variation="primary" class="ml-auto" autoLoad={true} onClick={publish}>
				{#snippet icon()}
					<IconDatabaseUpload />
				{/snippet}
				{#snippet body()}
					Publish
				{/snippet}
			</Button>
		</div>
	{/snippet}
</Window>
