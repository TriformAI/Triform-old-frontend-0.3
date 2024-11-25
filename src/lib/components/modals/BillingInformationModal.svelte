<script>
	import { fade, scale } from 'svelte/transition';
	import { signOut } from '@auth/sveltekit/client';
	import { removeCookie } from '$lib/stores/cookie';
	import modal_title_icon from '$lib/icons/Modal_Title_Icon.svg';
	import modal_cross from '$lib/icons/modal_cross.svg';
	import { PUBLIC_API_URL } from '$env/static/public';
	import { getAuthToken } from '$lib/stores/cookie';
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import ConfirmationModal from '$lib/components/modals/ConfirmationModal.svelte';
	import PasswordResetModal from './PasswordResetModal.svelte';
	import Spinner from '$lib/components/Spinner.svelte';
	import { toasts } from 'svelte-toasts';
	import { profilePic } from '$lib/stores/profile';

	let { toggleBillingInfoModal } = $props();
	let activeTab = $state('credit-management');
	let topupThreshold = '$5';
	let topupAmount = '$20';
	let monthlyBudget = '$50';

	function setActiveTab(tab) {
		activeTab = tab;
	}

	onMount(() => {
		document.body.style.overflow = 'hidden';
	});
</script>

<!-- Background Overlay -->
<div class="fixed inset-0 z-40 bg-black bg-opacity-20 backdrop-blur-lg"></div>

