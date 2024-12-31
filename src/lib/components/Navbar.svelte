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

	import { openModal, ModalId } from '$lib/stores/modals.svelte'

	import {
		profileDropdown,
		notificationOpen,
		toggleModal,
		renameMode,
		shareCanvaModal
	} from '$lib/stores/modals'
	import NotificationModal from './modals/NotificationModal.svelte'
	import ProfileDropdown from './modals/ProfileDropdown.svelte'
	import { tabs, activeTabId, addTab, removeTab, setActiveTab } from '$lib/stores/canvas'
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

	function handleDragStart(event, tab) {
		draggedTab = tab
		event.dataTransfer.effectAllowed = 'move'
	}

	function handleDragOver(event) {
		event.preventDefault()
		event.dataTransfer.dropEffect = 'move'
	}

	function handleDrop(event, targetTab) {
		event.preventDefault()
		if (draggedTab && draggedTab.id !== targetTab.id) {
			tabs.update(currentTabs => {
				const draggedIndex = currentTabs.findIndex(t => t.id === draggedTab.id)
				const targetIndex = currentTabs.findIndex(t => t.id === targetTab.id)

				// Swap the positions of the dragged and target tabs
				;[currentTabs[draggedIndex], currentTabs[targetIndex]] = [
					currentTabs[targetIndex],
					currentTabs[draggedIndex]
				]

				return [...currentTabs] // Trigger reactivity
			})
		}
		draggedTab = null // Reset the dragged tab
	}
</script>

{#if $renameMode}
	<button
		aria-label="Blur Div"
		onclick={() => renameMode.update(() => false)}
		class="fixed inset-0 z-40 bg-black top-14 bg-opacity-30 backdrop-blur-lg"
	></button>
{/if}

<nav
	class="flex items-center justify-between w-full px-10 py-2 text-brand-white bg-website-secondary"
>
	<div class="flex items-center overflow-auto gap-x-4">
		<img alt="triform logo" src={logo} class="relative w-7 lg:w-12" />

		<div class="flex gap-2 overflow-x-auto">
			{#each $tabs as tab}
				<div
					class={`flex items-center flex-grow px-4 py-1.5 truncate duration-200 ease-in-out rounded-md cursor-pointer group gap-x-2 ${tab.id === $activeTabId && !$renameMode && 'bg-website-tertiary'} hover:bg-website-tertiary `}
					role="tab"
					tabindex="0"
					onclick={() => setActiveTab(tab.id)}
					onkeydown={e => e.key === 'Enter' && setActiveTab(tab.id)}
					draggable="true"
					ondragstart={event => handleDragStart(event, tab)}
					ondragover={handleDragOver}
					ondrop={event => handleDrop(event, tab)}
				>
					{#if tab.id === $activeTabId}
						<div class="p-1 mr-2 rounded-full animate-pulse bg-primary-red"></div>
					{/if}
					{#if $renameMode && tab.id === $activeTabId}
						<input
							class="px-3 py-2 text-xs bg-transparent border rounded-lg border-brand-secondary-gray"
							value={tab.label}
							oninput={e => (tab.label = e.target.value)}
						/>
					{:else}
						<h1
							class={`text-xs truncate ${tab.id === $activeTabId ? 'min-w-28 w-full' : 'min-w-20 w-fit'}`}
						>
							{tab.label}
						</h1>
					{/if}
					<button
						aria-label="Close Tab"
						class="w-6 duration-200 ease-in-out opacity-0 cursor-pointer group-hover:opacity-100"
						onclick={e => {
							e.stopPropagation()
							if ($tabs.length > 1) removeTab(tab.id)
						}}
					>
						<img src={modal_cross} alt="Close" class="w-5 ml-auto" />
					</button>
				</div>
			{/each}
		</div>

		<button
			type="button"
			class="pl-5 border-l cursor-pointer border-l-brand-primary-gray"
			onclick={addTab}
		>
			<img src={add} alt="add" class="w-5" />
		</button>
	</div>

	<div class="flex items-center gap-x-5">
		<button
			onclick={() => openModal(ModalId.ShareCanvasModal)}
			class={`w-fit flex items-center justify-center flex-shrink-0 gap-x-3 px-4 py-1.5 text-sm font-medium text-brand-tertiary-gray hover:text-white transition duration-200 ease-in-out border rounded-lg bg-white/5 border-brand-light-gray hover:border-brand-tertiary-gray`}
		>
			Share Canvas
		</button>

		<!-- Notification Bell Icon -->
		<button
			class={`relative p-2 cursor-pointer hover: ${notificationOpen && 'bg-website-tertiary'} rounded-xl`}
			onclick={() => toggleModal(notificationOpen)}
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				fill="none"
				viewBox="0 0 24 24"
				stroke-width="1.5"
				stroke="currentColor"
				class="size-5"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0"
				/>
			</svg>

			{#if $notificationOpen}
				<NotificationModal />
			{/if}
		</button>

		<div class="p-2 cursor-pointer hover:bg-website-tertiary rounded-xl">
			<img alt="support icon" src={support_icon} class="w-5" />
		</div>

		<div class="relative pl-5 border-l-2 border-l-brand-primary-gray">
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
