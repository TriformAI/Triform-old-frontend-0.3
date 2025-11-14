<script lang="ts">
	import Button from '$lib/components/atoms/Button.svelte'

	import { toast } from 'svelte-sonner'
	import { onMount } from 'svelte'
	import logo from '$lib/images/Logo.svg'
	import DiscordIcon from '~icons/bxl/discord-alt'
	import GithubIcon from '~icons/bxl/github'
	import GoogleIcon from '~icons/bxl/google'
	import MicrosoftIcon from '~icons/bxl/microsoft'
	import MailIcon from '~icons/material-symbols/mail-rounded'
	import { authClient } from '$lib/auth-client'
	import InputField from '$lib/components/atoms/InputField.svelte'
	import IconBack from '~icons/material-symbols/arrow-back-rounded'
	import IconSend from '~icons/material-symbols/send-rounded'
	import { blur } from 'svelte/transition'

	const isInAppBrowser = $derived(
		typeof window !== 'undefined' &&
			(/FBAN|FBAV|Instagram|Twitter|LinkedInApp|wv|MicroMessenger/i.test(
				window.navigator.userAgent
			) ||
				('standalone' in window.navigator &&
					(window.navigator as { standalone?: boolean }).standalone === false))
	)

	const providers = $derived([
		{
			name: 'Discord',
			key: 'discord',
			icon: DiscordIcon,
			show: true
		},
		{
			name: 'Github',
			key: 'github',
			icon: GithubIcon,
			show: true
		},
		{
			name: 'Google',
			key: 'google',
			icon: GoogleIcon,
			// hide if we're in an in-app browser
			show: !isInAppBrowser
		},
		{
			name: 'Microsoft',
			key: 'microsoft',
			icon: MicrosoftIcon,
			show: true
		},
		{
			name: 'Email',
			key: 'magic-link',
			icon: MailIcon,
			show: true
		}
	])

	// Disable others
	let chosenProvider = $state<string | null>(null)

	let emailStep = $state(0)
	const onLogin = async (provider: (typeof providers)[number]['key']) => {
		localStorage.setItem('lastLoginOption', provider)

		if (provider === 'magic-link') emailStep = 1
		else
			await authClient.signIn.social({
				provider,
				callbackURL: '/',
				errorCallbackURL: '/login/error'
			})
	}

	let email = $state('')
	let isLoading = $state(false)
	const loginWithEmail = async (e: Event) => {
		e.preventDefault()
		isLoading = true
		if (!email) return toast.error('Please enter an email')
		const res = await authClient.signIn.magicLink({
			email,
			callbackURL: '/',
			errorCallbackURL: '/login/error'
		})
		isLoading = false
		console.log('res', res)
		if (res.error)
			return toast.error(`Error logging in: ${res.error.message ?? res.error.statusText}`)
		emailStep = 2
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

	<div class="m-auto grid grid-cols-[1fr] grid-rows-[1fr] place-items-center">
		{#if emailStep === 1}
			<form
				transition:blur
				class="col-start-1 row-start-1 flex flex-row gap-x-2"
				onsubmit={loginWithEmail}
			>
				<Button
					onClick={() => (emailStep = 0)}
					variation="link"
					class="text-main-600/90 hover:text-main-300"
					type="button"
				>
					{#snippet icon()}
						<IconBack />
					{/snippet}
				</Button>
				<InputField
					name="email"
					placeholder="Email"
					class="w-xs"
					autocomplete="email"
					required
					type="email"
					bind:value={email}
				/>
				<Button
					type="submit"
					variation="link"
					class="text-main-500 hover:text-main-300"
					{isLoading}
				>
					{#snippet icon()}
						<IconSend />
					{/snippet}
				</Button>
			</form>
		{:else if emailStep === 2}
			<div transition:blur class="col-start-1 row-start-1 text-center">
				<p class="text-main-400">
					Click the link we just sent to {email} to login!
				</p>
				<br />
				<p class="text-main-500">If you don't see it, check your spam folder.</p>
			</div>
		{:else}
			<div class="col-start-1 row-start-1 flex w-xs flex-col items-center gap-y-4" transition:blur>
				<p class="mb-6 text-center">
					<span class=" text-main-400 text-center">Please authenticate to continue</span>
				</p>
				{#each providers as provider}
					<div class="relative w-full">
						<Button
							class="peer w-full"
							onClick={() => onLogin(provider.key)}
							autoLoad="promise"
							disabled={chosenProvider === provider.name || !provider.show}
							tooltip={!provider.show
								? 'This provider is not available in this browser'
								: undefined}
						>
							{#snippet icon()}
								<provider.icon />
							{/snippet}
							{#snippet body()}
								{provider.name}
							{/snippet}
						</Button>
						{#if provider.key === lastOption}
							<span
								class={[
									'absolute -top-2 -right-5 px-3 py-1',
									'badge-accent rounded-md',
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
		{/if}
	</div>
</div>
