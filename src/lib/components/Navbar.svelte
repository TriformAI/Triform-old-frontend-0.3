<script lang="ts">
	import logo from '$lib/images/Logo.svg'
	import Dropdown from './common/Dropdown.svelte'
	import { page } from '$app/state'
	import { sessionStore } from '$lib/stores/session.svelte'
	import { authClient } from '$lib/auth-client'

	const activeOrganization = authClient.useActiveOrganization()

	const { children } = $props()
</script>

<header class="bg-main-850 sticky top-0 z-10 flex w-full items-center justify-between px-5 py-2">
	<div class="divide-main-800 flex flex-row items-center divide-x">
		<a href="/" class="pr-5">
			<img alt="Triform logo" src={logo} class="w-10" />
		</a>

		<div class="flex items-center pl-5">
			{#if page.data.project}
				{#if children}
					{@render children()}
				{:else}
					<span class="font-medium">Projects</span>
				{/if}
			{/if}
		</div>
	</div>

	<div class="mt-2 flex flex-row items-center gap-2">
		<Dropdown>
			{#snippet trigger()}
				{#if sessionStore.user}
					<img alt="Avatar" src={sessionStore.user.image} class="w-8 rounded-full" />
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
								class="text-accent-400 hover:text-accent-300 font-semibold">Switch</a
							>
						</div>
					</li>
					<li>
						<a href="/account" class="list-btn w-full">Account</a>
					</li>
					<li>
						<form action="/logout" method="post">
							<button type="submit" class="list-btn w-full">Log out</button>
						</form>
					</li>
				</ul>
			{/snippet}
		</Dropdown>
	</div>
</header>
