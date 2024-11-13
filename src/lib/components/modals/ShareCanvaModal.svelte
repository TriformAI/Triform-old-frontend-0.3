<script>
	import { fade, scale } from 'svelte/transition';
	import Button from '$lib/components/Button.svelte';
	import modal_title_icon from '$lib/icons/Modal_Title_Icon.svg';
	import modal_cross from '$lib/icons/modal_cross.svg';
	import profile_logo from '$lib/images/profile_logo.png';
	import { PUBLIC_API_URL } from '$env/static/public';
	import { getAuthToken } from '$lib/stores/cookie';
	import { onMount } from 'svelte';

	export let toggleShareCanvaModal;

	onMount(() => {
		document.body.style.overflow = 'hidden'; // Disable scrolling
	});
</script>

<!-- Background Overlay -->
<div
	class="fixed inset-0 z-40 bg-black bg-opacity-20 backdrop-blur-lg"
	out:fade={{ duration: 150 }}
></div>

<div class="relative flex items-center justify-center top-20">
	<div
		class="w-[40rem] bg-website-secondary text-brand-tertiary-gray border border-brand-primary-gray rounded-lg shadow-lg z-50"
		in:scale={{ start: 0.9, duration: 200 }}
		out:fade={{ duration: 150 }}
	>
		<!-- Modal Header -->
		<div class="flex items-center justify-between p-6 border-b border-brand-primary-gray">
			<div class="flex items-center gap-x-3">
				<img src={modal_title_icon} alt="modal_title_icon" class="w-6" />
				<h3 class="text-xl font-semibold text-left text-white">Share Canva</h3>
			</div>
			<button type="button" class="w-8 cursor-pointer" onclick={toggleShareCanvaModal}>
				<img src={modal_cross} alt="Close modal" class="w-8" />
			</button>
		</div>

		<!-- Modal Body -->
		<div class="p-6">
			<div class="flex items-center gap-x-4">
				<button
					class={`flex items-center justify-center flex-shrink-0 gap-x-3 px-4 py-2.5 text-sm font-medium text-brand-tertiary-gray hover:text-white transition duration-200 ease-in-out border rounded-lg bg-white/5 border-brand-primary-gray hover:border-brand-light-gray`}
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
							d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 0 1 1.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 0 0-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 0 1-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 0 0-3.375-3.375h-1.5a1.125 1.125 0 0 1-1.125-1.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H9.75"
						/>
					</svg>
					<span>Copy Link</span>
				</button>
				<div class="relative w-full">
					<input
						id="invite-link"
						type="text"
						placeholder="Invite users by name or email..."
						class="w-full px-4 py-2.5 text-md bg-[#1D1E1F] border rounded-lg border-brand-primary-gray"
					/>
					<button
						class={`w-fit absolute ml-auto inset-0 px-4 py-2.5 text-md font-medium text-brand-tertiary-gray hover:text-white transition duration-200 ease-in-out border rounded-y-lg rounded-r-lg bg-[#262728] hover:bg-white/10 border-brand-primary-gray`}
					>
						Invite
					</button>
				</div>
			</div>
			<div>
				<div class="flex items-center pt-8">
					<img alt="profile logo" src={profile_logo} class="w-8 mr-3" />
					<h4 class="text-lg text-white">Iggy</h4>
					<select
						id="Label"
						placeholder="Type here..."
						class="px-4 py-3 w-[15rem] ml-auto border rounded-md bg-[#1D1E1F] border-brand-primary-gray"
					>
						<option>Admin</option>
						<option>Admin 2</option>
						<option>Admin 3</option>
					</select>
				</div>
				<div class="flex items-center pt-8">
					<img alt="profile logo" src={profile_logo} class="w-8 mr-3" />
					<h4 class="text-lg text-white">Iggy</h4>
					<select
						id="Label"
						placeholder="Type here..."
						class="px-4 py-3 w-[15rem] ml-auto border rounded-md bg-[#1D1E1F] border-brand-primary-gray"
					>
						<option>Admin</option>
						<option>Admin 2</option>
						<option>Admin 3</option>
					</select>
				</div>
				<div class="flex items-center pt-8">
					<img alt="profile logo" src={profile_logo} class="w-8 mr-3" />
					<h4 class="text-lg text-white">Iggy</h4>
					<select
						id="Label"
						placeholder="Type here..."
						class="px-4 py-3 w-[15rem] ml-auto border rounded-md bg-[#1D1E1F] border-brand-primary-gray"
					>
						<option>Admin</option>
						<option>Admin 2</option>
						<option>Admin 3</option>
					</select>
				</div>
			</div>
		</div>
	</div>
</div>
