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
	import comment from '../icons/comment.svg';
	import cross from '../icons/cross.svg';
	import warning from '../icons/warning.svg';
	import { dropdownOpen, notificationOpen } from '../../stores/modals';



	// toggle dropdown menu
	function toggleDropdown() {
		dropdownOpen.update(value => !value); // Correct toggling
	}

	// toggle notification menu
	function toggleNotification() {
		notificationOpen.update(value => !value); // Correct toggling
	}
	
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
			on:click={toggleNotification}
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
				<div
					class="absolute right-0 mt-2 w-96 bg-website-secondary text-brand-white border border-[#FFFFFF1A] rounded-2xl shadow-lg z-50"
					in:scale={{ start: 0.9, duration: 200 }}
					out:fade={{ duration: 150 }}
					
				>
					<div class="">
						<h3 class="p-6 text-xl font-semibold text-left border-b border-[#FFFFFF1A]">
							Notifications
						</h3>
						<ul class="text-lg bg-website-primary rounded-b-2xl">
							<li
								class="flex items-baseline justify-between p-7 border-b border-b-[#FFFFFF1A] hover:bg-white/5"
							>
								<div class="flex items-baseline text-left gap-x-3">
									<!-- Placeholder for Status Icon -->
									<img src={comment} alt="comment" class="relative w-7 top-1" />
									<div>
										<h4 class="font-bold">System Status Notification</h4>
										<p class="text-sm text-[#9CA3AF]">
											Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet.
										</p>
									</div>
								</div>
								<span class="text-xs text-[#9CA3AF] flex-shrink-0">2h ago</span>
							</li>
							<li
								class="flex items-start justify-between p-7 border-b border-b-[#FFFFFF1A] hover:bg-white/5"
							>
								<div class="flex items-start text-left gap-x-3">
									<!-- Placeholder for Error Icon -->
									<img src={cross} alt="cross" class="relative w-7 top-1" />

									<div>
										<h4 class="font-bold">Error Notification</h4>
										<p class="text-sm text-[#9CA3AF]">
											Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet.
										</p>
									</div>
								</div>
								<span class="text-xs text-[#9CA3AF] flex-shrink-0">2h ago</span>
							</li>
							<li class="flex items-start justify-between p-7 hover:bg-white/5 rounded-b-2xl">
								<div class="flex items-start text-left gap-x-3">
									<!-- Placeholder for Performance Issue Icon -->
									<img src={warning} alt="warning" class="relative w-7 top-1" />

									<div>
										<h4 class="font-bold">Performance Issue Notification</h4>
										<p class="text-sm text-[#9CA3AF]">
											Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet.
										</p>
									</div>
								</div>
								<span class="text-xs text-[#9CA3AF] flex-shrink-0">2h ago</span>
							</li>
						</ul>
					</div>
				</div>
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
				on:click={toggleDropdown}
			>
				<img alt="profile logo" src={profile_logo} class="w-8" />
			</button>

			<!-- Dropdown menu with fade and scale animation -->
			{#if $dropdownOpen}
				<div
					class="absolute right-0 mt-2 w-72 bg-website-secondary text-brand-white border border-[#FFFFFF1A] rounded-2xl shadow-lg z-50"
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
						class="flex items-center px-10 py-4 text-lg gap-x-4 hover:bg-website-tertiary"
					>
						<img src={billing} alt="billing" class="inline-block w-6" />
						<p>Billing</p>
					</a>
					<a
						href="#"
						class="flex items-center px-10 py-4 text-lg gap-x-4 hover:bg-website-tertiary"
					>
						<img src={team_settings} alt="team settings" class="inline-block w-6" />
						<p>Team Settings</p>
					</a>
					<a
						href="#"
						class="flex items-center px-10 py-4 text-lg gap-x-4 hover:bg-website-tertiary"
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
