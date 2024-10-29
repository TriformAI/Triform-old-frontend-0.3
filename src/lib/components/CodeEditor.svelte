<script lang="ts">
	import loader from '@monaco-editor/loader';
	import { onDestroy, onMount } from 'svelte';
	import type * as Monaco from 'monaco-editor/esm/vs/editor/editor.api';

	let editor: Monaco.editor.IStandaloneCodeEditor;
	let monaco: typeof Monaco;
	let editorContainer: HTMLElement;

	async function loadPythonCode() {
		const response = await fetch('/api/load-python-code');
		const data = await response.json();

		console.log(data);

		if (data.code) {
			return data.code;
		} else {
			console.error('Failed to load Python code:', data.error);
			return '# Error loading Python code';
		}
	}

	onMount(async () => {
		const monacoEditor = await import('monaco-editor');
		loader.config({ monaco: monacoEditor.default });

		monaco = await loader.init();

		const pythonCode = await loadPythonCode();

		editor = monaco.editor.create(editorContainer, {
			value: pythonCode,
			language: 'python',
			theme: 'vs-dark',
			automaticLayout: true
		});
	});

	onDestroy(() => {
		monaco?.editor.getModels().forEach((model) => model.dispose());
		editor?.dispose();
	});
</script>

<div class="container" bind:this={editorContainer}></div>

<style>
	.container {
		width: 100%;
		height: 500px;
	}
</style>
