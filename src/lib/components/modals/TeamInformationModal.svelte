<script>
	import { fade, scale } from 'svelte/transition';
	import { signOut } from '@auth/sveltekit/client';
	import { removeCookie } from '$lib/stores/cookie';
	import modal_title_icon from '$lib/icons/Modal_Title_Icon.svg';
	import modal_cross from '$lib/icons/modal_cross.svg';
	import { PUBLIC_API_URL } from '$env/static/public';
	import { PUBLIC_PRODUCTION } from '$env/static/public';
	import profile_logo from '$lib/images/profile_logo.png';
	import { getAuthToken } from '$lib/stores/cookie';
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import ConfirmationModal from '$lib/components/modals/ConfirmationModal.svelte';
	import PasswordResetModal from './PasswordResetModal.svelte';
	import Spinner from '$lib/components/Spinner.svelte';
	import { toasts } from 'svelte-toasts';
	import { profilePic } from '$lib/stores/profile';

	const apiUrl = PUBLIC_API_URL;
	const production = PUBLIC_PRODUCTION === 'true' ? true : false;
	const authToken = getAuthToken();
	const profile = $state({});
	let teamName = $state({});
	let updateStatus = $state('Save');

	let confirmationModal = $state(false);
	let profilePicLoading = $state(false);

	let { toggleTeamInfoModal } = $props();
	let currentTeam = $state({});

	function toggleConfirmationModal() {
		confirmationModal = !confirmationModal;
	}

	async function fetchProfile() {
		try {
			const response = await fetch(`${apiUrl}/api/v1/user/profile`, {
				method: 'GET',
				headers: {
					Authorization: `Bearer ${authToken}`,
					'Content-Type': 'application/json'
				}
			});

			const data = await response.json();
			if (response.ok && data.data) {
				Object.assign(profile, data.data);
			}
			if (!response.ok) {
				console.error('Profile fetch failed:', data);
				return;
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
				teamName = data.data.name;
			} else {
				console.error('Current Team fetch failed:', data);
			}
		} catch (error) {
			console.error('An error occurred during team fetch:', error);
		}
	}

	async function updateTeamName() {
		try {
			updateStatus = 'Saving...';
			const response = await fetch(`${apiUrl}/api/v1/teams/${currentTeam.id}`, {
				method: 'PATCH',
				headers: {
					Authorization: `Bearer ${authToken}`,
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					name: teamName
				})
			});

			const data = await response.json();

			if (response.ok && data) {
				toasts.success('Team name updated successfully');
				updateStatus = 'Saved!';
				setTimeout(() => {
					updateStatus = 'Save';
				}, 2000);
			} else {
				updateStatus = 'Save';
				console.error('Team name update failed:', data);
			}
		} catch (error) {
			updateStatus = 'Save';
			console.error('An error occurred during team name update:', error);
		}
	}

	onMount(() => {
		document.body.style.overflow = 'hidden';
		fetchProfile();
		FetchCurrentTeam();
	});
</script>

<!-- Background Overlay -->
<div class="fixed inset-0 z-40 bg-black bg-opacity-20 backdrop-blur-lg"></div>

<div class="flex items-center justify-center">
	<div
		class="w-[60rem] max-h-[70vh] overflow-y-auto bg-website-dark-primary text-brand-tertiary-gray border border-brand-primary-gray rounded-lg shadow-lg z-50"
		in:scale={{ start: 0.9, duration: 200 }}
	>
		<!-- Modal Header -->
		<div class="flex items-center justify-between p-4 border-b border-brand-primary-gray">
			<div class="flex items-center gap-x-3">
				<img src={modal_title_icon} alt="modal_title_icon" class="w-6" />
				<h3 class="font-semibold text-left text-white text-md">Team Details</h3>
			</div>
			<button type="button" class="cursor-pointer w-9" onclick={toggleTeamInfoModal}>
				<img src={modal_cross} alt="Close modal" class="w-6" />
			</button>
		</div>
		{#if confirmationModal}
			<div class="fixed inset-0 z-50 flex items-center justify-center">
				<ConfirmationModal
					title="Confirmation"
					body="Are you sure you want to delete this team?"
					footer={[
						{
							text: 'Cancel',
							onClick: toggleConfirmationModal,
							type: 'default'
						},
						{
							text: 'Delete',
							onClick: () => {
								console.log('delete');
							},
							type: 'error'
						}
					]}
					onModalClose={toggleConfirmationModal}
				/>
			</div>
		{/if}

		<section class="font-sans antialiased text-white">
			<div class="w-full p-6 py-8 mx-auto md:max-w-6xl">
				<!-- Team Information Section -->
				<h2 class="mb-1 font-semibold text-md">Team Information</h2>
				<p class="mb-6 text-gray-400">
					Update your account's profile information and email address.
				</p>

				<div class="w-full p-6 mb-8 rounded-lg bg-website-secondary">
					<p class="mb-2 text-gray-400">Team Owner</p>
					<div class="flex items-center mb-4">
						{#if profilePicLoading}
							<div class="mx-5 mr-14">
								<Spinner />
							</div>
						{:else}
							<img
								src={production ? $profilePic : profile_logo}
								alt="profilePic"
								class="rounded-full mr-7 w-14"
							/>
						{/if}
						<div class="flex flex-col">
							<h3 class="text-lg font-semibold">{profile.name}</h3>
							<p class="">{profile.email}</p>
						</div>
					</div>
					<form>
						<div class="mb-4">
							<label class="block mb-1 text-sm font-medium" for="name">Team Name</label>
							<input
								id="name"
								type="text"
								class="w-full p-3 text-white border border-gray-600 rounded-md bg-website-dark-primary"
								bind:value={teamName}
							/>
						</div>
						<div class="flex items-center justify-end">
							<button
								onclick={updateTeamName}
								type="submit"
								class="py-2 text-white rounded-md px-7 bg-brand-primary-gray hover:brightness-90"
								>{updateStatus}</button
							>
						</div>
					</form>
				</div>

				<!-- Delete Account Section -->

				<h2 class="mb-1 font-semibold text-md">Delete Team</h2>
				<p class="mb-6 text-gray-400">Permanently delete your account.</p>
				<div class="w-full p-6 rounded-lg bg-website-secondary">
					<p class="mb-6 text-gray-400">
						Once your account is deleted, all of its resources and data will be permanently deleted.
						Before deleting your account, please download any data or information that you wish to
						retain.
					</p>
					<div class="flex items-center justify-end">
						<button
							onclick={toggleConfirmationModal}
							class="px-4 py-2 text-white rounded-md bg-primary-red hover:brightness-90"
							>Delete Account</button
						>
					</div>
				</div>
			</div>
		</section>
	</div>
</div>
