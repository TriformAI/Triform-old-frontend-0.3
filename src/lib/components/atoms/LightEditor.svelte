<script lang="ts">
	import 'prism-code-editor/languages/json'
	import 'prism-code-editor/prism/languages/markdown'
	import 'prism-code-editor/prism/languages/python'
	import 'prism-code-editor/prism/languages/json'

	import 'prism-code-editor/layout.css'
	import 'prism-code-editor/scrollbar.css'
	import 'prism-code-editor/themes/github-dark.css'

	import { createEditor } from 'prism-code-editor'
	import { indentGuides } from 'prism-code-editor/guides'
	import { matchTags } from 'prism-code-editor/match-tags'
	import { cursorPosition } from 'prism-code-editor/cursor'
	import { defaultCommands } from 'prism-code-editor/commands'
	import { matchBrackets } from 'prism-code-editor/match-brackets'
	import { onDestroy } from 'svelte'

	interface Props {
		value?: string
		language: 'json' | 'md' | 'txt'
		class: string | string[]
		wordWrap?: boolean
		readOnly?: boolean
		onUpdate?: (value: string) => void
	}

	let {
		value = $bindable(),
		language,
		class: rawClasses,
		wordWrap = false,
		onUpdate,
		readOnly = false
	}: Props = $props()

	const classes = $derived.by(() => {
		if (Array.isArray(rawClasses)) return rawClasses.join(' ')
		return rawClasses
	})
	let editor: ReturnType<typeof createEditor>
	export const initEditor = (el: HTMLDivElement) => {
		editor = createEditor(
			el,
			{
				language,
				value,
				wordWrap,
				onUpdate: newValue => {
					value = newValue
					onUpdate?.(newValue)
				},
				readOnly
			},
			defaultCommands(),
			matchTags(),
			indentGuides(),
			matchBrackets(),
			cursorPosition()
		)
		return editor
	}

	// // Whenever the parent value changes, we need to update the editor
	// // (often its initialised as '' and then updated afterwards...)
	// $effect(() => {
	// 	const ref = value
	// 	if (!editor) return
	// 	editor.setOptions({ value: ref })
	// })

	onDestroy(() => {
		if (editor) editor.remove()
	})

	// Update readOnly if it's changed after the editor is initialized
	$effect(() => {
		if (!editor) return
		editor.setOptions({ readOnly })
	})
	// update the editor value if it's changed after the editor is initialized
	$effect(() => {
		if (!editor) return
		editor.setOptions({ value })
	})
</script>

<div use:initEditor class={['overflow-auto', readOnly && 'cursor-not-allowed', classes]}></div>
