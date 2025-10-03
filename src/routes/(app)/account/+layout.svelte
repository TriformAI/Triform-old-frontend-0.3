<script lang="ts">
	import Navbar from '$lib/components/Navbar.svelte'
	import IconOrganization from '~icons/material-symbols/domain-rounded'
	import IconAccount from '~icons/material-symbols/person-rounded'
	import IconInvites from '~icons/material-symbols/partner-heart-rounded'
	import 'balloon-css'
	import { authClient } from '$lib/auth-client'
	import { page } from '$app/state'
	import { getActiveInvites } from '$lib/stores/invites.svelte'

	const { children } = $props()
	const organizations = authClient.useListOrganizations()

	const navItems = $derived([
		{
			name: 'Account',
			url: '/account',
			icon: IconAccount,
			isCurrent: () => page.route.id === '/(app)/account'
		},
		{
			name: 'Invites',
			url: '/account/invites',
			icon: IconInvites,
			isCurrent: () => page.url.pathname.startsWith('/account/invites'),
			badge: () => getActiveInvites().length
		},
		{
			name: 'Organizations',
			url: '/account/organizations',
			icon: IconOrganization,
			show: () => $organizations.data,
			isCurrent: () => page.url.pathname.startsWith('/account/organizations')
		}
	])
</script>

<div class="grid h-dvh grid-rows-[auto_1fr]">
	<Navbar />

	<main class="container flex flex-col items-start gap-16 md:grid md:grid-cols-5">
		<ul class="text-main-400 grid gap-3">
			{#each navItems as item}
				{@const badge = item.badge?.()}
				{#if !item.show || item.show()}
					<li class={[item.isCurrent() && 'text-main-200']}>
						<a
							href={item.url}
							class={[
								'flex items-center gap-2 transition duration-100',
								!item.isCurrent() && 'hover:text-main-200'
							]}
						>
							<item.icon />
							{item.name}
							{#if badge}
								<span class="badge-accent">
									{badge}
								</span>
							{/if}
						</a>
					</li>
				{/if}
			{/each}
		</ul>

		<div class="col-span-4">
			{@render children()}
		</div>
	</main>
</div>
