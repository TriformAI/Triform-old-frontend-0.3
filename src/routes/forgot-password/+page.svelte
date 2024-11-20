<script>
	import logo from '$lib/images/Logo.svg';
	import { PUBLIC_API_URL } from '$env/static/public';

	let email = '';
	let errorMessage = '';
	let successMessage = '';

	async function handlePasswordReset(event) {
		event.preventDefault(); // Prevent default form submission

		errorMessage = '';
		successMessage = '';

		try {
			const apiUrl = PUBLIC_API_URL;
			const response = await fetch(`${apiUrl}/api/v1/forgot-password`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ email })
			});
			const data = await response.json();
			console.log('Response data', data);
			if (response.ok) {
				successMessage = 'Password reset link has been sent to your email.';
				email = '';
			} else {
				const errorData = await response.json();
				errorMessage = errorData.errors.email || 'Failed to send password reset link.';
			}
		} catch (error) {
			errorMessage = 'An error occurred. Please try again later.';
			console.error('Error:', error);
		}
	}
</script>

<section>
	<div class="flex flex-col items-center justify-center flex-1 h-screen bg-gray-900">
		<a href="/">
			<img alt="triform logo" src={logo} class="w-16 h-16 mx-auto mb-4" />
		</a>
		<div class="p-7 rounded-lg max-w-3xl md:w-[45em] w-[93%] bg-gray-950">
			<div class="mb-6 text-sm text-gray-600">
				Forgot your password? No problem. Just let us know your email address, and we will email you
				a password reset link that will allow you to choose a new one.
			</div>

			<form on:submit={handlePasswordReset}>
				<div class="mt-4">
					<label for="email" class="block mb-1 text-sm text-white">Email</label>
					<input
						id="email"
						type="email"
						bind:value={email}
						required
						class="w-full p-2 text-white placeholder-gray-500 bg-gray-800 rounded-lg"
					/>
					<span id="email-error" class="text-sm text-red-500">{errorMessage}</span>
					<span id="email-success" class="text-sm text-green-500">{successMessage}</span>
				</div>

				<div class="flex items-center justify-end mt-6">
					<button
						type="submit"
						class="px-5 py-2 text-sm font-bold text-white uppercase bg-gray-600 rounded-md"
					>
						<p>Email Password Reset Link</p>
					</button>
				</div>
			</form>
		</div>
	</div>
</section>
