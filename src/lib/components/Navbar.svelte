<script module>
	import { browser } from '$app/environment' // Import to check if the code is running on the client
</script>

<script lang="ts">
	// @ts-nocheck
	import logo from '$lib/images/Logo.svg'
	import support_icon from '$lib/icons/support.svg'
	import profile_logo from '$lib/images/profile_logo.png'
	import modal_cross from '$lib/icons/modal_cross.svg'
	import add from '$lib/icons/add.svg'
	import { PUBLIC_API_URL } from '$env/static/public'
	import { PUBLIC_PRODUCTION } from '$env/static/public'
	import { getAuthToken } from '$lib/stores/cookie'
	import { profilePic } from '$lib/stores/profile'
	import Spinner from './Spinner.svelte'

	import Button from '$lib/components/atoms/Button.svelte'

	import { openModal, ModalId } from '$lib/stores/modals.svelte'

	import {
		profileDropdown,
		toggleModal
	} from '$lib/stores/modals'
	import ProfileDropdown from './old-modals/ProfileDropdown.svelte'
	import { onMount } from 'svelte'

	let draggedTab = null // Track the dragged tab
	const apiUrl = PUBLIC_API_URL
	const authToken = getAuthToken()
	let loading = $state(false)
	const production = PUBLIC_PRODUCTION === 'true' ? true : false

	async function fetchProfile() {
		try {
			loading = true
			const response = await fetch(`${apiUrl}/api/v1/user/profile`, {
				method: 'GET',
				headers: {
					Authorization: `Bearer ${authToken}`,
					'Content-Type': 'application/json'
				}
			})

			const data = await response.json()
			loading = false
			if (response.ok && data.data) {
				if (browser) {
					profilePic.set(data.data.profile_photo_url)
				}
			}
			if (!response.ok) {
				console.error('Profile fetch failed:', data)
				return
			}
		} catch (error) {
			console.error('An error occurred during profile fetch:', error)
		}
	}

	onMount(() => {
		fetchProfile()
	})
</script>

<nav
	class="flex items-center justify-between w-full px-8 py-2 bg-zinc-900 border-b border-b-zinc-700"
>
	<div class="flex items-center overflow-auto gap-x-4">
		<img alt="triform logo" src={logo} class="relative w-8 lg:w-12" />
	</div>

	<div class="flex items-center gap-x-5">
		<Button
			onClick={() => openModal(ModalId.ShareCanvas)}
		>
			{#snippet body()}
				Share canvas
			{/snippet}
		</Button>

		<div class="relative pl-5 border-l border-l-zinc-700">
			{#if $profilePic === null || loading}
				<Spinner class="w-8 h-8" />
			{:else}
				<button
					type="button"
					class="w-8 cursor-pointer"
					aria-label="Profile"
					onclick={() => toggleModal(profileDropdown)}
				>
					<img
						alt="profile logo"
						src={production ? $profilePic : profile_logo}
						class="w-8 rounded-full"
					/>
				</button>
			{/if}

			{#if $profileDropdown}
				<ProfileDropdown />
			{/if}
		</div>
	</div>
</nav>
