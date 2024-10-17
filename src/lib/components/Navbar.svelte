<script>
	import { fade, scale } from 'svelte/transition';
	import logo from '../images/Logo.svg';
	import support_icon from '../icons/support.svg';
	import profile_logo from '../images/profile_logo.png';
	import account from '../icons/account.svg';
	import billing from '../icons/billings.svg';
	import team_settings from '../icons/team.svg';
	import settings from '../icons/settings.svg';
	import logout from '../icons/logout.svg';

	let dropdownOpen = false;

	// Toggle dropdown visibility
	const toggleDropdown = () => {
		dropdownOpen = !dropdownOpen;
	};
</script>

<nav
	class="flex items-center justify-between w-full px-10 py-3 text-brand-white bg-website-secondary"
>
	<img alt="triform logo" src={logo} class="relative w-8 lg:w-14" />
	<h1 class="relative text-3xl left-10">Canvas 1</h1>

	<div class="flex items-center gap-x-5">
		<div class="p-2 cursor-pointer hover:bg-website-tertiary rounded-xl">
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
		</div>
		<div class="p-2 cursor-pointer hover:bg-website-tertiary rounded-xl">
			<img alt="support icon" src={support_icon} class="w-8" />
		</div>
		<div class="relative pl-5 border-l-2 border-l-[#FFFFFF1A]">
			<button
				type="button"
				class="w-8 cursor-pointer"
				on:click={toggleDropdown}
				aria-label="Profile"
			>
				<img alt="profile logo" src={profile_logo} class="w-8" />
			</button>

			<!-- Dropdown menu with fade and scale animation -->
			{#if dropdownOpen}
				<div
					class="absolute right-0 mt-2 w-72 bg-website-secondary text-brand-white border border-[#FFFFFF1A] rounded-2xl shadow-lg z-50 "
					in:scale={{ start: 0.9, duration: 200 }}
					out:fade={{ duration: 150 }}
				>
					<a
						href="#"
						class="flex items-center px-10 py-4 text-lg gap-x-4 hover:bg-website-tertiary rounded-t-2xl"
					>
						<img src={account} alt="account" class="inline-block w-6" />
						<p>Account</p>
					</a>
					<a
						href="#"
						class="flex items-center px-10 py-4 text-lg gap-x-4 hover:bg-website-tertiary "
					>
						<img src={billing} alt="billing" class="inline-block w-6" />
						<p>Billing</p>
					</a>
					<a
						href="#"
						class="flex items-center px-10 py-4 text-lg gap-x-4 hover:bg-website-tertiary "
					>
						<img src={team_settings} alt="team settings" class="inline-block w-6" />
						<p>Team Settings</p>
					</a>
					<a
						href="#"
						class="flex items-center px-10 py-4 text-lg gap-x-4 hover:bg-website-tertiary "
					>
						<img src={settings} alt="settings" class="inline-block w-6" />
						<p>Settings</p>
					</a>
					<hr class="border-t-[#FFFFFF1A]" />
					<a
						href="#"
						class="flex items-center py-4 text-lg px-11 gap-x-4 hover:bg-website-tertiary rounded-b-2xl"
					>
						<img src={logout} alt="logout" class="inline-block w-4" />
						<p>Logout</p>
					</a>
				</div>
			{/if}
		</div>
	</div>
</nav>
