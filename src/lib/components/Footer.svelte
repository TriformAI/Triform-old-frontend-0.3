<script lang="ts">
	// @ts-nocheck
	import { run } from 'svelte/legacy'
	import { browser } from '$app/environment'
	import green_check from '$lib/icons/green_check.svg'
	import { footerPanel, statusModal } from '$lib/stores/modals'
	import Chart from './Chart.svelte'

	let collapsed
	run(() => {
		collapsed = $footerPanel || $statusModal
	})

	run(() => {
		if (browser) {
			if (collapsed) {
				document.body.style.overflow = 'hidden'
			} else {
				document.body.style.overflow = ''
			}
		}
	})
</script>

{#if !collapsed}
	<div
		class="relative flex items-center justify-center mx-auto transition-transform translate-y-10 opacity-0 group-hover:opacity-100"
	>
		<svg
			xmlns="http://www.w3.org/2000/svg"
			fill="none"
			viewBox="0 0 24 24"
			stroke-width="3"
			stroke="white"
			class="transition-transform duration-150 ease-linear size-6 group-hover:-translate-y-3"
		>
			<path stroke-linecap="round" stroke-linejoin="round" d="m4.5 15.75 7.5-7.5 7.5 7.5" />
		</svg>
	</div>
{/if}

<div
	role="button"
	tabindex="0"
	onclick={() => (collapsed = true)}
	onkeydown={() => {}}
	class={`${$statusModal ? 'pt-3' : ''} absolute bottom-0 z-50 w-full px-7 border-t border-t-brand-primary-gray text-brand-white bg-website-primary shadow-2xl duration-500 ease-out transition-transform ${
		!collapsed ? 'group-hover:-translate-y-[10%] py-2 cursor-pointer' : ' cursor-default'
	}`}
>
	{#if collapsed}
		<button
			aria-label="Expand"
			class={`${$statusModal ? 'hidden' : 'block'} p-3 px-10 mx-auto border-t border-b rounded-b-lg bg-website-dark-primary w-fit border-x border-b-brand-primary-gray border-x-brand-primary-gray border-t-brand-primary-gray`}
			onclick={e => {
				e.stopPropagation()
				collapsed = false
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
			<h2 class="text-sm text-primary-green">All system are operational</h2>
		</div>

		<div class="flex items-center gap-x-14">
			<h2 class="flex items-center text-sm text-brand-light-gray gap-x-3">
				<span class="relative text-lg text-brand-tertiary-gray bottom-0.5">0</span> Runs per Hour
			</h2>
			<h2 class="flex items-center text-md text-brand-light-gray gap-x-4">
				<span class="relative text-lg text-brand-tertiary-gray bottom-0.5">0</span> Errors per Hour
			</h2>
			<h2 class="flex items-center text-md text-brand-light-gray gap-x-4">
				<span class="relative text-lg text-brand-tertiary-gray bottom-0.5">0</span> Alerts
			</h2>
		</div>
	</div>
	{#if collapsed}
		<div class="flex items-center justify-between w-full py-10 overflow-auto gap-x-8">
			<div class="w-full">
				<div class="flex items-start justify-between w-full mb-5">
					<h2 class="relative flex items-center text-white text-md left-5">Runs per Hour</h2>
					<p class="text-white text-md">
						0 <span class="ml-3 text-md text-brand-light-gray">+0.0%</span>
					</p>
				</div>
				<Chart lineColor={'#22C55E'} width={32} height={15} />
			</div>
			<div class="w-full">
				<div class="flex items-start justify-between w-full mb-5">
					<h2 class="relative flex items-center text-white text-md left-5">Errors per Hour</h2>
					<p class="text-white text-md">
						0 <span class="ml-3 text-md text-brand-light-gray">+0.0%</span>
					</p>
				</div>
				<Chart lineColor={'#F44336'} width={32} height={15} />
			</div>
			<div class="w-full">
				<div class="flex items-start justify-between w-full mb-5">
					<h2 class="relative flex items-center text-white text-md left-5">Alerts</h2>
					<p class="text-white text-md">
						0 <span class="ml-3 text-md text-brand-light-gray">+0.0%</span>
					</p>
				</div>
				<Chart lineColor={'#FFC107'} width={32} height={15} />
			</div>
		</div>
	{/if}
</div>
