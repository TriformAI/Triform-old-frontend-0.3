<script lang="ts">
	import { page } from '$app/state'
	import { authClient } from '$lib/auth-client'
	import type { Organization, Invitation, Member } from 'better-auth/plugins/organization'
	import { onMount } from 'svelte'
	import { toast } from 'svelte-sonner'
	import AddMember from './AddMember.svelte'
	import MemberList from './MemberList.svelte'

	interface OrgMember extends Member {
		user: {
			email: string
			name: string
			image?: string
		}
	}

	interface FullOrganization extends Organization {
		invitations: Invitation[]
		members: OrgMember[]
	}

	let organization = $state<FullOrganization | null>(null)

	onMount(async () => {
		await getOrganization()
	})

	async function getOrganization() {
		const { data, error } = await authClient.organization.getFullOrganization({
			query: {
				organizationId: page.params.id
			}
		})

		if (!data || error) {
			toast.error(error?.message || 'Could not get organization')
			return
		}

		organization = data
	}
</script>

{#if organization}
	<div class="grid gap-12">
		<h1 class="text-2xl font-medium">{organization.name}</h1>

		<div class="grid grid-cols-6 gap-6">
			<h2 class="mt-2 text-lg font-medium">Members</h2>

			<div class="col-span-3 mt-1">
				<MemberList {getOrganization} members={organization.members} />

				<AddMember {getOrganization} />
			</div>
		</div>
	</div>
{/if}
