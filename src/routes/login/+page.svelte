<script lang="ts">
	import Button from '$lib/components/atoms/Button.svelte'

	import { toast } from 'svelte-sonner'
	import { onMount } from 'svelte'

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
		// Return a promise that never resolves so the button starts loading while we're redirecting the user
		return new Promise(() => {})
	}

	onMount(() => {
		// Parse out error from query string
		const error = new URLSearchParams(window.location.search).get('error')
		console.log('error', error)
		if (error) {
			toast.error(`Error logging in: ${error}`)
		}
	})
</script>

<div class="flex h-screen w-screen flex-col items-center justify-center bg-zinc-900">
	<p class="mb-4 text-center text-zinc-400">Continue with</p>

	<div class="flex w-full max-w-xs flex-col items-center gap-y-4">
		{#each providers as provider}
			<Button
				class="w-full"
				href={`${apiUrl}/login/${provider.name.toLowerCase()}/authorize`}
				onClick={() => onLogin(provider)}
				autoLoad={true}
				disabled={chosenProvider === provider.name}
			>
				{#snippet icon()}
					<provider.icon />
				{/snippet}
				{#snippet body()}
					{provider.name}
				{/snippet}
			</Button>
		{/each}
	</div>
</div>
