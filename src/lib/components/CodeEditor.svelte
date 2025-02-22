<script lang="ts">
	import loader from '@monaco-editor/loader'
	import { onDestroy } from 'svelte'
	import type * as Monaco from 'monaco-editor/esm/vs/editor/editor.api'
	import githubDarkTheme from '$lib/editor-themes/github-dark.json'

	let editor: Monaco.editor.IStandaloneCodeEditor
	let monaco: typeof Monaco

	interface Props {
		code: string
		class: string
	}

	let { code = $bindable(), class: classes }: Props = $props()

	async function initEditor(el: HTMLDivElement) {
		const monacoEditor = await import('monaco-editor')
		loader.config({ monaco: monacoEditor.default })

		monaco = await loader.init()

		// Set the initial value to the provided Python code
		const pythonCode = code || ''
		console.log(githubDarkTheme)

		editor = monaco.editor.create(el, {
			value: pythonCode,
			language: 'python',
			automaticLayout: true,
			fontSize: 14,
			minimap: { enabled: false }
		})

		editor.onDidChangeModelContent(e => {
			code = editor.getValue()
		})

		monaco.editor.defineTheme('GithubDark', githubDarkTheme)
		monaco.editor.setTheme('GithubDark')
	}

	onDestroy(() => {
		monaco?.editor.getModels().forEach(model => model.dispose())
		editor?.dispose()
	})
</script>

<div class={['bg-main-800 rounded-md py-4 ps-0', classes]} use:initEditor></div>
