<script lang="ts">
	import InputField from './atoms/InputField.svelte'
	import logo from '$lib/images/Logo.svg'
	import { onMount } from 'svelte'
	import IconSend from '~icons/material-symbols/send-rounded'
	import Button from './atoms/Button.svelte'
	import { acceptInvite } from '$lib/actions/user'
	import { toast } from 'svelte-sonner'
	import { goto } from '$app/navigation'
	import { authClient } from '$lib/auth-client'
	import { sessionStore } from '$lib/stores/session.svelte'
	import { blur } from 'svelte/transition'
	import { Confetti } from 'svelte-confetti'

	let inviteCode = $state('')
	// access is invite-only while the new platform is being finished, so the code
	// field is secondary — most people here are just waiting for launch
	let codeShown = $state(false)
	let tipShown = $state(false)
	onMount(() => setTimeout(() => (tipShown = true), 1000))

	let isLoading = $state(false)
	let accepted = $state(false)
	const handleSubmit = async (e: Event) => {
		e.preventDefault()
		isLoading = true
		try {
			const { data, success, error } = await acceptInvite(inviteCode)
			if (!success) {
				console.error('Error accepting invite', error)
				toast.error(error ?? 'Error accepting invite')
				return
			}
			accepted = true
			await new Promise(resolve => setTimeout(resolve, 5000))
			await sessionStore.refreshSession()
			goto('/dashboard')
		} catch (error) {
			console.error('Error accepting invite', error)
			toast.error('Error accepting invite')
		} finally {
			isLoading = false
		}
	}

	const logout = async () =>
		await authClient.signOut({
			fetchOptions: {
				onSuccess: () => goto('/login')
			}
		})

	const blurSettings = { duration: 700, opacity: 0, amount: 5 }
</script>

<div class="grid h-screen w-full grid-cols-[1fr] grid-rows-[1fr] place-items-center">
	{#if !accepted}
		<div
			class="text-main-400 col-start-1 row-start-1 flex w-full max-w-sm flex-col items-center justify-center gap-y-3 text-center"
			transition:blur={blurSettings}
		>
			<img src={logo} alt="Triform logo" class="size-12" />
			<p class="text-main-200 text-lg font-semibold">You're on the list</p>
			<p>
				Thanks for signing up! We're putting the finishing touches on the new Triform platform.
				We'll email you at
				{#if sessionStore.user?.email}
					<span class="text-main-300">{sessionStore.user.email}</span>
				{:else}
					this address
				{/if}
				as soon as it launches.
			</p>

			{#if codeShown}
				<form class="my-2 flex w-full flex-row gap-x-2" onsubmit={handleSubmit}>
					<InputField
						placeholder="Invite code"
						containerClass="w-full"
						class="font-mono"
						bind:value={inviteCode}
						use={el => el.focus()}
						required
					/>
					<Button type="submit" variation="link" class="text-main-400 py-1" {isLoading}>
						{#snippet body()}
							<IconSend />
						{/snippet}
					</Button>
				</form>
			{:else}
				<p
					class={[
						'text-main-500 text-sm',
						'opacity-0 transition-opacity duration-500',
						tipShown && 'opacity-100'
					]}
				>
					Got an invite code?
					<button
						type="button"
						onclick={() => (codeShown = true)}
						class="text-main-400 inline hover:underline"
					>
						Enter it here
					</button>
				</p>
			{/if}
			<p
				class={[
					'text-main-600 text-center text-sm',
					'opacity-0 transition-opacity delay-1000 duration-500',
					tipShown && 'opacity-100'
				]}
			>
				Wrong account?
				<button type="button" onclick={logout} class="text-main-500 inline hover:underline">
					Logout
				</button>
			</p>
		</div>
	{:else}
		<div
			class="relative col-start-1 row-start-1 flex flex-col items-center justify-around gap-1"
			transition:blur={{ ...blurSettings, delay: 350 }}
		>
			<div class="absolute top-4">
				<Confetti delay={[800, 1500]} />
				<Confetti delay={[800, 2500]} />
			</div>
			<img src={logo} alt="Triform logo" class="size-12" />
			<p class="text-main-200 mt-2 text-lg font-semibold">Welcome to Triform!</p>
			<p class="text-main-400">You're now ready to start building, have fun!</p>
		</div>
	{/if}
</div>
