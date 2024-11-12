<script>
	export let content = '';

	// Split the content by newline characters to create an array of library names
	let libraries = content.split('\n');
</script>

<div class="px-6 py-2 text-white">
	<ul class="p-2">
		{#if libraries.length > 0 && libraries[0].trim() !== ''}
			{#each libraries as lib, index}
				<li class="max-w-lg my-2 text-sm list-disc" key={index}>
					{lib}
				</li>
			{/each}
		{:else}
			<li class="max-w-lg my-2 text-sm">No Requirements</li>
		{/if}
	</ul>
</div>
