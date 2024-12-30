<script lang="ts">
	import { fade, scale } from 'svelte/transition';
	import modal_title_icon from '$lib/icons/Modal_Title_Icon.svg';
	import modal_cross from '$lib/icons/modal_cross.svg';
	import { PUBLIC_API_URL } from '$env/static/public';
	import { getAuthToken } from '$lib/stores/cookie';
	import { onMount } from 'svelte';
	import ConfirmationModal from '$lib/components/modals/ConfirmationModal.svelte';
	import Spinner from '$lib/components/Spinner.svelte';
	import { toasts } from 'svelte-toasts';
	import Chart from '../Chart.svelte';
	import CreditUsageChart from '../CreditUsageChart.svelte';

	const authToken = getAuthToken();
	const apiUrl = PUBLIC_API_URL;
	let loading = $state(false);
	let currentTeam = $state({});
	let paymentMethodAdded = $state(false);
	let { toggleBillingInfoModal } = $props();
	let activeTab = $state('credit-management');
	let topupThreshold = $state('$0');
	let topupAmount = $state('$0');
	let monthlyBudget = $state('$0');
	let billingUsage = $state();
	let selectedRange = $state('last_7_days');
	let confirmationModal = $state(false);
	let credit_balance = $state(0);

	function toggleConfirmationModal() {
		confirmationModal = !confirmationModal;
	}

	// Handle dropdown change
	function handleRangeChange(event: Event) {
		const target = event.target as HTMLSelectElement | null;
		if (target) {
			selectedRange = target.value;
		}
		FetchBillingUsage();
	}

	function setActiveTab(tab: string) {
		activeTab = tab;
	}

	function checkPaymentMethodAdded(currentTeam) {
		if (currentTeam && (currentTeam.pm_last_four === null || currentTeam.pm_type === null)) {
			paymentMethodAdded = false;
		} else {
			paymentMethodAdded = true;
		}
	}

	async function UpdateCredits() {
		try {
			const response = await fetch(`${apiUrl}/api/v1/billing/credits`, {
				method: 'POST',
				headers: {
					Authorization: `Bearer ${authToken}`,
					'Content-Type': 'application/json'
				}
			});

			const data = await response.json();
			if (response.ok && data) {
				toasts.success('Credits added successfully');
				credit_balance = credit_balance + parseInt(topupAmount.replace('$', ''), 10);
			} else {
				console.error('Credits update failed:', data);
			}
		} catch (error) {
			console.error('An error occurred during credits update:', error);
		}
	}

	async function BillingPortal() {
		try {
			loading = true;
			const response = await fetch(`${apiUrl}/api/v1/billing/portal`, {
				method: 'GET',
				headers: {
					Authorization: `Bearer ${authToken}`,
					'Content-Type': 'application/json'
				}
			});

			const data = await response.json();
			loading = false;
			if (response.ok && data) {
				window.location.href = data.portal_link;
			}
		} catch (error) {
			console.error('An error occurred during profile fetch:', error);
		}
	}

	async function FetchCurrentTeam() {
		try {
			const response = await fetch(`${apiUrl}/api/v1/current-team`, {
				method: 'GET',
				headers: {
					Authorization: `Bearer ${authToken}`,
					'Content-Type': 'application/json'
				}
			});

			const data = await response.json();
			console.log(data.data);
			if (response.ok && data) {
				currentTeam = data.data;
				checkPaymentMethodAdded(currentTeam);
				if (currentTeam) {
					topupThreshold = `$${currentTeam.credit_threshold}`;
					topupAmount = `$${currentTeam.credit_topup}`;
					monthlyBudget = `$${currentTeam.monthly_limit}`;
					credit_balance = currentTeam.credit_balance;
				}
			} else {
				console.error('Current Team fetch failed:', data);
			}
		} catch (error) {
			console.error('An error occurred during team fetch:', error);
		}
	}

	async function FetchBillingUsage() {
		try {
			const response = await fetch(`${apiUrl}/api/v1/billing/usage`, {
				method: 'POST',
				headers: {
					Authorization: `Bearer ${authToken}`,
					'Content-Type': 'application/json'
				},

				body: JSON.stringify({
					range: selectedRange
				})
			});

			const data = await response.json();
			if (response.ok && data) {
				billingUsage = data.data;
				console.log(billingUsage);
			} else {
				console.error('Current Team fetch failed:', data);
			}
		} catch (error) {
			console.error('An error occurred during team fetch:', error);
		}
	}

	async function UpdateBillingSettings() {
		try {
			loading = true;
			const response = await fetch(`${apiUrl}/api/v1/billing/preferences`, {
				method: 'POST',
				headers: {
					Authorization: `Bearer ${authToken}`,
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					credit_topup: topupAmount === '$0' ? 0 : topupAmount.replace('$', ''),
					credit_threshold: topupThreshold === '$0' ? 0 : topupThreshold.replace('$', ''),
					monthly_limit: monthlyBudget === '$0' ? 0 : monthlyBudget.replace('$', '')
				})
			});

			const data = await response.json();
			console.log(data);
			loading = false;
			if (response.ok && data) {
				toasts.success('Billing settings updated successfully');
			} else {
				console.error('Billing settings update failed:', data);
			}
		} catch (error) {
			console.error('An error occurred during billing settings update:', error);
		}
	}

	onMount(() => {
		document.body.style.overflow = 'hidden';
		FetchCurrentTeam();
		FetchBillingUsage();
	});
