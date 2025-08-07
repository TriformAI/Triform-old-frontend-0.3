<script lang="ts">
	import { authClient } from '$lib/auth-client'
	import { toast } from 'svelte-sonner'
	import type { Organization, Member } from 'better-auth/plugins/organization'
	import { sessionStore } from '$lib/stores/session.svelte'

	let { data } = $props()
	const { memberships } = $derived(data)

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

<table>
	<thead>
		<tr>
			<th>Name</th>
		</tr>
	</thead>
	<tbody>
		{#each memberships as { member, organization: org }}
			<tr>
				<td>
					<div class="flex items-center gap-2">
						<svelte:element
							this={member?.role === 'member' ? 'span' : 'a'}
							href={`/account/organizations/${org.id}`}
							class="flex items-center gap-2"
						>
							<img src={org.logo} alt={org.name} class="size-8 rounded-full object-cover" />
							{org.name}
						</svelte:element>
						{#if sessionStore.session?.activeOrganizationId === org.id}
							<span class="badge bg-main-700 text-main-100">Active</span>
						{:else}
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
