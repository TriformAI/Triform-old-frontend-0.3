import 'prism-code-editor/languages/json'
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

export const initJsonEditor = (
	el: HTMLDivElement,
	initialValue: string,
	onUpdate: (value: string) => void
) => {
	return createEditor(
		el,
		{ language: 'json', value: initialValue, onUpdate },
		defaultCommands(),
		matchTags(),
		indentGuides(),
		matchBrackets(),
		cursorPosition()
	)
}
