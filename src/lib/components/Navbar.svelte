<script>
	import logo from '$lib/images/Logo.svg';
	import support_icon from '$lib/icons/support.svg';
	import profile_logo from '$lib/images/profile_logo.png';

	import { profileDropdown, notificationOpen, toggleModal } from '$lib/stores/modals';
	import NotificationModal from './modals/NotificationModal.svelte';
	import ProfileDropdown from './modals/ProfileDropdown.svelte';
</script>

<nav
	class="flex items-center justify-between w-full px-10 py-3 text-brand-white bg-website-secondary"
>
	<img alt="triform logo" src={logo} class="relative w-8 lg:w-14" />
	<h1 class="relative text-2xl left-10">Canvas 1</h1>

	<div class="flex items-center gap-x-5">
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
				class="size-8"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0"
				/>
			</svg>

			<!-- Notification Pop-Up -->
			{#if $notificationOpen}
				<NotificationModal />
			{/if}
		</button>

		<!-- Support Icon -->
		<div class="p-2 cursor-pointer hover:bg-website-tertiary rounded-xl">
			<img alt="support icon" src={support_icon} class="w-8" />
		</div>

		<!-- Profile Menu -->
		<div class="relative pl-5 border-l-2 border-l-[#FFFFFF1A]">
			<button
				type="button"
				class="w-8 cursor-pointer"
				aria-label="Profile"
				on:click={() => toggleModal(profileDropdown)}
			>
				<img alt="profile logo" src={profile_logo} class="w-8" />
			</button>

			<!-- Dropdown menu with fade and scale animation -->
			{#if $profileDropdown}
				<ProfileDropdown />
			{/if}
		</div>
	</div>
</nav>
