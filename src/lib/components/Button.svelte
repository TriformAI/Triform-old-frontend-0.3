<script>
	// @ts-nocheck
	import { createBubbler } from 'svelte/legacy';

	const bubble = createBubbler();
	export let content = {}; // Ensure you have a default value to avoid undefined issues
	export let type = 'default'; // New prop for type with a default value
</script>

<button
	onclick={bubble('click')}
	class={`${
		content.width && content.width === 'full' ? 'w-full' : 'w-fit'
	} flex items-center justify-center flex-shrink-0 gap-x-3 px-6 py-2.5 text-md font-medium 
    ${
			type === 'success'
				? 'bg-green-500 text-white hover:bg-green-600'
				: type === 'info'
					? 'bg-blue-500 text-white hover:bg-blue-600'
					: type === 'warning'
						? 'bg-yellow-500 text-white hover:bg-yellow-600'
						: type === 'error'
							? 'bg-red-500 text-white hover:bg-red-600'
							: 'bg-white/5 text-brand-tertiary-gray hover:text-white'
		} 
    transition duration-200 ease-in-out border rounded-lg 
    ${
			type === 'default'
				? 'border-brand-primary-gray hover:border-brand-light-gray'
				: 'border-transparent'
		}`}
>
	{#if content.icon}
		<img src={content.icon} alt="Button_Icon" class="w-5" />
	{/if}
	<span>{content.text}</span>
</button>
