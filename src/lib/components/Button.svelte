<script>
	export let content;
</script>

<button on:click
	class="flex items-center justify-center flex-shrink-0 gap-x-3 px-8 py-3 text-xl font-medium text-[#D1D5DB] hover:text-white transition duration-200 ease-in-out border rounded-lg bg-white/5 border-[#FFFFFF30] hover:border-white"
>
	{#if content.icon}
		<img src={content.icon} alt="Button_Icon" class="w-5">
	{/if}
	<span>{content.text}</span>
</button>
