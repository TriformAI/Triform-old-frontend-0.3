<script lang="ts">
	export let content = '';

	// Basic Markdown parser function
	function parseMarkdown(md: string) {
		// Split content by new lines
		let lines = md.split('\n');

		return lines
			.map((line) => {
				// Heading 1 (e.g., # Heading)
				if (line.startsWith('# ')) {
					const text = line.slice(2).trim();
					return `<h1 style="font-weight: bold; font-size: 28px; margin: 10px 0; color: #d1d1d1; padding-bottom: 5px; border-bottom: 0.25px solid #252B31;">${text}</h1>`;
				}
				// Heading 2 (e.g., ## Heading)
				if (line.startsWith('## ')) {
					const text = line.slice(3).trim();
					return `<h2 style="font-weight: bold; font-size: 24px; margin: 15px 0; color: #c1c1c1; padding-bottom: 5px; border-bottom: 0.1px solid #252B31;">${text}</h2>`;
				}
				// Blockquote (e.g., > Quote)
				if (line.startsWith('> ')) {
					const text = line.slice(2).trim();
					return `<blockquote style="border-left: 4px solid #ccc; padding-left: 20px; margin: 10px 0; color: #d1d1d1;">${text}</blockquote>`;
				}
				// Unordered list (e.g., - Item)
				if (line.startsWith('- ')) {
					const text = line.slice(2).trim();
					return `<ul style="padding-left: 20px; color: #d1d1d1;"><li style="margin-bottom: 5px; list-style: disc;">${text}</li></ul>`;
				}
				// Paragraph (default case)
				return `<p style="font-size: 16px; line-height: 1.6; margin: 10px 0; color: #D1D1D1;">${line.trim()}</p>`;
			})
			.join(''); // Join all lines into a single HTML string
	}

	// Render parsed content
	let parsedContent = parseMarkdown(content);
</script>

<div class="h-full p-6 overflow-y-auto text-white">
	<!-- eslint-disable-next-line svelte/no-at-html-tags -->
	{@html parsedContent}
</div>
