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

	const apiUrl = PUBLIC_API_URL;
	const authToken = getAuthToken();
	const profile = {};
	const session = $page.data.session;
	let name = $state('');
	let email = $state('');
	let profilePic = $state('');
	let updateStatus = $state('Save');
	let confirmationModal = $state(false);
	let passwordResetModal = $state(false);
	let profilePicLoading = $state(false);
	let uploadStatus = $state('');
	let linkedToGithub = $state(false);

	console.log(authToken);

	let { toggleAccountInfoModal } = $props();

	function toggleConfirmationModal() {
		confirmationModal = !confirmationModal;
	}

	function togglePasswordResetModal() {
		if (linkedToGithub) {
			toasts.add({
				title: 'Password Change',
				description: 'You cannot change your password because your account is linked to GitHub',
				duration: 5000,
				placement: 'top-right',
				type: 'info',
				theme: 'dark'
			});
			return;
		}
		passwordResetModal = !passwordResetModal;
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
			console.log(data);
			if (response.ok && data.data) {
				Object.assign(profile, data.data);
				name = profile.name;
				email = profile.email;
				linkedToGithub = profile.github_token ? true : false;
				profilePic = profile.profile_photo_url;
			}
			if (!response.ok) {
				console.error('Profile fetch failed:', data);
				return;
			}
		} catch (error) {
			console.error('An error occurred during profile fetch:', error);
		}
	}

	async function deleteAccount() {
		try {
			const response = await fetch(`${apiUrl}/api/v1/user/profile`, {
				method: 'DELETE',
				headers: {
					Authorization: `Bearer ${authToken}`,
					'Content-Type': 'application/json'
				}
			});

			const data = await response.json();
			if (response.ok) {
				console.log(data);
				removeCookie('authToken');

				if ($page.data.session) {
					//user signed in with github
					signOut();
					window.location.href = '/login';
				}
				window.location.href = '/login';
			}
			if (!response.ok) {
				console.error('Account deletion failed:', data);
				return;
			}
		} catch (error) {
			console.error('An error occurred during account deletion:', error);
		}
	}

	async function updateProfilePic(file) {
		try {
			profilePicLoading = true;
			const formData = new FormData();
			if (file instanceof File) {
				formData.append('name', name);
				formData.append('email', email);
				formData.append('photo', file);
			}
			const response = await fetch(`${apiUrl}/api/v1/user/profile`, {
				method: 'POST',
				headers: {
					Authorization: `Bearer ${authToken}`
				},
				body: formData
			});

			const data = await response.json();
			console.log(data);
			profilePicLoading = false;
			if (response.ok && data.data && data.data.profile_photo_url) {
				profilePic = data.data.profile_photo_url;
			}
			if (!response.ok) {
				uploadStatus = data.errors;
				console.error('Profile picture update failed:', data);
				return;
			}
		} catch (error) {
			console.error('An error occurred during profile picture update:', error);
		}
	}

	async function updateAccount() {
		try {
			updateStatus = 'Saving...';

			// Prepare multipart form data
			const formData = new FormData();
			formData.append('name', name);
			formData.append('email', email);

			const response = await fetch(`${apiUrl}/api/v1/user/profile`, {
				method: 'POST',
				headers: {
					Authorization: `Bearer ${authToken}`
				},
				body: formData
			});

			const data = await response.json();
			if (response.ok) {
				updateStatus = 'Saved!';
				setTimeout(() => {
					updateStatus = 'Save';
				}, 2000);
			} else {
				console.error('Account update failed:', data);
			}
		} catch (error) {
			console.error('An error occurred during account update:', error);
		}
	}

	onMount(() => {
		fetchProfile();
	});

	onMount(() => {
		document.body.style.overflow = 'hidden';
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
				<h3 class="font-semibold text-left text-white text-md">Account Details</h3>
			</div>
			<button type="button" class="cursor-pointer w-9" onclick={toggleAccountInfoModal}>
				<img src={modal_cross} alt="Close modal" class="w-6" />
			</button>
		</div>

		<section class="font-sans antialiased text-white">
			<!-- Confirmation Modal -->
			{#if confirmationModal}
				<div class="fixed inset-0 flex items-center justify-center">
					<ConfirmationModal
						title="Confirmation"
						body="Are you sure you want to delete this module?"
						footer={[
							{
								text: 'Cancel',
								onClick: toggleConfirmationModal,
								type: 'default'
							},
							{
								text: 'Delete',
								onClick: () => {
									deleteAccount();
								},
								type: 'error'
							}
						]}
						onModalClose={toggleConfirmationModal}
					/>
				</div>
			{/if}

			<!-- Password Modal -->
			{#if passwordResetModal}
				<div class="fixed inset-0 flex items-center justify-center">
					<PasswordResetModal {togglePasswordResetModal} />
				</div>
			{/if}
			<div class="w-full p-6 py-8 mx-auto md:max-w-6xl">
				<!-- Profile Information Section -->
				<h2 class="mb-1 font-semibold text-md">Profile Information</h2>
				<p class="mb-6 text-gray-400">
					Update your account's profile information and email address.
				</p>

				<div class="w-full p-6 mb-8 rounded-lg bg-website-secondary">
					<div class="flex items-center mb-4">
						{#if profilePicLoading}
							<div class="mx-5 mr-14">
								<Spinner />
							</div>
						{:else}
							<img src={profilePic} alt="profilePic" class="mr-10 rounded-full w-14" />
						{/if}
						<label
							class="px-4 py-2 text-white rounded-md cursor-pointer bg-brand-primary-gray hover:brightness-90"
						>
							Select a New Photo
							<input
								type="file"
								class="hidden"
								onchange={(e) => {
									updateProfilePic(e.target.files[0]);
								}}
							/>
						</label>
						<p class="ml-10 text-sm text-primary-red">{uploadStatus}</p>
					</div>
					<form>
						<div class="mb-4">
							<label class="block mb-1 text-sm font-medium" for="name">Name</label>
							<input
								id="name"
								type="text"
								class="w-full p-3 text-white border border-gray-600 rounded-md bg-website-dark-primary"
								bind:value={name}
							/>
						</div>
						<div class="mb-4">
							<label class="block mb-1 text-sm font-medium" for="email">Email</label>
							<input
								id="email"
								type="email"
								class="w-full p-3 text-white border border-gray-600 rounded-md bg-website-dark-primary"
								bind:value={email}
							/>
						</div>
						<div class="flex items-center justify-end">
							<button
								onclick={updateAccount}
								type="submit"
								class="py-2 text-white rounded-md px-7 bg-brand-primary-gray hover:brightness-90"
								>{updateStatus}</button
							>
						</div>
					</form>
				</div>

				<!-- Change Password Section -->

				<h2 class="mb-1 font-semibold text-md">Change Password</h2>
				<p class="mb-6 text-gray-400">Change your current password</p>
				<div class="w-full p-6 mb-12 rounded-lg bg-website-secondary">
					<p class="mb-6 text-gray-400">
						Ensure your account is secure by using a long, random password. Use a password manager
						to generate and store your passwords. Please note that you can only change your password
						if your account is not registered with GitHub.
					</p>
					<div class="flex items-center justify-end">
						<button
							onclick={togglePasswordResetModal}
							class={` ${linkedToGithub ? 'bg-primary-green brightness-50 cursor-not-allowed' : 'bg-primary-green hover:brightness-90'} px-4 py-2 text-white rounded-md `}
							>Change Password</button
						>
					</div>
				</div>

				<!-- Delete Account Section -->

				<h2 class="mb-1 font-semibold text-md">Delete Account</h2>
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
