<script>
	import { fade, scale } from 'svelte/transition'
	import { PUBLIC_API_URL } from '$env/static/public'

	import account from '$lib/icons/account.svg'
	import billing from '$lib/icons/billings.svg'
	import team_settings from '$lib/icons/team.svg'
	import settings from '$lib/icons/settings.svg'
	import logout from '$lib/icons/logout.svg'
	import { getAuthToken, removeCookie } from '$lib/stores/cookie'
	import { page } from '$app/state'
	import { signOut } from '@auth/sveltekit/client'
	import {
		accountInformationModal,
		profileDropdown,
		billingInformationModal,
		teamInformationModal
	} from '$lib/stores/modals'

	const apiUrl = PUBLIC_API_URL
	const authToken = getAuthToken()

	// Function to handle logout
	async function handleLogout() {
		try {
			if (authToken) {
				// Call the logout API
				const response = await fetch(`${apiUrl}/api/v1/logout`, {
					method: 'POST',
					headers: {
						Authorization: `Bearer ${authToken}`,
						'Content-Type': 'application/json'
					}
				})

				const data = await response.json()
				console.log(data)
				if (response.ok) {
					removeCookie('authToken')
					if (page.data.session) {
						signOut()
					}
					window.location.href = '/login'
				} else {
					console.error('Logout failed:', data)
					return
				}
			} else {
				console.log('No auth token found.')
				window.location.href = '/login'
				return
			}
		} catch (error) {
			console.error('An error occurred during logout:', error)
		}
	}
</script>

<div
	class="absolute right-0 z-50 mt-2 border shadow-lg w-72 bg-website-primary text-brand-white border-brand-primary-gray rounded-2xl"
	in:scale={{ start: 0.9, duration: 200 }}
	out:fade={{ duration: 150 }}
>
	<button
		on:click={() => {
			profileDropdown.set(false)
			accountInformationModal.set(true)
		}}
		class="flex items-center w-full px-10 py-4 text-md gap-x-4 hover:bg-website-tertiary rounded-t-2xl"
	>
		<img src={account} alt="account" class="inline-block w-5" />
		<p>Account</p>
	</button>
	<button
		on:click={() => {
			profileDropdown.set(false)
			billingInformationModal.set(true)
		}}
		class="flex items-center w-full px-10 py-4 text-md gap-x-4 hover:bg-website-tertiary"
	>
		<img src={billing} alt="billing" class="inline-block w-5" />
		<p>Billing</p>
	</button>
	<button
		on:click={() => {
			profileDropdown.set(false)
			teamInformationModal.set(true)
		}}
		class="flex items-center w-full px-10 py-4 text-md gap-x-4 hover:bg-website-tertiary"
	>
		<img src={team_settings} alt="team settings" class="inline-block w-5" />
		<p>Team Settings</p>
	</button>
	<a href=" " class="flex items-center px-10 py-4 text-md gap-x-4 hover:bg-website-tertiary">
		<img src={settings} alt="settings" class="inline-block w-5" />
		<p>Settings</p>
	</a>
	<hr class="border-t-brand-primary-gray" />
	<a
		href=" "
		class="flex items-center py-4 text-md px-11 gap-x-4 hover:bg-website-tertiary rounded-b-2xl"
		on:click|preventDefault={handleLogout}
	>
		<img src={logout} alt="logout" class="inline-block w-4" />
		<p>Logout</p>
	</a>
</div>
