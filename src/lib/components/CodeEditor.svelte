<script lang="ts">
	import loader from '@monaco-editor/loader'
	import { onDestroy, onMount } from 'svelte'
	import type * as Monaco from 'monaco-editor/esm/vs/editor/editor.api'

	let editor: Monaco.editor.IStandaloneCodeEditor
	let monaco: typeof Monaco
	let editorContainer: HTMLElement

	export let code

	onMount(async () => {
		const monacoEditor = await import('monaco-editor')
		loader.config({ monaco: monacoEditor.default })

		monaco = await loader.init()

		// Set the initial value to the provided Python code
		const pythonCode = code || ''

		editor = monaco.editor.create(editorContainer, {
			value: pythonCode,
			language: 'python',
			theme: 'vs-dark',
			automaticLayout: true,
			minimap: { enabled: false }
		})
	})

	onDestroy(() => {
		monaco?.editor.getModels().forEach(model => model.dispose())
		editor?.dispose()
	})
</script>

<div>
	<div class="bg-main-850 container rounded-md py-4" bind:this={editorContainer}></div>
</div>

<style>
	.container {
		min-height: 500px;
		min-width: 800px;
		width: 100%;
		height: 100%;
	}
</style>
