<script lang="ts">
	import { marked } from 'marked'

	type HighlightEntry = { text: string; fill?: string; border?: string; color?: string }

	let {
		text = $bindable(''),
		highlights = [],
		markdown = false,
		class: className = '',
		style = '',
		// Expose span element reference
		span = $bindable(),
		...restProps
	}: {
		text?: string
		highlights?: HighlightEntry[]
		markdown?: boolean
		class?: string
		style?: string
		span?: HTMLSpanElement
		[key: string]: unknown
	} = $props()

	// Apply highlights to text
	function applyHighlights(inputText: string): string {
		if (!highlights.length) return inputText

		// Sort highlights by length (longest first) to avoid issues with overlapping matches
		const sortedHighlights = [...highlights].sort((a, b) => b.text.length - a.text.length)

		let highlightedText = inputText

		// Replace each highlight with marked version
		for (const highlight of sortedHighlights) {
			const escapedText = highlight.text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

			// Check if text starts/ends with word characters to determine boundary usage
			const startsWithWordChar = /^\w/.test(highlight.text)
			const endsWithWordChar = /\w$/.test(highlight.text)

			// Build regex with appropriate boundaries
			let regexPattern = escapedText
			if (startsWithWordChar) regexPattern = `\\b${regexPattern}`
			if (endsWithWordChar) regexPattern = `${regexPattern}\\b`

			const regex = new RegExp(regexPattern, 'g')

			// Build inline styles
			const styles = []
			if (highlight.fill) styles.push(`background-color: ${highlight.fill}`)
			if (highlight.border) styles.push(`border-color: ${highlight.border}`)
			if (highlight.color) styles.push(`color: ${highlight.color}`)
			const styleAttr = styles.length > 0 ? ` style="${styles.join('; ')}"` : ''

			highlightedText = highlightedText.replace(regex, `<mark${styleAttr}>$&</mark>`)
		}

		return highlightedText
	}

	// Configure marked for inline rendering (no paragraphs for spans)
	marked.setOptions({
		breaks: true,
		gfm: true
	})

	// Process text: markdown first, then highlights
	const processedHtml = $derived.by(() => {
		let processed = text

		// Step 1: Render markdown if enabled
		if (markdown) {
			// Use marked.parseInline for inline markdown (no wrapping <p> tags)
			const markdownResult = marked.parseInline(processed)
			// Handle both sync and async results
			processed = typeof markdownResult === 'string' ? markdownResult : processed
		}

		// Step 2: Apply highlights
		processed = applyHighlights(processed)

		return processed
	})
</script>

<span bind:this={span} class="highlightable-span {className}" {style} {...restProps}>
	{@html processedHtml}
</span>

<style>
	/* Highlight styling */
	:global(.highlightable-span mark) {
		color: inherit;
		border-radius: 3px;
		padding: 3px 5px;
		margin: 0 3px;
	}
</style>
