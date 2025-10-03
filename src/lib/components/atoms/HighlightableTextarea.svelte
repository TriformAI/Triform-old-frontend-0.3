<script lang="ts">
	import { tick } from 'svelte'

	type HighlightEntry = { text: string; fill?: string; border?: string }

	let {
		value = $bindable(''),
		highlights = [],
		placeholder = '',
		class: className = '',
		style = '',
		// Textarea specific props
		rows,
		cols,
		maxlength,
		minlength,
		readonly,
		disabled,
		required,
		autofocus,
		// Event handlers
		onkeydown,
		oninput,
		onmousedown,
		onkeyup,
		onkeypress,
		onfocus,
		onblur,
		onchange,
		// Expose textarea element reference
		textarea = $bindable()
	}: {
		value?: string
		highlights?: HighlightEntry[]
		placeholder?: string
		class?: string
		style?: string
		rows?: number
		cols?: number
		maxlength?: number
		minlength?: number
		readonly?: boolean
		disabled?: boolean
		required?: boolean
		autofocus?: boolean
		onkeydown?: (e: KeyboardEvent) => void
		oninput?: (e: Event) => void
		onmousedown?: (e: MouseEvent) => void
		onkeyup?: (e: KeyboardEvent) => void
		onkeypress?: (e: KeyboardEvent) => void
		onfocus?: (e: FocusEvent) => void
		onblur?: (e: FocusEvent) => void
		onchange?: (e: Event) => void
		textarea?: HTMLTextAreaElement
	} = $props()

	let backdropElement = $state<HTMLDivElement>()
	let highlightsElement = $state<HTMLDivElement>()

	// Handle input changes and sync with highlights
	function handleInput(event: Event) {
		oninput?.(event)
		syncHighlights()
	}

	// Handle scrolling to keep elements in sync
	function handleScroll() {
		if (!textarea || !backdropElement) return
		backdropElement.scrollTop = textarea.scrollTop
		backdropElement.scrollLeft = textarea.scrollLeft
	}

	// Apply highlights to text
	function applyHighlights(text: string): string {
		if (!highlights.length) return text

		// Sort highlights by length (longest first) to avoid issues with overlapping matches
		const sortedHighlights = [...highlights].sort((a, b) => b.text.length - a.text.length)

		let highlightedText = text

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
			if (highlight.fill) {
				styles.push(`background-color: ${highlight.fill}`)
			}
			if (highlight.border) {
				styles.push(`border-color: ${highlight.border}`)
			}
			const styleAttr = styles.length > 0 ? ` style="${styles.join('; ')}"` : ''

			highlightedText = highlightedText.replace(regex, `<mark${styleAttr}>$&</mark>`)
		}

		// Fix trailing newline issue (from the article)
		return highlightedText.replace(/\n$/g, '\n\n')
	}

	// Sync highlights with textarea content
	function syncHighlights() {
		if (!highlightsElement) return
		const highlightedText = applyHighlights(value)
		highlightsElement.innerHTML = highlightedText
	}

	// Sync highlights when highlights or value changes
	$effect(() => {
		syncHighlights()
	})

	// Handle scroll synchronization
	$effect(() => {
		if (!textarea) return

		const handleScrollEvent = () => handleScroll()
		textarea.addEventListener('scroll', handleScrollEvent)

		return () => {
			textarea?.removeEventListener('scroll', handleScrollEvent)
		}
	})
</script>

<div class="highlightable-textarea-container" {style}>
	<div bind:this={backdropElement} class="highlightable-textarea-backdrop">
		<div bind:this={highlightsElement} class="highlightable-textarea-highlights"></div>
	</div>
	<textarea
		bind:this={textarea}
		bind:value
		{placeholder}
		{rows}
		{cols}
		{maxlength}
		{minlength}
		{readonly}
		{disabled}
		{required}
		{autofocus}
		class="highlightable-textarea {className}"
		oninput={handleInput}
		{onkeydown}
		{onmousedown}
		{onkeyup}
		{onkeypress}
		{onfocus}
		{onblur}
		{onchange}
	></textarea>
</div>

<style>
	.highlightable-textarea-container {
		position: relative;
		display: inline-block;
		width: 100%;
		height: 100%;
	}

	.highlightable-textarea-backdrop {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		overflow: auto;
		background-color: transparent;
		pointer-events: none;
		z-index: 1;
	}

	.highlightable-textarea-highlights {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		white-space: pre-wrap;
		word-wrap: break-word;
		color: transparent;
		font-family: inherit;
		font-size: inherit;
		font-weight: inherit;
		line-height: inherit;
		padding: inherit;
		margin: 0;
		border: transparent;
		background: transparent;
		overflow: hidden;
	}

	.highlightable-textarea {
		position: relative;
		z-index: 2;
		background: transparent;
		resize: none;
		margin: 0;
		border-radius: 0;
		/* Ensure consistent styling */
		font-family: inherit;
		font-size: inherit;
		font-weight: inherit;
		line-height: inherit;
	}

	/* Highlight styling */
	:global(.highlightable-textarea-highlights mark) {
		color: transparent;
		background-color: rgba(212, 233, 171, 0.3); /* Semi-transparent green */
		border: 1px solid rgba(212, 233, 171, 0.6);
		border-radius: 3px;
		padding: 1px 0px;
		margin: -1px 0;
	}

	/* Fix browser-specific issues */
	.highlightable-textarea:focus {
		outline: none;
	}

	/* Ensure perfect alignment */
	.highlightable-textarea,
	.highlightable-textarea-highlights {
		box-sizing: border-box;
	}
</style>
