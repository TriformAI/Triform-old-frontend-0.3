<script>
	import green_check from '$lib/icons/green_check.svg';
</script>

<div class="relative flex items-center justify-center opacity-0 group-hover:opacity-100">
	<svg
		xmlns="http://www.w3.org/2000/svg"
		fill="none"
		viewBox="0 0 24 24"
		stroke-width="3"
		stroke="white"
		class="transition-transform duration-200 ease-linear size-6 group-hover:-translate-y-5"
	>
		<path stroke-linecap="round" stroke-linejoin="round" d="m4.5 15.75 7.5-7.5 7.5 7.5" />
	</svg>
</div>
<div
	class="flex items-center justify-between w-full py-5 px-7 border-t border-t-[#FFFFFF1A] text-brand-white bg-website-primary shadow-2xl duration-200 ease-linear transition-transform group-hover:-translate-y-2"
>
	<div class="flex items-center gap-x-3">
		<img src={green_check} alt="green_check" class="w-5" />
		<h2 class="text-xl text-[#22C55E]">All system are operational</h2>
	</div>

	<div class="flex items-center gap-x-16">
		<h2 class="text-[#9CA3AF] flex items-center gap-x-5 text-xl">
			<span class="text-3xl text-[#D1D5DB] relative bottom-0.5">0</span> Runs per Hour
		</h2>
		<h2 class="text-[#9CA3AF] flex items-center gap-x-5 text-xl">
			<span class="text-3xl text-[#D1D5DB] relative bottom-0.5">0</span> Errors per Hour
		</h2>
		<h2 class="text-[#9CA3AF] flex items-center gap-x-5 text-xl">
			<span class="text-3xl text-[#D1D5DB] relative bottom-0.5">0</span> Alerts
		</h2>
	</div>
</div>
