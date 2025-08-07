<script lang="ts">
	import Navbar from '$lib/components/Navbar.svelte'
	import IconOrganization from '~icons/material-symbols/domain-rounded'
	import IconAccount from '~icons/material-symbols/person-rounded'
	import 'balloon-css'

	const { children } = $props()

	import { authClient } from '$lib/auth-client'
	import { page } from '$app/state'
	const organizations = authClient.useListOrganizations()

	const navItems = $derived([
		{
			name: 'Account',
			url: '/account',
			icon: IconAccount,
			isCurrent: () => page.route.id === '/(app)/account'
		},
		{
			name: 'Organizations',
			url: '/account/organizations',
			icon: IconOrganization,
			show: () => $organizations.data && $organizations.data?.length > 1,
			isCurrent: () => page.url.pathname.startsWith('/account/organizations')
		},
		{
			name: 'Organization',
			url: `/account/organizations/${$organizations.data?.[0].id}`,
			icon: IconOrganization,
			show: () => $organizations.data && $organizations.data?.length === 1,
			isCurrent: () => page.route.id === '/(app)/account/organizations/[id]'
		}
	])
</script>

<div class="grid h-dvh grid-rows-[auto_1fr]">
	<Navbar />

	<main class="container grid grid-cols-5 items-start gap-16">
		<ul class="text-main-400 grid gap-3">
			{#each navItems as item}
				{#if !item.show || item.show()}
					<li
						class={[
							'border-main-700  border-b pb-2 last:border-b-0',
							item.isCurrent() && 'text-main-200'
						]}
					>
						<a
							href={item.url}
							class={['flex items-center gap-2', !item.isCurrent() && 'hover:text-accent-300']}
						>
							<item.icon />
							{item.name}
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
