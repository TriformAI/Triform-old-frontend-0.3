<script>
	import { browser } from '$app/environment';
	import green_check from '$lib/icons/green_check.svg';
	import graph_1 from '$lib/images/Footer_Graph_1.svg';
	import graph_2 from '$lib/images/Footer_Graph_2.svg';
	import graph_3 from '$lib/images/Footer_Graph_3.svg';
	import { footerPanel, statusModal } from '$lib/stores/modals';

	$: collapsed = $footerPanel || $statusModal;
	
	$: if (browser) {
		if (collapsed) {
			document.body.style.overflow = 'hidden';
		} else {
			document.body.style.overflow = '';
		}
	}
</script>

{#if !collapsed}
	<div class="relative flex items-center justify-center mx-auto opacity-0 group-hover:opacity-100">
		<svg
			xmlns="http://www.w3.org/2000/svg"
			fill="none"
			viewBox="0 0 24 24"
			stroke-width="3"
			stroke="white"
			class="transition-transform duration-200 ease-linear size-6 group-hover:-translate-y-3"
		>
			<path stroke-linecap="round" stroke-linejoin="round" d="m4.5 15.75 7.5-7.5 7.5 7.5" />
		</svg>
	</div>
{/if}

<button
	on:click={() => (collapsed = true)}
	class={`z-50 w-full px-7 border-t border-t-[#FFFFFF1A] text-brand-white bg-website-primary shadow-2xl duration-200 ease-linear transition-transform ${!collapsed ? 'group-hover:-translate-y-2 py-5 cursor-pointer' : 'pb-5 -translate-y-96 cursor-default'}`}
>
	{#if collapsed || $statusModal}
		<button
			class="bg-[#091136] w-fit mx-auto p-3 px-10 rounded-b-lg border-x border-b border-b-[#FFFFFF1A] border-x-[#FFFFFF1A] border-t border-t-[#091136]"
			on:click={(e) => {
				e.stopPropagation();
				collapsed = false;
			}}
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				fill="none"
				viewBox="0 0 24 24"
				stroke-width="2"
				stroke="currentColor"
				class="w-5 h-5"
			>
				<path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
			</svg>
		</button>
	{/if}
	<div class="flex items-center justify-between w-full">
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
	{#if collapsed}
		<div class="flex items-center w-full my-10 gap-x-20">
			<div>
				<div class="flex items-start justify-between w-full mb-5">
					<h2 class="relative flex items-center text-xl text-white left-5">Runs per Hour</h2>
					<p class="text-2xl text-white">
						0 <span class="ml-3 text-[#9CA3AF] text-lg">+0.0%</span>
					</p>
				</div>
				<img src={graph_1} alt="graph_1" class="w-[40rem]" />
			</div>
			<div>
				<div class="flex items-start justify-between w-full mb-5">
					<h2 class="relative flex items-center text-xl text-white left-5">Errors per Hour</h2>
					<p class="text-2xl text-white">
						0 <span class="ml-3 text-[#9CA3AF] text-lg">+0.0%</span>
					</p>
				</div>
				<img src={graph_2} alt="graph_2" class="w-[40rem]" />
			</div>
			<div>
				<div class="flex items-start justify-between w-full mb-5">
					<h2 class="relative flex items-center text-xl text-white left-5">Alerts</h2>
					<p class="text-2xl text-white">
						0 <span class="ml-3 text-[#9CA3AF] text-lg">+0.0%</span>
					</p>
				</div>
				<img src={graph_3} alt="graph_3" class="w-[40rem]" />
			</div>
		</div>
	{/if}
</button>
