<script lang="ts">
	import 'prism-code-editor/languages/json'
	import 'prism-code-editor/prism/languages/markdown'
	import 'prism-code-editor/prism/languages/python'
	import 'prism-code-editor/prism/languages/json'
	import 'prism-code-editor/prism/languages/handlebars'

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

	let {
		value = $bindable(),
		language,
		class: rawClasses,
		wordWrap = false,
		onUpdate,
		readOnly = false,
		editor = $bindable(),
		id
	}: {
		value?: string
		language: 'json' | 'md' | 'txt' | 'handlebars'
		class?: string | (string | boolean)[]
		wordWrap?: boolean
		readOnly?: boolean
		onUpdate?: (value: string) => void
		editor?: ReturnType<typeof createEditor>
		id?: string
	} = $props()

	const classes = $derived.by(() => {
		if (Array.isArray(rawClasses)) return rawClasses.filter(Boolean).join(' ')
		return rawClasses
	})
	let isInitializing = false
	export const initEditor = (el: HTMLDivElement) => {
		isInitializing = true
		editor = createEditor(
			el,
			{
				language,
				value,
				wordWrap,
				onUpdate: newValue => {
					value = newValue
					// Only call onUpdate if we're not in the middle of initialization
					if (!isInitializing) {
						onUpdate?.(newValue)
					}
				},
				readOnly
			},
			defaultCommands(),
			matchTags(),
			indentGuides(),
			matchBrackets(),
			cursorPosition()
		)
		isInitializing = false
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
		// Only update if the value is actually different from current editor value
		if (editor.value !== value) {
			editor.setOptions({ value })
		}
	})
</script>

<div use:initEditor {id} class={['overflow-auto', readOnly && 'cursor-not-allowed', classes]}></div>
