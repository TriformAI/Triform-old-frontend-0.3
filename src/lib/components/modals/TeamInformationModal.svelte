<script>
	import { fade, scale } from 'svelte/transition';
	import modal_title_icon from '$lib/icons/Modal_Title_Icon.svg';
	import modal_cross from '$lib/icons/modal_cross.svg';
	import { PUBLIC_API_URL } from '$env/static/public';
	import { PUBLIC_PRODUCTION } from '$env/static/public';
	import profile_logo from '$lib/images/profile_logo.png';
	import { getAuthToken } from '$lib/stores/cookie';
	import { onMount } from 'svelte';
	import ConfirmationModal from '$lib/components/modals/ConfirmationModal.svelte';
	import Spinner from '$lib/components/Spinner.svelte';
	import { toasts } from 'svelte-toasts';
	import { profilePic } from '$lib/stores/profile';

	const apiUrl = PUBLIC_API_URL;
	const production = PUBLIC_PRODUCTION === 'true' ? true : false;
	const authToken = getAuthToken();
	const profile = $state({});
	let teamName = $state({});
	let updateStatus = $state('Save');
	let addingStatus = $state('Invite');

	let confirmationModal = $state(false);
	let profilePicLoading = $state(false);
	let email = $state('');
	let role = $state('admin');

	let { toggleTeamInfoModal } = $props();
	let currentTeam = $state({});
	let invitations = $state([]);

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
				toasts.success(`Team name updated to ${teamName}`);
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

	async function fetchInvitations() {
		try {
			const response = await fetch(`${apiUrl}/api/v1/invitations`, {
				method: 'GET',
				headers: {
					Authorization: `Bearer ${authToken}`,
					'Content-Type': 'application/json'
				}
			});

			const data = await response.json();
			if (response.ok && data.data) {
				invitations = data.data;
			}
			if (!response.ok) {
				console.error('Invitations fetch failed:', data);
				return;
			}
		} catch (error) {
			console.error('An error occurred during invitations fetch:', error);
		}
	}

	async function createInvitation() {
		if (!email) {
			toasts.error('Please enter an email address');
			return;
		}

		if (!role && !currentTeam) {
			return;
		}

		//validate email
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(email)) {
			toasts.error('Please enter a valid email address');
			return;
		}

		try {
			addingStatus = 'Sending...';
			const response = await fetch(`${apiUrl}/api/v1/teams/${currentTeam.id}/invite`, {
				method: 'POST',
				headers: {
					Authorization: `Bearer ${authToken}`,
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					email,
					role
				})
			});

			const data = await response.json();

			if (response.ok && data.type === 'success') {
				fetchInvitations();
				toasts.success(`Team invitation sent to ${email}`);
				addingStatus = 'Sent!';
				setTimeout(() => {
					addingStatus = 'Add';
				}, 2000);
			}
			if (!response.ok) {
				addingStatus = 'Add';
				console.error('Invitation creation failed:', data);
				return;
			}
		} catch (error) {
			addingStatus = 'Add';
			console.error('An error occurred during invitation creation:', error);
		}
	}

	async function declineInvitation(id) {
		try {
			const response = await fetch(`${apiUrl}/api/v1/invitations/${id}`, {
				method: 'DELETE',
				headers: {
					Authorization: `Bearer ${authToken}`,
					'Content-Type': 'application/json'
				}
			});

			const data = await response.json();
			if (response.ok && data) {
				fetchInvitations();
			}
			if (!response.ok) {
				console.error('Invitation decline failed:', data);
				return;
			}
		} catch (error) {
			console.error('An error occurred during invitation decline:', error);
		}
	}

	onMount(() => {
		document.body.style.overflow = 'hidden';
		fetchProfile();
		FetchCurrentTeam();
		fetchInvitations();
	});
</script>

<!-- Background Overlay -->
<button
	class="fixed inset-0 z-40 bg-black bg-opacity-20 backdrop-blur-lg"
	onclick={toggleTeamInfoModal}
	aria-label="Close Team Information Modal"
></button>

