<script>
	import Button from '$lib/components/Button.svelte';
	import Add from '$lib/icons/add.svg';
</script>

<section class="flex flex-col justify-between bg-[#091136] text-brand-white min-h-[calc(100vh-15rem)]">
	<div class="flex flex-col items-center justify-center max-w-xl mx-auto my-auto text-center">
		<h2 class="text-3xl text-[#9CA3AF] leading-normal ">
			Right-click to Create Module/Agent/API or Drag from Toolbox
		</h2>
		<div class="relative flex items-center justify-center gap-x-3 top-72">
			<Button content={{ icon: Add, text: 'New Module' }} />
			<Button content={{ icon: Add, text: 'New API' }} />
			<Button content={{ icon: Add, text: 'New Agent' }} />
		</div>
	</div>
</section>