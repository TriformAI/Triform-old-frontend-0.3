<script>
	export let content;
</script>

<button
	on:click
	class={`${content.width && content.width === 'full' ? 'w-full' : 'w-fit'} flex items-center justify-center flex-shrink-0 gap-x-3 px-8 py-3 text-xl font-medium text-brand-tertiary-gray hover:text-white transition duration-200 ease-in-out border rounded-lg bg-white/5 border-brand-primary-gray hover:border-brand-light-gray`}
>
	{#if content.icon}
		<img src={content.icon} alt="Button_Icon" class="w-5" />
	{/if}
	<span>{content.text}</span>
</button>
