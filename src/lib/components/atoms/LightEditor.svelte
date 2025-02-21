<script lang="ts">
	import 'prism-code-editor/languages/json'

	import 'prism-code-editor/prism/languages/json'
	import 'prism-code-editor/prism/languages/markdown'

	import 'prism-code-editor/layout.css'
	import 'prism-code-editor/scrollbar.css'
	import 'prism-code-editor/themes/github-dark.css'

	import { createEditor } from 'prism-code-editor'
	import { indentGuides } from 'prism-code-editor/guides'
	import { matchTags } from 'prism-code-editor/match-tags'
	import { cursorPosition } from 'prism-code-editor/cursor'
	import { defaultCommands } from 'prism-code-editor/commands'
	import { matchBrackets } from 'prism-code-editor/match-brackets'

	interface Props {
		value?: string
		language: 'json' | 'md' | 'txt'
		class: string
		wordWrap?: boolean
		onUpdate: (value: string) => void
	}

	const { value, language, class: classes, wordWrap = false, onUpdate }: Props = $props()

	export const initEditor = (el: HTMLDivElement) => {
		return createEditor(
			el,
			{ language, value, wordWrap, onUpdate },
			defaultCommands(),
			matchTags(),
			indentGuides(),
			matchBrackets(),
			cursorPosition()
		)
	}
</script>

<div use:initEditor class={['overflow-auto', classes]}></div>
