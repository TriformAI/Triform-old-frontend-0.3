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
		onUpdate?: (code: string) => void
	}

	let { code = $bindable(), class: classes, onUpdate }: Props = $props()

	let editorInitialized = $state(false)
	const initEditor = (el: HTMLDivElement) => {
		// Wrap in inner async so the top level function can be sync so svelte ts type cheking is happy
		;(async () => {
			const monacoEditor = await import('monaco-editor')
			loader.config({ monaco: monacoEditor.default })

			monaco = await loader.init()

			// Set the initial value to the provided Python code
			const pythonCode = code || ''

			editor = monaco.editor.create(el, {
				value: pythonCode,
				language: 'python',
				automaticLayout: true,
				fontSize: 14,
				minimap: { enabled: false }
			})

			editor.onDidChangeModelContent(_e => {
				code = editor.getValue()
				onUpdate?.(code)
			})

			// @ts-expect-error theme typing
			monaco.editor.defineTheme('GithubDark', githubDarkTheme)
			monaco.editor.setTheme('GithubDark')

			editorInitialized = true
			console.log('Created monaco', editor.getId())
		})()
	}

	onDestroy(() => {
		editor?.dispose()
		for (const model of monaco?.editor.getModels() ?? []) {
			if (model.id === editor?.getId()) model.dispose()
		}
	})
</script>

<div
	class={['bg-main-800 h-full w-full animate-pulse rounded-md', editorInitialized && 'hidden']}
></div>
<div
	class={['bg-main-800 rounded-md py-4 ps-0', !editorInitialized && 'invisible', classes]}
	use:initEditor
></div>
