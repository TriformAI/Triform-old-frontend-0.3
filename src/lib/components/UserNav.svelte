<script lang="ts">
	import Dropdown from './common/Dropdown.svelte'
	import { goto } from '$app/navigation'
	import { sessionStore } from '$lib/stores/session.svelte'
	import { authClient } from '$lib/auth-client'

	const activeOrganization = authClient.useActiveOrganization()

	async function logout() {
		await authClient.signOut({
			fetchOptions: {
				onSuccess: () => {
					goto('/login')
				}
			}
		})
	}
</script>

<Dropdown>
	{#snippet trigger()}
		{#if sessionStore.user}
			<img alt="Avatar" src={sessionStore.user.image} class="w-8 shrink-0 rounded-full" />
		{/if}
	{/snippet}

	{#snippet body()}
		<ul class="text-sm">
			<li class="border-main-700 bg-main-800 -mx-1 mb-1 rounded-t border-b px-4 py-2">
				<span class="text-main-400 block">Active Organization</span>
				<div class="flex items-end gap-2">
					<span>{$activeOrganization.data?.name}</span>
					<a
						href="/account/organizations"
						class="text-accent-400 hover:text-accent-300 font-semibold">Change</a
					>
				</div>
			</li>
			<li>
				<a href="/account" class="list-btn w-full">Account</a>
			</li>
			<li>
				<button onclick={logout} class="list-btn w-full">Log out</button>
			</li>
		</ul>
	{/snippet}
</Dropdown>