<div class="flex items-center justify-center">
	<div
		class="w-[60rem] max-h-[70vh] overflow-y-auto bg-website-dark-primary text-brand-tertiary-gray border border-brand-primary-gray rounded-lg shadow-lg z-50"
		in:scale={{ start: 0.9, duration: 200 }}
		out:fade={{ duration: 150 }}
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

				<!-- Add Team Member Section -->
				<h2 class="mb-1 font-semibold text-md">Add Team Member</h2>
				<p class="mb-6 text-gray-400">
					Add a new team member to your team, allowing them to collaborate with you.
				</p>
				<div class="w-full p-6 mb-8 rounded-lg bg-website-secondary">
					<div class="mb-4">
						<label class="block mb-1 text-sm font-medium" for="email">Email</label>
						<input
							bind:value={email}
							id="email"
							type="email"
							class="w-full p-3 text-white border border-gray-600 rounded-md bg-website-dark-primary"
						/>
					</div>
					<div class="mb-4">
						<p class="block mb-1 text-sm font-medium">Role</p>
						<div class="mt-4 border border-white divide-y rounded-lg divide-y-white">
							<div
								class="p-4 cursor-pointer hover:bg-white/5"
								onclick={() => (role = 'admin')}
								onkeydown={(e) => e.key === 'Enter' && (role = 'admin')}
								role="button"
								tabindex="0"
							>
								<div class="flex items-start w-full gap-x-4">
									<h3 class="text-sm text-white">Administrator</h3>
									{#if role === 'admin'}
										<div class="relative bottom-1">
											<svg
												xmlns="http://www.w3.org/2000/svg"
												fill="none"
												viewBox="0 0 24 24"
												stroke-width="1.5"
												stroke="#22C55E"
												class="size-6"
											>
												<path
													stroke-linecap="round"
													stroke-linejoin="round"
													d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
												/>
											</svg>
										</div>
									{/if}
								</div>
								<p class="mt-1 text-xs text-gray-400">
									Administrator users can perform any action.
								</p>
							</div>
							<div
								class="p-4 cursor-pointer hover:bg-white/5"
								onclick={() => (role = 'editor')}
								onkeydown={(e) => e.key === 'Enter' && (role = 'editor')}
								role="button"
								tabindex="0"
							>
								<div class="flex items-start w-full gap-x-4">
									<h3 class="text-sm text-white">Editor</h3>
									{#if role === 'editor'}
										<div class="relative bottom-1">
											<svg
												xmlns="http://www.w3.org/2000/svg"
												fill="none"
												viewBox="0 0 24 24"
												stroke-width="1.5"
												stroke="#22C55E"
												class="size-6"
											>
												<path
													stroke-linecap="round"
													stroke-linejoin="round"
													d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
												/>
											</svg>
										</div>
									{/if}
								</div>
								<p class="mt-1 text-xs text-gray-400">
									Editors users have the ability to read, create and update
								</p>
							</div>
						</div>
					</div>
					<div class="flex items-center justify-end">
						<button
							onclick={createInvitation}
							disabled={!currentTeam && !role}
							type="submit"
							class="px-4 py-2 text-white rounded-md bg-brand-primary-gray hover:brightness-90"
							>{addingStatus}</button
						>
					</div>
				</div>

				{#if invitations.length > 0}
					<h2 class="mb-1 font-semibold text-md">Pending Team Invitations</h2>
					<p class="mb-6 text-gray-400">
						These people have been invited to your team and have been sent an invitation email. They
						may join the team by accepting the email invitation.
					</p>
					<div class="w-full p-6 mb-8 rounded-lg bg-website-secondary">
						<div class="flex items-center justify-between w-full">
							{#each invitations as invitation}
								<p class="text-gray-400">{invitation.email}</p>
								<button
									onclick={() => declineInvitation(invitation.id)}
									class="px-4 py-2 text-xs border rounded-md text-primary-red border-primary-red hover:brightness-90"
									>Cancel</button
								>
							{/each}
						</div>
					</div>
				{/if}

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
