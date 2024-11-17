<script context="module">
	import { browser } from '$app/environment'; // Import to check if the code is running on the client
</script>

<script>
	// @ts-nocheck

	import logo from '$lib/images/Logo.svg';
	import support_icon from '$lib/icons/support.svg';
	import profile_logo from '$lib/images/profile_logo.png';
	import modal_cross from '$lib/icons/modal_cross.svg';
	import add from '$lib/icons/add.svg';
	import { page } from '$app/stores';
	import {
		profileDropdown,
		notificationOpen,
		toggleModal,
		renameMode,
		shareCanvaModal
	} from '$lib/stores/modals';
	import NotificationModal from './modals/NotificationModal.svelte';
	import ProfileDropdown from './modals/ProfileDropdown.svelte';
	import Button from './Button.svelte';
	import { onMount } from 'svelte';

	let tabs = [{ id: 1, label: 'Canvas 1' }];
	let nextTabId = 2;
	let activeTabId = 1;
	let profilePic = null;

	// @ts-ignore
	let draggedTab = null; // Track the dragged tab

	onMount(() => {
		if (browser) {
			const session = $page.data.session;
			if (session) {
				profilePic = session.user.image;
			}
		}
	});

	function addTab() {
		tabs = [...tabs, { id: nextTabId, label: `Canvas ${nextTabId}` }];
		activeTabId = nextTabId;
		nextTabId += 1;
	}

	function removeTab(id) {
		tabs = tabs.filter((tab) => tab.id !== id);
		if (id === activeTabId && tabs.length > 0) {
			activeTabId = tabs[0].id;
		} else if (tabs.length === 0) {
			// @ts-ignore
			activeTabId = null;
		}
	}

	function setActiveTab(id) {
		activeTabId = id;
	}

	function handleDragStart(event, tab) {
		draggedTab = tab; // Store the dragged tab
		event.dataTransfer.effectAllowed = 'move';
	}

	function handleDragOver(event) {
		event.preventDefault();
		event.dataTransfer.dropEffect = 'move';
	}

	function handleDrop(event, targetTab) {
		event.preventDefault();
		if (draggedTab && draggedTab.id !== targetTab.id) {
			const draggedIndex = tabs.findIndex((t) => t.id === draggedTab.id);
			const targetIndex = tabs.findIndex((t) => t.id === targetTab.id);

			// Swap the positions of the dragged and target tabs
			[tabs[draggedIndex], tabs[targetIndex]] = [tabs[targetIndex], tabs[draggedIndex]];
			tabs = [...tabs]; // Trigger reactivity
		}
		draggedTab = null; // Reset the dragged tab
	}
</script>

{#if $renameMode}
	<button
		aria-label="Blur Div"
		on:click={() => renameMode.update((value) => false)}
		class="fixed inset-0 z-40 bg-black top-20 bg-opacity-30 backdrop-blur-lg"
	></button>
{/if}

<nav
	class="flex items-center justify-between w-full px-10 py-3 text-brand-white bg-website-secondary"
>
	<div class="flex items-center overflow-auto gap-x-10">
		<img alt="triform logo" src={logo} class="relative w-8 lg:w-14" />

		<div class="flex gap-2 overflow-x-auto">
			{#each tabs as tab}
				<a
					href=" "
					class={`flex items-center flex-grow px-4 py-2 truncate duration-200 ease-in-out rounded-lg cursor-pointer group gap-x-2 ${tab.id === activeTabId && !$renameMode && 'bg-website-tertiary'} hover:bg-website-tertiary `}
					on:click={() => setActiveTab(tab.id)}
					draggable="true"
					on:dragstart={(event) => handleDragStart(event, tab)}
					on:dragover={handleDragOver}
					on:drop={(event) => handleDrop(event, tab)}
				>
					{#if tab.id === activeTabId}
						<div class="p-1 mr-2 rounded-full animate-pulse bg-primary-red"></div>
					{/if}
					{#if $renameMode && tab.id === activeTabId}
						<input
							type="text"
							class="px-3 py-2 bg-transparent border rounded-lg text-md border-brand-secondary-gray"
							value={tab.label}
							on:input={(e) => (tab.label = e.target.value)}
						/>
					{:else}
						<h1 class={`text-lg truncate ${tab.id === activeTabId ? 'min-w-28 w-full' : 'w-fit'}`}>
							{tab.label}
						</h1>
					{/if}
					<button
						type="button"
						aria-label="Close Tab"
						class="duration-200 ease-in-out opacity-0 cursor-pointer w-7 group-hover:opacity-100"
						on:click={(e) => {
							e.stopPropagation();
							if (tabs.length > 1) removeTab(tab.id);
						}}
					>
						<img src={modal_cross} alt="Close" class="w-6" />
					</button>
				</a>
			{/each}
		</div>

		<button
			type="button"
			class="pl-5 border-l cursor-pointer border-l-brand-primary-gray"
			on:click={addTab}
		>
			<img src={add} alt="add" class="w-5 mr-5" />
		</button>
	</div>

	<div class="flex items-center gap-x-5">
		<button
			on:click={() => toggleModal(shareCanvaModal)}
			class={`w-fit flex items-center justify-center flex-shrink-0 gap-x-3 px-6 py-2 text-md font-medium text-brand-tertiary-gray hover:text-white transition duration-200 ease-in-out border rounded-lg bg-white/5 border-brand-light-gray hover:border-brand-tertiary-gray`}
		>
			Share Canva
		</button>

		<!-- Notification Bell Icon -->
		<button
			class={`relative p-2 cursor-pointer hover: ${notificationOpen && 'bg-website-tertiary'} rounded-xl`}
			on:click={() => toggleModal(notificationOpen)}
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				fill="none"
				viewBox="0 0 24 24"
				stroke-width="1.5"
				stroke="currentColor"
				class="size-6"
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
			<img alt="support icon" src={support_icon} class="w-6" />
		</div>

		<div class="relative pl-5 border-l-2 border-l-brand-primary-gray">
			<button
				type="button"
				class="w-8 cursor-pointer"
				aria-label="Profile"
				on:click={() => toggleModal(profileDropdown)}
			>
				<img alt="profile logo" src={profilePic || profile_logo} class="w-8 rounded-full" />
			</button>

			{#if $profileDropdown}
				<ProfileDropdown />
			{/if}
		</div>
	</div>
</nav>
