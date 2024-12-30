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
			automaticLayout: true
		})
	})

	onDestroy(() => {
		monaco?.editor.getModels().forEach(model => model.dispose())
		editor?.dispose()
	})
</script>

<div class="container" bind:this={editorContainer}></div>

<style>
	.container {
		width: 100%;
		height: 500px;
	}
</style>
