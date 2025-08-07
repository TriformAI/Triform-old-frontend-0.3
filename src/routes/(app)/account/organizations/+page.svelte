<script lang="ts">
	import { authClient } from '$lib/auth-client'
	import { onMount } from 'svelte'
	import { toast } from 'svelte-sonner'
	import type { Organization } from 'better-auth/plugins/organization'
	import { sessionStore } from '$lib/stores/session.svelte'

	let organizations = $state<Organization[]>()

	onMount(async () => {
		await getOrganizations()
	})

	async function getOrganizations() {
		const { data, error } = await authClient.organization.list()

		if (!data || error) {
			toast.error('Could not get organizations')
			return
		}

		organizations = data
	}

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
		{#if organizations}
			{#each organizations as org}
				<tr>
					<td>
						<div class="flex items-center gap-2">
							<a href={`/account/organizations/${org.id}`} class="flex items-center gap-2">
								<img src={org.logo} alt={org.name} class="size-8 rounded-full object-cover" />
								{org.name}
							</a>
							{#if sessionStore.session?.activeOrganizationId === org.id}
								<span class="badge bg-main-700 text-main-100">Current</span>
							{:else}
								<button
									onclick={() => switchOrg(org)}
									type="button"
									class="text-accent-300 text-sm font-semibold">Switch</button
								>
							{/if}
						</div>
					</td>
				</tr>
			{/each}
		{/if}
	</tbody>
</table>