</script>

<!-- Background Overlay -->
<button
	class="fixed inset-0 z-40 bg-black bg-opacity-20 backdrop-blur-lg"
	onclick={toggleBillingInfoModal}
	aria-label="Close Billing Information Modal"
></button>

<div class="flex items-center justify-center">
	<div
		class="w-[60rem] max-h-[70vh] overflow-y-auto bg-website-dark-primary text-brand-tertiary-gray border border-brand-primary-gray rounded-lg shadow-lg z-50"
		in:scale={{ start: 0.9, duration: 200 }}
		out:fade={{ duration: 150 }}
	>
		<div class="flex items-center justify-between p-4 border-b border-brand-primary-gray">
			<div class="flex items-center gap-x-3">
				<img src={modal_title_icon} alt="modal_title_icon" class="w-6" />
				<h3 class="font-semibold text-left text-white text-md">Billing Details</h3>
			</div>
			<button type="button" class="cursor-pointer w-9" onclick={toggleBillingInfoModal}>
				<img src={modal_cross} alt="Close modal" class="w-6" />
			</button>
		</div>
		<!-- Confirmation Modal -->
		{#if confirmationModal}
			<div class="fixed inset-0 flex items-center justify-center">
				<ConfirmationModal
					title="Confirmation"
					body="Are you sure you want to add credits to your account?"
					footer={[
						{
							text: 'Cancel',
							onClick: toggleConfirmationModal,
							type: 'default'
						},
						{
							text: 'Confirm',
							onClick: () => {
								UpdateCredits();
								toggleConfirmationModal();
							},
							type: 'info'
						}
					]}
					onModalClose={toggleConfirmationModal}
				/>
			</div>
		{/if}
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
			<section class="font-sans antialiased text-white">
				<div class="p-6 rounded-lg">
					{#if !paymentMethodAdded}
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
									{#if loading}
										<div class="flex items-center justify-center mt-2">
											<Spinner class="w-8 h-8" />
										</div>
									{:else}
										<button
											onclick={BillingPortal}
											class="text-sm font-medium text-gray-800 duration-100 ease-in-out hover:text-gray-700 hover:font-bold"
											>Add a Payment Method &rarr;
										</button>
									{/if}
								</div>
							</div>
						</div>
					{/if}
					<div class="space-y-8 divide-y divide-gray-700">
						<div>
							<div class="flex flex-col items-start justify-between gap-4 mb-4 lg:flex-row">
								<div class="w-full p-5 rounded-md bg-website-secondary lg:w-auto">
									<div class="flex items-center gap-x-6">
										<div>
											<p class="text-lg font-bold text-white">Credit Balance</p>
											<p class="text-xl font-bold text-white">
												{`$${credit_balance}`}
											</p>
										</div>
										<button
											onclick={toggleConfirmationModal}
											disabled={loading || !paymentMethodAdded}
											class={`${loading || !paymentMethodAdded ? 'bg-gray-700 cursor-not-allowed' : 'bg-gray-600  hover:bg-gray-700'} px-4 py-2 text-sm font-bold text-white rounded-md `}
										>
											+ Add Credits
										</button>
									</div>
								</div>

								<div class="flex space-x-3">
									<button
										onclick={() => setActiveTab('top-ups')}
										class="px-7 py-2.5 text-sm font-bold text-white rounded-md bg-website-tertiary hover:bg-gray-600"
									>
										Top-up Preferences
									</button>
									<button
										onclick={() => setActiveTab('history')}
										class="px-7 py-2.5 text-sm font-bold text-white rounded-md bg-website-tertiary hover:bg-gray-600"
									>
										Billing History
									</button>
								</div>
							</div>

							<div class="p-4 rounded-md bg-website-secondary">
								<div class="flex items-center justify-between mb-4">
									<p class="text-lg font-bold text-white">Credit Usage</p>
									<select
										onchange={handleRangeChange}
										class="p-2 px-5 text-white rounded-lg bg-website-dark-primary"
									>
										<option value="last_7_days">Last 7 Days</option>
										<option value="last_12_days">Last 12 Days</option>
										<option value="last_30_days">Last 30 Days</option>
										<option value="last_2_months">Last 2 Months</option>
									</select>
								</div>
								<CreditUsageChart
									lineColor={'#22C55E'}
									width={32}
									height={13}
									data={billingUsage}
								/>
							</div>
						</div>

						<div>
							<div class="p-4 mt-8 rounded-md bg-website-secondary">
								<div class="flex items-center justify-between mb-4">
									<p class="text-lg font-bold text-white">Spending By Flow</p>
									<select class="p-2 px-5 text-white rounded-lg bg-website-dark-primary">
										<option value="last_7_days">Last 7 Days</option>
										<option value="last_12_days">Last 12 Days</option>
										<option value="last_30_days">Last 30 Days</option>
										<option value="last_2_months">Last 2 Months</option>
									</select>
								</div>
								<Chart lineColor={'#FFC107'} width={32} height={13} />
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
					<h3 class="max-w-3xl mb-4 text-lg font-semibold">
						We use Stripe to manage your payment methods. You can view and update your payment
						method in the Stripe Dashboard.
					</h3>
					<div class="p-4 rounded-md bg-website-secondary">
						<div class="flex items-center justify-between">
							<p class="mb-4 text-lg font-bold text-white">Payment Method</p>
							{#if loading}
								<button
									class="py-2.5 text-sm font-bold text-white uppercase rounded-md px-28 hover:brightness-75 bg-website-dark-primary"
								>
									<Spinner class="w-8 h-8" />
								</button>
							{:else}
								<button
									onclick={BillingPortal}
									class="px-5 py-2 text-sm font-bold text-white uppercase rounded-md hover:brightness-75 bg-website-dark-primary"
								>
									Manage Payment Method
								</button>
							{/if}
						</div>
						{#if paymentMethodAdded}
							<p class="mb-5 text-gray-300 text-md">Your default payment method is</p>
							<div
								class="py-2 font-bold text-white uppercase border border-gray-600 rounded-md px-7 text-md w-fit"
							>
								{currentTeam.pm_type} **** **** **** {currentTeam.pm_last_four}
							</div>
						{:else}
							<p class="mb-5 text-gray-300 text-md">No payment method has been added yet.</p>
						{/if}
					</div>
				</div>
			</section>
		{/if}

		<!-- top-ups -->
		{#if activeTab === 'top-ups'}
			<section class="font-sans antialiased text-white h-[40rem] overflow-y-auto">
				<div class="p-6 rounded-lg">
					<div class="space-y-8 divide-y divide-gray-700">
						<div class="p-5 rounded-lg bg-website-secondary">
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
												class="absolute hidden min-h-[60px] w-[400px] p-2 mb-2 text-sm text-white rounded-md shadow-lg bg-gray-800 group-hover:block"
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
												class="absolute hidden min-h-[60px] w-[350px] p-3 mb-2 text-sm text-white rounded-md shadow-lg bg-gray-800 group-hover:block"
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
											class="absolute hidden min-h-[80px] w-[300px] p-3 mb-2 text-sm text-white rounded-md shadow-lg bg-gray-800 bottom-full group-hover:block"
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
							{#if loading}
								<button
									class="px-16 py-3 text-sm font-bold text-white bg-gray-600 rounded-md hover:bg-gray-700"
								>
									<Spinner class="w-8 h-8" />
								</button>
							{:else}
								<button
									onclick={UpdateBillingSettings}
									class="px-6 py-3 text-sm font-bold text-white bg-gray-600 rounded-md hover:bg-gray-700"
								>
									Save Settings
								</button>
							{/if}
						</div>
					</div>
				</div>
			</section>
		{/if}

		<!-- history -->
		{#if activeTab === 'history'}
			<section class="font-sans antialiased text-white h-[40rem] overflow-y-auto">
				<div class="p-6 rounded-lg">
					<h3 class="max-w-3xl mb-4 text-lg font-semibold">
						View your billing history for credit topups, flows execution & storage.
					</h3>
					{#if !paymentMethodAdded}
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
									{#if loading}
										<div class="flex items-center justify-center mt-2">
											<Spinner class="w-8 h-8" />
										</div>
									{:else}
										<button
											onclick={BillingPortal}
											class="text-sm font-medium text-gray-800 duration-100 ease-in-out hover:text-gray-700 hover:font-bold"
											>Add a Payment Method &rarr;
										</button>
									{/if}
								</div>
							</div>
						</div>
					{/if}
					<div class="space-y-8 divide-y divide-gray-700">
						<div>
							<div class="p-4 rounded-md bg-website-secondary">
								<div class="flex items-center justify-between mb-4">
									<p class="text-lg font-bold text-white">Credit Top up History</p>
									<select class="p-2 px-5 text-white rounded-lg bg-website-dark-primary">
										<option value="last_7_days">Last 7 Days</option>
										<option value="last_12_days">Last 12 Days</option>
										<option value="last_30_days">Last 30 Days</option>
										<option value="last_2_months">Last 2 Months</option>
									</select>
								</div>
								<Chart lineColor={'#72C9EC'} width={32} height={13} />
							</div>
						</div>

						<div>
							<div class="p-4 mt-8 rounded-md bg-website-secondary">
								<div class="flex items-center justify-between mb-4">
									<p class="text-lg font-bold text-white">Flows Transaction History</p>
									<select class="p-2 px-5 text-white rounded-lg bg-website-dark-primary">
										<option value="last_7_days">Last 7 Days</option>
										<option value="last_12_days">Last 12 Days</option>
										<option value="last_30_days">Last 30 Days</option>
										<option value="last_2_months">Last 2 Months</option>
									</select>
								</div>
								<Chart lineColor={'#833FB4'} width={32} height={13} />
							</div>
						</div>

						<div>
							<div class="p-4 mt-8 rounded-md bg-website-secondary">
								<div class="flex items-center justify-between mb-4">
									<p class="text-lg font-bold text-white">Storage Transaction History</p>
									<select class="p-2 px-5 text-white rounded-lg bg-website-dark-primary">
										<option value="last_7_days">Last 7 Days</option>
										<option value="last_12_days">Last 12 Days</option>
										<option value="last_30_days">Last 30 Days</option>
										<option value="last_2_months">Last 2 Months</option>
									</select>
								</div>
								<Chart lineColor={'#A4771C'} width={32} height={13} />
							</div>
						</div>
					</div>
				</div>
			</section>
		{/if}
	</div>
</div>
