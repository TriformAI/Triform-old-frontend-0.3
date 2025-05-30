<script lang="ts">
	import Button from '$lib/components/atoms/Button.svelte'

	import { toast } from 'svelte-sonner'
	import { onMount } from 'svelte'
	import logo from '$lib/images/Logo.svg'
	import DiscordIcon from '~icons/bxl/discord-alt'
	import GithubIcon from '~icons/bxl/github'
	import { PUBLIC_TRICORE_AUTH_URL } from '$env/static/public'
	const providers = [
		{
			name: 'Discord',
			icon: DiscordIcon
		},
		{
			name: 'Github',
			icon: GithubIcon
		}
	]

	const apiUrl = PUBLIC_TRICORE_AUTH_URL

	// Disable others
	let chosenProvider = $state<string | null>(null)

	const onLogin = (provider: (typeof providers)[number]) => {
		chosenProvider = provider.name
		localStorage.setItem('lastLoginOption', provider.name)
		// Return a promise that never resolves so the button starts loading while we're redirecting the user
		return new Promise(() => {})
	}

	let lastOption = $state<string>()
	onMount(() => {
		lastOption = localStorage.getItem('lastLoginOption') ?? ''
		// Parse out error from query string
		const error = new URLSearchParams(window.location.search).get('error')
		console.log('error', error)
		if (error) {
			toast.error(`Error logging in: ${error}`)
		}
	})
</script>

<svelte:head>
	<title>Login | Triform</title>
</svelte:head>

<div class="bg-main-900 flex h-screen w-screen grid-rows-[auto_1fr] flex-col justify-center">
	<figure class="mx-auto mt-6">
		<img src={logo} alt="Triform logo" class="size-12" />
	</figure>

	<div class="m-auto">
		<p class="mb-6 text-center">
			<span class=" text-main-400 text-center">Please login to continue</span>
		</p>

		<div class="flex w-xs flex-col items-center gap-y-4">
			{#each providers as provider}
				<div class="relative w-full">
					<Button
						class="peer w-full"
						href={`${apiUrl}/login/${provider.name.toLowerCase()}/authorize`}
						onClick={() => onLogin(provider)}
						autoLoad="promise"
						disabled={chosenProvider === provider.name}
					>
						{#snippet icon()}
							<provider.icon />
						{/snippet}
						{#snippet body()}
							{provider.name}
						{/snippet}
					</Button>
					{#if provider.name === lastOption}
						<span
							class={[
								'absolute -top-2 -right-5 px-3 py-1',
								'text-accent-200 bg-accent-700 border-accent-600 rounded-full border inset-shadow-xs',
								'text-xs font-bold tracking-wider uppercase',
								'peer-hover:bg-accent-600 peer-hover:border-accent-500 peer-hover:text-accent-50 transition'
							]}
						>
							Last
						</span>
					{/if}
				</div>
			{/each}
		</div>
	</div>
</div>
