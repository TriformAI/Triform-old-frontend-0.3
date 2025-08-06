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
			pathId: '/(app)/account',
			icon: IconAccount
		},
		{
			name: 'Organizations',
			url: '/account/organizations',
			pathId: '/(app)/account/organizations',
			icon: IconOrganization,
			condition: () => $organizations.data && $organizations.data?.length > 1
		},
		{
			name: 'Organization',
			url: `/account/organizations/${$organizations.data?.[0].id}`,
			pathId: '/(app)/account/organizations/[id]',
			icon: IconOrganization,
			condition: () => $organizations.data && $organizations.data?.length === 1
		}
	])

	$inspect(page)
</script>

<div class="grid h-dvh grid-rows-[auto_1fr]">
	<Navbar />

	<main class="container grid grid-cols-5 items-start gap-16">
		<ul class="text-main-400 grid gap-3">
			{#each navItems as item}
				{@const isCurrent = item.pathId === page.route.id}
				{#if !item.condition || item.condition()}
					<li
						class={['border-main-700  border-b pb-2 last:border-b-0', isCurrent && 'text-main-200']}
					>
						<svelte:element
							this={isCurrent ? 'span' : 'a'}
							href={item.url}
							class={['flex items-center gap-2', !isCurrent && 'hover:text-accent-300']}
						>
							<item.icon />
							{item.name}
						</svelte:element>
					</li>
				{/if}
			{/each}
		</ul>

		<div class="col-span-4">
			{@render children()}
		</div>
	</main>
</div>
