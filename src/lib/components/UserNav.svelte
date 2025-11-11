<script lang="ts">
	import Dropdown from './common/Dropdown.svelte'
	import { goto } from '$app/navigation'
	import { sessionStore } from '$lib/stores/session.svelte'
	import { authClient } from '$lib/auth-client'
	import { onMount } from 'svelte'
	import { getInvites, refreshInvites, getActiveInvites } from '$lib/stores/invites.svelte'

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

	const activeInvites = $derived(getActiveInvites())

	onMount(async () => {
		await refreshInvites()
	})
</script>

<Dropdown>
	{#snippet trigger()}
		{#if sessionStore.user}
			<div class="relative shrink-0">
				<img
					alt="Avatar"
					src={sessionStore.user.image ??
						`https://api.dicebear.com/9.x/notionists-neutral/svg?seed=${sessionStore.user.id}`}
					class="w-8 shrink-0 rounded-full"
				/>
				<!-- {#if activeInvites.length}
					<div
						class="bg-accent-500 absolute top-0 right-0 size-3 animate-ping rounded-full"
						style="animation-iteration-count: 1"
					></div>
					<div class="bg-accent-500 absolute top-0 right-0 size-3 rounded-full"></div>
				{/if} -->
			</div>
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
			<!-- <li class="group">
				<a href="/account/invites" class="list-btn w-full">
					<span class="badge-accent">
						{activeInvites.length}
					</span>
					personal invites left
				</a>
			</li> -->
			<li>
				<a href="/account" class="list-btn w-full">Account</a>
			</li>
			<li>
				<button onclick={logout} class="list-btn w-full">Log out</button>
			</li>
		</ul>
	{/snippet}
</Dropdown>
