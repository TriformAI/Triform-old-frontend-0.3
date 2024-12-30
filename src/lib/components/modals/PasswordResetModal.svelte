<script lang="ts">
	import { scale } from 'svelte/transition'
	import { onDestroy } from 'svelte'
	import modal_title_icon from '$lib/icons/Modal_Title_Icon.svg'
	import modal_cross from '$lib/icons/modal_cross.svg'
	import { PUBLIC_API_URL } from '$env/static/public'
	import { getAuthToken } from '$lib/stores/cookie'

	let { togglePasswordResetModal } = $props()
	let current_password = $state('')
	let new_password = $state('')
	let confirm_new_password = $state('')
	const apiUrl = PUBLIC_API_URL
	const authToken = getAuthToken()
	let changePasswordStatus = $state('Change Password')
	let error: string[] = $state([])

	async function changePassword() {
		if (!current_password || !new_password || !confirm_new_password) {
			// push error message to error array
			error.push('All fields are required')
			setTimeout(() => {
				error = []
			}, 3000)
			return
		}

		if (new_password !== confirm_new_password) {
			// push error message to error array
			error.push('Passwords do not match')
			setTimeout(() => {
				error = []
			}, 3000)
			return
		}
		// API call to change password
		try {
			changePasswordStatus = 'Changing...'
			const response = await fetch(`${apiUrl}/api/v1/user/password`, {
				method: 'PATCH',
				headers: {
					Authorization: `Bearer ${authToken}`,
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					current_password,
					password: new_password,
					password_confirmation: confirm_new_password
				})
			})

			const data = await response.json()
			console.log(data)
			if (response.ok) {
				changePasswordStatus = 'Changed'
				setTimeout(() => {
					togglePasswordResetModal()
				}, 1000)
			} else {
				changePasswordStatus = 'Change Password'
				error.push(data.errors.current_password[0])
				setTimeout(() => {
					error = []
				}, 3000)
			}
		} catch (error) {
			console.error(error)
		}
	}

	onDestroy(() => {
		document.body.style.overflow = 'auto' // Enable scrolling
	})
</script>

<!-- Background Overlay -->
<div
	class="fixed inset-0 z-40 bg-black bg-opacity-20 backdrop-blur-lg"
	onclick={togglePasswordResetModal}
	onkeydown={() => {}}
	role="button"
	aria-label="Close modal"
	tabindex="0"
></div>

<div class="flex items-center justify-center">
	<div
		class="w-[50rem] bg-website-secondary text-brand-tertiary-gray border border-brand-primary-gray rounded-lg shadow-lg z-50"
		in:scale={{ start: 0.9, duration: 200 }}
		out:scale={{ duration: 150 }}
	>
		<!-- Modal Header -->
		<div class="flex items-center justify-between p-4 border-b border-brand-primary-gray">
			<div class="flex items-center gap-x-3">
				<img src={modal_title_icon} alt="modal title icon" class="w-6" />
				<h3 class="font-semibold text-left text-white text-md">Password Reset</h3>
			</div>
			<button type="button" class="cursor-pointer w-9" onclick={togglePasswordResetModal}>
				<img src={modal_cross} alt="Close modal" class="w-6" />
			</button>
		</div>

		<form class="p-4">
			<div class="mb-4">
				<label class="block mb-1 text-sm font-medium" for="name">Current Password</label>
				<input
					id="current_password"
					type="password"
					class="w-full p-3 text-white border border-gray-600 rounded-md bg-website-dark-primary"
					bind:value={current_password}
				/>
			</div>
			<div class="mb-4">
				<label class="block mb-1 text-sm font-medium" for="email">New Password</label>
				<input
					id="new_password"
					type="password"
					class="w-full p-3 text-white border border-gray-600 rounded-md bg-website-dark-primary"
					bind:value={new_password}
				/>
			</div>
			<div class="mb-4">
				<label class="block mb-1 text-sm font-medium" for="email">Confirm New Password</label>
				<input
					id="confirm_new_password"
					type="password"
					class="w-full p-3 text-white border border-gray-600 rounded-md bg-website-dark-primary"
					bind:value={confirm_new_password}
				/>
			</div>
			<div class="flex items-center justify-center">
				{#each error as message}
					<p class="text-sm text-center text-red-500">{message}</p>
				{/each}
			</div>
		</form>

		<!-- Modal Footer -->
		<div class="flex justify-end gap-4 p-3 border-t border-brand-primary-gray">
			<button
				onclick={changePassword}
				class="px-4 py-2 text-white rounded-md bg-primary-green hover:brightness-90"
				>{changePasswordStatus}</button
			>
		</div>
	</div>
</div>
