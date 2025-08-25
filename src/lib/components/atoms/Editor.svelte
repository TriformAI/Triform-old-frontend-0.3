<script lang="ts">
	import { onDestroy } from 'svelte'
	import type * as Monaco from 'monaco-editor/esm/vs/editor/editor.api'
	import githubDarkTheme from '$lib/editor-themes/github-dark.json'

	let editor = $state<Monaco.editor.IStandaloneCodeEditor>()
	let monaco = $state<typeof Monaco>()

	interface Props {
		code: string
		class: string
		onUpdate?: (code: string) => void
		readOnly?: boolean
	}

	let { code = $bindable(), class: classes, onUpdate, readOnly }: Props = $props()

	let editorInitialized = $state(false)
	const initEditor = (el: HTMLDivElement) => {
		// Wrap in inner async so the top level function can be sync so svelte ts type cheking is happy
		;(async () => {
			const loader = (await import('@monaco-editor/loader')).default

			loader.config({
				paths: {
					vs: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.49.0/min/vs'
				}
			})

			monaco = await loader.init()

			// Set the initial value to the provided Python code
			const pythonCode = code || ''

			editor = monaco.editor.create(el, {
				value: pythonCode,
				language: 'python',
				automaticLayout: true,
				fontSize: 14,
				minimap: { enabled: false },
				readOnly
			})

			editor.onDidChangeModelContent(_e => {
				if (editor) {
					code = editor.getValue()
					onUpdate?.(code)
				}
			})

			// @ts-expect-error theme typing
			monaco.editor.defineTheme('GithubDark', githubDarkTheme)
			monaco.editor.setTheme('GithubDark')

			editorInitialized = true
			//console.log('Created monaco', editor.getId())
		})()
	}

	onDestroy(() => {
		editor?.dispose()
		for (const model of monaco?.editor.getModels() ?? []) {
			if (model.id === editor?.getId()) model.dispose()
		}
	})

	// Update readOnly if it's changed after the editor is initialized
	$effect(() => {
		if (!editor) return
		editor.updateOptions({ readOnly })
	})

	// update the editor value if it's changed after the editor is initialized
	$effect(() => {
		const ref = code
		if (!editorInitialized || !editor) return
		if (ref !== editor.getValue()) {
			const cursorPos = editor.getPosition()
			editor.setValue(ref)
			if (cursorPos) editor.setPosition(cursorPos)
		}
	})
</script>

{#if readOnly}
	<div class="absolute inset-0 z-50 cursor-not-allowed"></div>
{/if}

<div
	class={['bg-main-800 h-full w-full animate-pulse rounded-md', editorInitialized && 'hidden']}
></div>

<div
	class={['bg-main-800 rounded-md py-4 ps-0', !editorInitialized && 'invisible', classes]}
	use:initEditor
></div>
