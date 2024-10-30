<script>
	import logo from '$lib/images/Logo.svg';
</script>

<section>
	<div class="flex flex-col items-center justify-center flex-1 h-screen bg-gray-900">
		<a href="/">
			<img alt="triform logo" src={logo} class="w-16 h-16 mx-auto mb-4" />
		</a>
		<div class=" p-10 rounded-lg max-w-3xl md:w-[45em] w-[93%] bg-gray-950">

			<div class="mb-6 text-lg text-gray-600">
				Forgot your password? No problem. Just let us know your email address and we will email you
				a password reset link that will allow you to choose a new one.
			</div>

			<form method="POST" action=" ">
				<div class="mt-4 ">
					<label for="email" class="block mb-1 text-lg text-white">Email</label>
					<input
						id="email"
						type="email"
						name="email"
						required
						class="w-full p-2 text-white placeholder-gray-500 bg-gray-800 rounded-lg"
					/>
					<span id="email-error" class="text-sm text-red-500"></span>
				</div>

				<div class="flex items-center justify-end mt-6">
					<button class="px-5 py-2 text-sm font-bold text-white uppercase bg-gray-600 rounded-md">
						<p>Email Password Reset Link</p>
					</button>
				</div>
			</form>
		</div>
	</div>
</section>
