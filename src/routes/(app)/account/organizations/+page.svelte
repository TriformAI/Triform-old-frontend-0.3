<script lang="ts">
	import { authClient } from '$lib/auth-client'
	import { toast } from 'svelte-sonner'
	import type { Organization } from 'better-auth/plugins/organization'
	import { sessionStore } from '$lib/stores/session.svelte'
	import Button from '$lib/components/atoms/Button.svelte'
	import NewOrganization from '$lib/components/modals/NewOrganization.svelte'
	import IconAdd from '~icons/material-symbols/domain-add-rounded'
	import IconOrganization from '~icons/material-symbols/domain-rounded'

	let { data } = $props()
	const { memberships } = $derived(data)

	let organizationDialog = $state<HTMLDialogElement>()

	async function switchOrg(org: Organization) {
		const { data, error } = await authClient.organization.setActive({
			organizationId: org.id
		})

		if (!data || error) {
			toast.error('Could not switch organization')
			return
		}

		sessionStore.getSession()

		toast.success(`Switched to ${org.name}`)
	}
</script>

<NewOrganization bind:dialog={organizationDialog} />

<div class="flex flex-row items-center justify-start gap-2">
	<h1 class="text-2xl font-semibold">Organizations</h1>
	<Button variation="link" onClick={() => organizationDialog?.showModal()}>
		{#snippet icon()}
			<IconAdd />
		{/snippet}
	</Button>
</div>

<div class="mt-4">
	<table>
		<thead>
			<tr>
				<th>Name</th>
				<th></th>
			</tr>
		</thead>
		<tbody>
			{#each memberships as { member, organization: org }}
				<tr>
					<td>
						<div class="flex items-center gap-2">
							{#if org.logo}
								<img src={org.logo} alt={org.name} class="size-8 rounded-full object-cover" />
							{:else}
								<IconOrganization class="text-accent-400 size-7" />
							{/if}
							<span>{org.name}</span>
							{#if sessionStore.session?.activeOrganizationId === org.id}
								<span class="badge bg-main-700 text-main-100">Active</span>
							{/if}
						</div>
					</td>
					<td class="pl-4">
						<div class="flex items-center gap-2">
							<Button variation="link" href={`/account/organizations/${org.id}`}>
								{#snippet body()}
									View
								{/snippet}
							</Button>
							{#if sessionStore.session?.activeOrganizationId !== org.id}
								<button
									onclick={() => switchOrg(org)}
									type="button"
									class="text-accent-300 text-sm font-semibold">Make active</button
								>
							{/if}
						</div>
					</td>
				</tr>
			{/each}
		</tbody>
	</table>
</div>
