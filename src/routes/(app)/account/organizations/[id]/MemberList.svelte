<script lang="ts">
	import type { Member } from 'better-auth/plugins/organization'
	import Dropdown from '$lib/components/common/Dropdown.svelte'
	import IconDots from '~icons/material-symbols/more-horiz'
	import { authClient } from '$lib/auth-client'
	import { toast } from 'svelte-sonner'
	import { page } from '$app/state'

	interface OrgMember extends Member {
		user: {
			email: string
			name: string
			image?: string
		}
	}

	interface Props {
		members: OrgMember[]
		getOrganization: () => Promise<void>
	}

	let { members, getOrganization }: Props = $props()

	async function removeMember(e: Event, member: OrgMember) {
		e.preventDefault()
		const { data, error } = await authClient.organization.removeMember({
			memberIdOrEmail: member.id,
			organizationId: page.params.id!
		})

		if (!data || error) {
			toast.error(error?.message || 'Could not remove member')
			return
		}

		toast.success('Member removed!')
		await getOrganization()
	}

	async function changeRole(e: Event, member: OrgMember, newRole: 'member' | 'admin') {
		e.preventDefault()

		const { data, error } = await authClient.organization.updateMemberRole({
			memberId: member.id,
			role: newRole,
			organizationId: page.params.id!
		})

		if (!data || error) {
			toast.error(error?.message || 'Could not change role')
			return
		}

		toast.success(`Member role changed to ${newRole}`)
		await getOrganization()
	}
</script>

<ul class="grid">
	{#each members as member}
		<li
			class="border-main-700 grid grid-cols-[1fr_5fr_1fr] items-center gap-2 border-b py-3 text-sm last:border-b-0"
		>
			<p>
				<span
					class={[
						'rounded px-2 py-1 text-xs font-semibold uppercase',
						member.role === 'owner' && 'text-accent-200 bg-accent-600',
						member.role === 'admin' && 'text-accent-600 bg-accent-200',
						member.role === 'member' && 'text-main-600 bg-main-200'
					]}
				>
					{member.role}
				</span>
			</p>

			<p class="flex items-center gap-2">
				{member.user.name}
				<span class="text-main-400">{member.user.email}</span>
			</p>

			{#if member.role !== 'owner'}
				<Dropdown class="ms-auto">
					{#snippet trigger()}
						<IconDots />
					{/snippet}
					{#snippet body()}
						<ul>
							<li>
								<button
									onclick={e => removeMember(e, member)}
									class="list-btn w-full text-sm font-medium"
								>
									Remove from organization
								</button>
							</li>

							<li>
								<button
									onclick={e =>
										changeRole(e, member, member.role === 'member' ? 'admin' : 'member')}
									class="list-btn w-full text-sm font-medium"
								>
									{member.role === 'member' ? 'Promote to admin' : 'Demote to member'}
								</button>
							</li>
						</ul>
					{/snippet}
				</Dropdown>
			{/if}
		</li>
	{/each}
</ul>
