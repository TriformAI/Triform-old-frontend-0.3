<script>
	import logo from '$lib/images/Logo.svg';
	import { page } from '$app/stores';
	import { PUBLIC_API_URL } from '$env/static/public';

	let email = '';
	let password = '';
	let confirmpassword = '';
	let errorMessage = '';
	let successMessage = '';

</script>

<section>
	<div class="flex flex-col items-center justify-center flex-1 h-screen bg-gray-900">
		<a href="/">
			<img alt="triform logo" src={logo} class="w-16 h-16 mx-auto mb-4" />
		</a>
		<div class="p-7 rounded-lg max-w-3xl md:w-[45em] w-[93%] bg-gray-950">
			<form>
				<div class="mt-4">
					<label for="email" class="block mb-1 text-sm text-white">Email</label>
					<input
						id="email"
						type="email"
						bind:value={email}
						required
						class="w-full p-2 text-white placeholder-gray-500 bg-gray-800 rounded-lg"
					/>
				</div>
				<div class="mt-4">
					<label for="password" class="block mb-1 text-sm text-white">Password</label>
					<input
						id="password"
						type="password"
						bind:value={password}
						required
						class="w-full p-2 text-white placeholder-gray-500 bg-gray-800 rounded-lg"
					/>
				</div>
				<div class="mt-4">
					<label for="confirmpassword" class="block mb-1 text-sm text-white">Confirm Password</label
					>
					<input
						id="confirmpassword"
						type="confirmpassword"
						bind:value={confirmpassword}
						required
						class="w-full p-2 text-white placeholder-gray-500 bg-gray-800 rounded-lg"
					/>
				</div>

				<div class="flex items-center justify-end mt-6">
					<button
						type="submit"
						class="px-5 py-2 text-sm font-bold text-white uppercase bg-gray-600 rounded-md"
					>
						<p>Reset Password</p>
					</button>
				</div>
			</form>
		</div>
	</div>
</section>