<div class="flex items-center justify-center">
	<div
		class="w-[60rem] overflow-y-auto bg-website-dark-primary text-brand-tertiary-gray border border-brand-primary-gray rounded-lg shadow-lg z-50"
		in:scale={{ start: 0.9, duration: 200 }}
	>
		<!-- Modal Header -->
		<div class="flex items-center justify-between p-4 border-b border-brand-primary-gray">
			<div class="flex items-center gap-x-3">
				<img src={modal_title_icon} alt="modal_title_icon" class="w-6" />
				<h3 class="font-semibold text-left text-white text-md">Billing Details</h3>
			</div>
			<button type="button" class="cursor-pointer w-9" onclick={toggleBillingInfoModal}>
				<img src={modal_cross} alt="Close modal" class="w-6" />
			</button>
		</div>

		<div class="flex items-center w-full px-4 my-3 text-sm gap-x-5">
			<button
				class="p-1.5 cursor-pointer border-b-white"
				class:border-b-2={activeTab === 'credit-management'}
				onclick={() => setActiveTab('credit-management')}
			>
				Credit Management
			</button>
			<button
				class="p-1.5 cursor-pointer border-b-white"
				class:border-b-2={activeTab === 'payment-info'}
				onclick={() => setActiveTab('payment-info')}
			>
				Payment Information
			</button>
			<button
				class="p-1.5 cursor-pointer border-b-white"
				class:border-b-2={activeTab === 'top-ups'}
				onclick={() => setActiveTab('top-ups')}
			>
				Automated Top-ups
			</button>
			<button
				class="p-1.5 cursor-pointer border-b-white"
				class:border-b-2={activeTab === 'history'}
				onclick={() => setActiveTab('history')}
			>
				Billing History
			</button>
		</div>

		<!-- credit-management tab -->
		{#if activeTab === 'credit-management'}
			<section class="font-sans antialiased text-white h-[40rem] overflow-y-auto">
				<div class="p-6 rounded-lg">
					<div class="p-4 mb-6 rounded-md bg-brand-tertiary-gray">
						<div class="flex items-center">
							<div class="flex-shrink-0">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									fill="none"
									viewBox="0 0 24 24"
									stroke-width="1.5"
									stroke="#2A2B2C"
									class="size-7"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z"
									/>
								</svg>
							</div>
							<div class="ml-3">
								<p class="text-sm text-gray-800">You have not added a payment method.</p>
								<a
									href="#"
									class="text-sm font-medium text-gray-800 duration-100 ease-in-out hover:text-gray-700 hover:font-bold"
									>Add a Payment Method &rarr;</a
								>
							</div>
						</div>
					</div>

					<div class="space-y-8 divide-y divide-gray-700">
						<div>
							<div class="flex flex-col items-start justify-between gap-4 mb-4 lg:flex-row">
								<div class="w-full p-5 rounded-md bg-website-secondary lg:w-auto">
									<div class="flex items-center gap-x-6">
										<div>
											<p class="text-lg font-bold text-white">Credit Balance</p>
											<p class="text-xl font-bold text-white">$0</p>
										</div>
										<button
											class="px-4 py-2 text-sm font-bold text-white bg-gray-600 rounded-md hover:bg-gray-700"
										>
											+ Add Credits
										</button>
									</div>
								</div>

								<div class="flex space-x-3">
									<button
										class="px-7 py-2.5 text-sm font-bold text-white rounded-md bg-website-tertiary hover:bg-gray-600"
									>
										Top-up Preferences
									</button>
									<button
										class="px-7 py-2.5 text-sm font-bold text-white rounded-md bg-website-tertiary hover:bg-gray-600"
									>
										Billing History
									</button>
								</div>
							</div>

							<div class="p-4 rounded-md bg-website-secondary">
								<div class="flex items-center justify-between mb-4">
									<p class="text-lg font-bold text-white">Credit Usage</p>
									<select class="p-2 px-5 text-white rounded-lg bg-website-dark-primary">
										<option>Last 7 Days</option>
										<option>Last 12 Days</option>
										<option>Last 30 Days</option>
									</select>
								</div>
								<div class="h-48 rounded-lg">Chart Placeholder</div>
							</div>
						</div>

						<div>
							<div class="p-4 mt-8 rounded-md bg-website-secondary">
								<div class="flex items-center justify-between mb-4">
									<p class="text-lg font-bold text-white">Spending By Flow</p>
									<select class="p-2 px-5 text-white rounded-lg bg-website-dark-primary">
										<option>Last 7 Days</option>
										<option>Last 12 Days</option>
										<option>Last 30 Days</option>
									</select>
								</div>
								<div class="h-48 rounded-md">Chart Placeholder</div>
							</div>
						</div>
					</div>
				</div>
			</section>
		{/if}

		<!-- payment info -->
		{#if activeTab === 'payment-info'}
			<section class="font-sans antialiased text-white h-[40rem] overflow-y-auto">
				<div class="p-6 rounded-lg">
					<h3 class="max-w-3xl mb-4">
						We use Stripe to manage your payment methods. You can view and update your payment
						method in the Stripe Dashboard.
					</h3>
					<div class="p-4 rounded-md bg-website-secondary">
						<div class="flex items-center justify-between">
							<p class="mb-4 text-lg font-bold text-white">Payment Method</p>
							<a
								href="#"
								dusk="manage-payment-method"
								class="px-5 py-2 text-sm font-bold text-white uppercase rounded-md hover:brightness-75 bg-website-dark-primary"
							>
								Manage Payment Method
							</a>
						</div>
						<!-- <p class="mb-5 text-gray-300 text-md">Your default payment method is</p> -->
						<!-- <div class="py-2 font-bold text-white uppercase border border-gray-600 rounded-md px-7 text-md w-fit">
									{{ auth()->user()->currentTeam->pm_type }} **** **** ****
									{{ auth()->user()->currentTeam->pm_last_four }}
								</div> -->
						<p class="mb-5 text-gray-300 text-md">No payment method has been added yet.</p>
					</div>
				</div>
			</section>
		{/if}

		<!-- top-ups -->
		{#if activeTab === 'top-ups'}
			<section class="font-sans antialiased text-white h-[40rem] overflow-y-auto">
				<div class="p-6 rounded-lg">
					<div class="space-y-8 divide-y divide-gray-700">
						<div class="p-5 rounded-lg bg-website-tertiary">
							<div class="flex justify-between gap-4 mb-6">
								<!-- Top-up Threshold -->
								<div class="flex flex-col w-full">
									<label
										for="topupThreshold"
										class="flex items-center w-full mb-2 text-sm font-semibold text-white"
									>
										Top-up Threshold
										<div class="relative ml-1 group">
											<span class="text-gray-400 cursor-pointer">&#9432;</span>
											<div
												class="absolute hidden h-[55px] w-[400px] p-3 mb-2 text-sm text-white rounded-md shadow-lg bg-website-dark-primary bottom-full group-hover:block"
											>
												If your balance falls below this threshold, your account will be
												automatically credited by the top-up amount.
											</div>
										</div>
									</label>
									<input
										id="topupThreshold"
										type="text"
										bind:value={topupThreshold}
										class="p-3 text-white rounded-md bg-website-dark-primary"
									/>
								</div>

								<!-- Top-up Amount -->
								<div class="flex flex-col w-full">
									<label
										for="topupAmount"
										class="flex items-center mb-2 text-sm font-semibold text-white"
									>
										Top-up Amount
										<div class="relative ml-1 group">
											<span class="text-gray-400 cursor-pointer">&#9432;</span>
											<div
												class="absolute hidden h-[55px] w-[350px] p-3 mb-2 text-sm text-white rounded-md shadow-lg bg-website-dark-primary bottom-full group-hover:block"
											>
												Automatically credit the account by the amount below if credit usage falls
												below the threshold.
											</div>
										</div>
									</label>
									<input
										id="topupAmount"
										type="text"
										bind:value={topupAmount}
										class="p-3 text-white rounded-md bg-website-dark-primary"
									/>
								</div>
							</div>

							<!-- Monthly Budget -->
							<div class="flex flex-col mb-6">
								<label
									for="monthlyBudget"
									class="flex items-center mb-2 text-sm font-semibold text-white"
								>
									Monthly Budget
									<div class="relative ml-1 group">
										<span class="text-gray-400 cursor-pointer">&#9432;</span>
										<div
											class="absolute hidden h-[77px] w-[300px] p-3 mb-2 text-sm text-white rounded-md shadow-lg bg-website-dark-primary bottom-full group-hover:block"
										>
											If your organization exceeds this threshold in a given calendar month (UTC),
											an email notification will be sent.
										</div>
									</div>
								</label>
								<input
									id="monthlyBudget"
									type="text"
									bind:value={monthlyBudget}
									class="p-3 text-white rounded-md bg-website-dark-primary"
								/>
							</div>

							<button
								class="px-6 py-3 text-sm font-bold text-white bg-gray-600 rounded-md hover:bg-gray-700"
							>
								Save Settings
							</button>
						</div>
					</div>
				</div>
			</section>
		{/if}

		<!-- history -->
		{#if activeTab === 'history'}
			<section class="font-sans antialiased text-white h-[40rem] overflow-y-auto">
				<div class="p-6 rounded-lg">
					<h3 class="max-w-3xl mb-4">
						View your billing history for credit topups, flows execution & storage.
					</h3>
					<div class="p-4 mb-6 rounded-md bg-brand-tertiary-gray">
						<div class="flex items-center">
							<div class="flex-shrink-0">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									fill="none"
									viewBox="0 0 24 24"
									stroke-width="1.5"
									stroke="#2A2B2C"
									class="size-7"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z"
									/>
								</svg>
							</div>
							<div class="ml-3">
								<p class="text-sm text-gray-800">You have not added a payment method.</p>
								<a
									href="#"
									class="text-sm font-medium text-gray-800 duration-100 ease-in-out hover:text-gray-700 hover:font-bold"
									>Add a Payment Method &rarr;</a
								>
							</div>
						</div>
					</div>
				</div>
			</section>
		{/if}
	</div>
</div>
