<script lang="ts">
	import Window from '$lib/components/common/Window.svelte'
	import Tabs from '$lib/components/atoms/Tabs.svelte'
	import loader from '@monaco-editor/loader'
	import { onDestroy } from 'svelte'
	import type * as Monaco from 'monaco-editor/esm/vs/editor/editor.api'

	// Props passed to the component
	const props = $props()
	const { customProps } = props

	let editor: Monaco.editor.IStandaloneCodeEditor
	let monaco: typeof Monaco
	let editorContainer = $state<HTMLElement>()

	// Get the keys from customProps as dynamic tabs
	const tabs = Object.keys(customProps).map((key, index) => ({
		key: (index + 1).toString(),
		label: key.charAt(0).toUpperCase() + key.slice(1) // Capitalize the tab labels
	}))

	// Variable to keep track of the active tab
	let activeTab = $state(tabs[0]) // Default to the first tab

	// Function to get the list of libraries for the "Requirements" tab
	const getLibraries = () => {
		const content = customProps[activeTab.label] || ''
		return content.split('\n').filter((lib: string) => lib.trim() !== '')
	}

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

	// Function to initialize the Monaco editor
	const initializeEditor = async (code: string) => {
		if (!editorContainer) return

		if (!monaco) {
			const monacoEditor = await import('monaco-editor')
			loader.config({ monaco: monacoEditor.default })
			monaco = await loader.init()
		}

		// Dispose of any existing editor before creating a new one
		editor?.dispose()

		editor = monaco.editor.create(editorContainer, {
			value: code,
			language: 'python',
			theme: 'vs-dark',
			automaticLayout: true
		})
	}

	// Watch for changes to the active tab
	$effect(() => {
		if (activeTab?.key === '1' && editorContainer) {
			const code = customProps[activeTab.label] || ''
			initializeEditor(code)
		}
	})

	// Cleanup on component destroy
	onDestroy(() => {
		editor?.dispose()
		monaco?.editor.getModels().forEach(model => model.dispose())
	})
</script>

<Window {...props}>
	{#snippet header()}
		Code Editor
	{/snippet}

	{#snippet body()}
		<Tabs {tabs} bind:activeTab />

		<div class="py-4">
			<div class="container-size">
				{#if activeTab?.key === '1'}
					<div class="monaco-container" bind:this={editorContainer}></div>
				{:else if activeTab?.key === '2'}
					<div class="h-full p-6 overflow-y-auto text-white">
						<!-- eslint-disable-next-line svelte/no-at-html-tags -->
						{@html parseMarkdown(customProps[activeTab.label] || '')}
					</div>
				{:else if activeTab?.key === '3'}
					<div class="px-6 py-2 text-white">
						<ul class="p-2">
							{#if getLibraries().length > 0}
								{#each getLibraries() as lib, index}
									<li class="max-w-lg my-2 text-sm list-disc">
										{lib}
									</li>
								{/each}
							{:else}
								<li class="max-w-lg my-2 text-sm">No Requirements</li>
							{/if}
						</ul>
					</div>
				{:else if activeTab}
					<div>{customProps[activeTab.label]}</div>
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

	.monaco-container {
		width: 100%;
		height: 500px;
	}
</style>
