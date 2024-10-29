<script>
	import logo from '$lib/images/Logo.svg';
	import github_mark_logo from '$lib/images/github-mark-white.svg';
	let showPassword = $state(false);
	let showConfirmPassword = $state(false);
</script>

<section>
	<div class="flex items-center justify-center flex-1 h-screen bg-gray-900">
		<div>
			<a href="/">
				<img alt="triform logo" src={logo} class="w-16 h-16 mx-auto mb-4" />
			</a>
			<div
				class="space-y-4 bg-gray-950 p-10 md:w-[26em] w-full rounded-xl shadow-xl border animate-border"
			>
				<form id="register-form">
					<div class="my-4 space-y-2">
						<label for="name" class="block text-sm text-white">Name</label>
						<input
							id="name"
							type="text"
							name="name"
							required
							class="w-full p-2 text-white placeholder-gray-500 bg-gray-800 rounded-lg"
						/>
						<span id="name-error" class="text-sm text-red-500"></span>
					</div>
					<div class="my-4 space-y-2">
						<label for="email" class="block text-sm text-white">Email Address</label>
						<input
							id="email"
							type="email"
							name="email"
							required
							class="w-full p-2 text-white placeholder-gray-500 bg-gray-800 rounded-lg"
						/>
						<span id="email-error" class="text-sm text-red-500"></span>
					</div>
					<div class="my-4 space-y-2">
						<label for="password" class="block text-sm text-white">Password</label>
						<div class="relative">
							<input
								id="password"
								type={showPassword ? 'text' : 'password'}
								name="password"
								required
								class="w-full p-2 text-white placeholder-gray-500 bg-gray-800 rounded-lg"
							/>
							{#if !showPassword}
								<button
									aria-label="Show Password"
									class="absolute inset-y-0 w-5 right-3"
									onclick={() => (showPassword = !showPassword)}
								>
									<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512">
										<path
											fill="#ffffff"
											d="M288 80c-65.2 0-118.8 29.6-159.9 67.7C89.6 183.5 63 226 49.4 256c13.6 30 40.2 72.5 78.6 108.3C169.2 402.4 222.8 432 288 432s118.8-29.6 159.9-67.7C486.4 328.5 513 286 526.6 256c-13.6-30-40.2-72.5-78.6-108.3C406.8 109.6 353.2 80 288 80zM95.4 112.6C142.5 68.8 207.2 32 288 32s145.5 36.8 192.6 80.6c46.8 43.5 78.1 95.4 93 131.1c3.3 7.9 3.3 16.7 0 24.6c-14.9 35.7-46.2 87.7-93 131.1C433.5 443.2 368.8 480 288 480s-145.5-36.8-192.6-80.6C48.6 356 17.3 304 2.5 268.3c-3.3-7.9-3.3-16.7 0-24.6C17.3 208 48.6 156 95.4 112.6zM288 336c44.2 0 80-35.8 80-80s-35.8-80-80-80c-.7 0-1.3 0-2 0c1.3 5.1 2 10.5 2 16c0 35.3-28.7 64-64 64c-5.5 0-10.9-.7-16-2c0 .7 0 1.3 0 2c0 44.2 35.8 80 80 80zm0-208a128 128 0 1 1 0 256 128 128 0 1 1 0-256z"
										/>
									</svg>
								</button>
							{:else}
								<button
									aria-label="Hide Password"
									class="absolute inset-y-0 w-5 right-3"
									onclick={() => (showPassword = !showPassword)}
								>
									<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512">
										<path
											fill="#ffffff"
											d="M38.8 5.1C28.4-3.1 13.3-1.2 5.1 9.2S-1.2 34.7 9.2 42.9l592 464c10.4 8.2 25.5 6.3 33.7-4.1s6.3-25.5-4.1-33.7L525.6 386.7c39.6-40.6 66.4-86.1 79.9-118.4c3.3-7.9 3.3-16.7 0-24.6c-14.9-35.7-46.2-87.7-93-131.1C465.5 68.8 400.8 32 320 32c-68.2 0-125 26.3-169.3 60.8L38.8 5.1zm151 118.3C226 97.7 269.5 80 320 80c65.2 0 118.8 29.6 159.9 67.7C518.4 183.5 545 226 558.6 256c-12.6 28-36.6 66.8-70.9 100.9l-53.8-42.2c9.1-17.6 14.2-37.5 14.2-58.7c0-70.7-57.3-128-128-128c-32.2 0-61.7 11.9-84.2 31.5l-46.1-36.1zM394.9 284.2l-81.5-63.9c4.2-8.5 6.6-18.2 6.6-28.3c0-5.5-.7-10.9-2-16c.7 0 1.3 0 2 0c44.2 0 80 35.8 80 80c0 9.9-1.8 19.4-5.1 28.2zm9.4 130.3C378.8 425.4 350.7 432 320 432c-65.2 0-118.8-29.6-159.9-67.7C121.6 328.5 95 286 81.4 256c8.3-18.4 21.5-41.5 39.4-64.8L83.1 161.5C60.3 191.2 44 220.8 34.5 243.7c-3.3 7.9-3.3 16.7 0 24.6c14.9 35.7 46.2 87.7 93 131.1C174.5 443.2 239.2 480 320 480c47.8 0 89.9-12.9 126.2-32.5l-41.9-33zM192 256c0 70.7 57.3 128 128 128c13.3 0 26.1-2 38.2-5.8L302 334c-23.5-5.4-43.1-21.2-53.7-42.3l-56.1-44.2c-.2 2.8-.3 5.6-.3 8.5z"
										/>
									</svg>
								</button>
							{/if}
						</div>
						<span id="password-error" class="text-sm text-red-500"></span>
					</div>
					<div class="my-4 space-y-2">
						<label for="password_confirmation" class="block text-sm text-white"
							>Confirm Password</label
						>
						<div class="relative">
							<input
								id="password_confirmation"
								type={showConfirmPassword ? 'text' : 'password'}
								name="password_confirmation"
								required
								class="w-full p-2 text-white placeholder-gray-500 bg-gray-800 rounded-lg"
							/>
							{#if !showConfirmPassword}
								<button
									class="absolute inset-y-0 w-5 right-3"
									aria-label="Show Password"
									onclick={() => (showConfirmPassword = !showConfirmPassword)}
								>
									<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512">
										<path
											fill="#ffffff"
											d="M288 80c-65.2 0-118.8 29.6-159.9 67.7C89.6 183.5 63 226 49.4 256c13.6 30 40.2 72.5 78.6 108.3C169.2 402.4 222.8 432 288 432s118.8-29.6 159.9-67.7C486.4 328.5 513 286 526.6 256c-13.6-30-40.2-72.5-78.6-108.3C406.8 109.6 353.2 80 288 80zM95.4 112.6C142.5 68.8 207.2 32 288 32s145.5 36.8 192.6 80.6c46.8 43.5 78.1 95.4 93 131.1c3.3 7.9 3.3 16.7 0 24.6c-14.9 35.7-46.2 87.7-93 131.1C433.5 443.2 368.8 480 288 480s-145.5-36.8-192.6-80.6C48.6 356 17.3 304 2.5 268.3c-3.3-7.9-3.3-16.7 0-24.6C17.3 208 48.6 156 95.4 112.6zM288 336c44.2 0 80-35.8 80-80s-35.8-80-80-80c-.7 0-1.3 0-2 0c1.3 5.1 2 10.5 2 16c0 35.3-28.7 64-64 64c-5.5 0-10.9-.7-16-2c0 .7 0 1.3 0 2c0 44.2 35.8 80 80 80zm0-208a128 128 0 1 1 0 256 128 128 0 1 1 0-256z"
										/>
									</svg>
								</button>
							{:else}
								<button
									class="absolute inset-y-0 w-5 right-3"
									aria-label="Hide Password"
									onclick={() => (showConfirmPassword = !showConfirmPassword)}
								>
									<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512">
										<path
											fill="#ffffff"
											d="M38.8 5.1C28.4-3.1 13.3-1.2 5.1 9.2S-1.2 34.7 9.2 42.9l592 464c10.4 8.2 25.5 6.3 33.7-4.1s6.3-25.5-4.1-33.7L525.6 386.7c39.6-40.6 66.4-86.1 79.9-118.4c3.3-7.9 3.3-16.7 0-24.6c-14.9-35.7-46.2-87.7-93-131.1C465.5 68.8 400.8 32 320 32c-68.2 0-125 26.3-169.3 60.8L38.8 5.1zm151 118.3C226 97.7 269.5 80 320 80c65.2 0 118.8 29.6 159.9 67.7C518.4 183.5 545 226 558.6 256c-12.6 28-36.6 66.8-70.9 100.9l-53.8-42.2c9.1-17.6 14.2-37.5 14.2-58.7c0-70.7-57.3-128-128-128c-32.2 0-61.7 11.9-84.2 31.5l-46.1-36.1zM394.9 284.2l-81.5-63.9c4.2-8.5 6.6-18.2 6.6-28.3c0-5.5-.7-10.9-2-16c.7 0 1.3 0 2 0c44.2 0 80 35.8 80 80c0 9.9-1.8 19.4-5.1 28.2zm9.4 130.3C378.8 425.4 350.7 432 320 432c-65.2 0-118.8-29.6-159.9-67.7C121.6 328.5 95 286 81.4 256c8.3-18.4 21.5-41.5 39.4-64.8L83.1 161.5C60.3 191.2 44 220.8 34.5 243.7c-3.3 7.9-3.3 16.7 0 24.6c14.9 35.7 46.2 87.7 93 131.1C174.5 443.2 239.2 480 320 480c47.8 0 89.9-12.9 126.2-32.5l-41.9-33zM192 256c0 70.7 57.3 128 128 128c13.3 0 26.1-2 38.2-5.8L302 334c-23.5-5.4-43.1-21.2-53.7-42.3l-56.1-44.2c-.2 2.8-.3 5.6-.3 8.5z"
										/>
									</svg>
								</button>
							{/if}
						</div>
						<span id="password-confirmation-error" class="text-sm text-red-500"></span>
					</div>
					<button
						type="button"
						id="register-button"
						class="flex items-center justify-center w-full py-2 mt-3 text-white bg-gray-800 rounded-lg gap-x-2 hover:bg-gray-700"
					>
						<svg
							id="register-icon"
							width="20px"
							height="20px"
							viewBox="0 0 24 24"
							fill="none"
							xmlns="http://www.w3.org/2000/svg"
							stroke="#ffffff"
						>
							<g id="SVGRepo_bgCarrier" stroke-width="0"></g>
							<g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g>
							<g id="SVGRepo_iconCarrier">
								<path
									d="M12 20C16.4183 20 20 16.4183 20 12C20 7.58172 16.4183 4 12 4"
									stroke="#ffffff"
									stroke-width="1.5"
									stroke-linecap="round"
								></path>
								<path
									d="M4 12H14M14 12L11 9M14 12L11 15"
									stroke="#ffffff"
									stroke-width="1.5"
									stroke-linecap="round"
									stroke-linejoin="round"
								></path>
							</g>
						</svg>
						<span id="register-text">Create Account</span>
						<svg
							id="register-loader"
							class="hidden w-5 h-5 text-white animate-spin"
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
						>
							<circle
								class="opacity-25"
								cx="12"
								cy="12"
								r="10"
								stroke="currentColor"
								stroke-width="4"
							></circle>
							<path
								class="opacity-75"
								fill="currentColor"
								d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.964 7.964 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
							>
							</path>
						</svg>
					</button>
				</form>
				<div class="flex items-center justify-center my-4">
					<div class="flex-1 border-t border-gray-500"></div>
					<span class="mx-4 text-gray-500">OR</span>
					<div class="flex-1 border-t border-gray-500"></div>
				</div>
				<a
					href=" "
					class="flex items-center justify-center px-2 py-3 bg-gray-800 border-4 border-gray-700 rounded-full hover:bg-gray-700"
				>
					<div class="w-6 h-6">
						<img src={github_mark_logo} alt="Github" class="object-contain w-full h-full" />
					</div>
					<p class="mx-3 font-mono text-xs font-bold tracking-tighter text-white sm:text-sm">
						Register with Github
					</p>
					<p><x-heroicon-o-arrow-right class="w-5 h-5 text-white"></x-heroicon-o-arrow-right></p>
				</a>
				<h3 class="text-xs text-center text-gray-400 truncate">
					Already have an account <a
						href="/login"
						class="font-bold text-gray-200 cursor-pointer hover:underline">Login</a
					>
				</h3>
			</div>
		</div>
	</div>
</section>

<style>
	@keyframes borderAnimation {
		0% {
			border-color: #71c8ec;
		}

		50% {
			border-color: #833fb4;
		}

		100% {
			border-color: #71c8ec;
		}
	}

	.animate-border {
		animation: borderAnimation 4s infinite;
	}
</style>
