<script lang="ts">
	import { marked } from 'marked'
	import DOMPurify from 'dompurify'

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
			const markdownResult = marked.parse(processed)
			console.log('markdownResult', markdownResult)
			processed = DOMPurify.sanitize(markdownResult as string)
			// Handle both sync and async results
			processed = typeof markdownResult === 'string' ? markdownResult : processed
		}

		// Step 2: Apply highlights
		processed = applyHighlights(processed)

		return processed
	})
</script>

<span
	bind:this={span}
	class={['highlightable-span', markdown && 'contents', className]}
	{style}
	{...restProps}
>
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

	:global(.highlightable-span h1) {
		font-size: var(--text-2xl);
		font-weight: 800;
	}

	:global(.highlightable-span h2) {
		font-size: var(--text-xl);
		font-weight: 700;
	}

	:global(.highlightable-span h3) {
		font-size: var(--text-lg);
		font-weight: 600;
	}

	:global(.highlightable-span h4) {
		font-size: var(--text-md);
		font-weight: 600;
	}

	:global(.highlightable-span h5) {
		font-size: var(--text-sm);
	}

	:global(.highlightable-span ul) {
		list-style-type: disc;
		margin-left: 0.5rem;
		line-height: 1rem;
	}

	:global(.highlightable-span li) {
		list-style-type: disc;
		margin-left: 1rem;
	}

	:global(.highlightable-span a) {
		color: var(--color-accent-400);
		transition: color 0.1s ease-in-out;
	}

	:global(.highlightable-span a:hover) {
		color: var(--color-accent-300);
		text-decoration: underline;
	}

	:global(.highlightable-span blockquote) {
		border-left: 2px solid var(--color-main-800);
		padding-left: 1rem;
		margin-left: 1rem;
	}

	:global(.highlightable-span hr) {
		border-color: var(--color-main-700);
	}

	/* Tables */
	:global(.highlightable-span table) {
		width: 100%;
		border-collapse: collapse;
	}
</style>
