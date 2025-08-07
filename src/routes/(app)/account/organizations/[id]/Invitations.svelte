<script lang="ts">
	import { authClient } from '$lib/auth-client'
	import Dropdown from '$lib/components/common/Dropdown.svelte'
	import IconDots from '~icons/material-symbols/more-horiz'
	import Button from '$lib/components/atoms/Button.svelte'
	import type { Invitation } from 'better-auth/plugins/organization'
	import { toast } from 'svelte-sonner'
	import { page } from '$app/state'

	interface Props {
		invitations: Invitation[]
		getOrganization: () => Promise<void>
	}

	let { invitations, getOrganization }: Props = $props()

	let isInviting = $state(false)

	async function sendInvite(e: Event) {
		isInviting = true
		e.preventDefault()

		const { data, error } = await authClient.organization.inviteMember({
			email: inviteeEmail,
			role: 'member',
			organizationId: page.params.id,
			resend: false // Can't send multiple invites to the same email
		})

		isInviting = false

		if (!data || error) {
			toast.error(error?.message || 'Could not create invite')
			return
		}

		toast.success('Invite created!')

		inviteeEmail = ''
		await getOrganization()
	}

	let inviteeEmail = $state('')

	async function revokeInvite(e: Event, invite: Invitation) {
		e.preventDefault()
		const { data, error } = await authClient.organization.cancelInvitation({
			invitationId: invite.id
		})

		if (!data || error) {
			toast.error(error?.message || 'Could not cancel invite')
			return
		}

		toast.success('Invite canceled!')
		await getOrganization()
	}
</script>

<div class="border-main-600 grid grid-cols-6 gap-6">
	<h2 class="text-lg font-medium">Invitations</h2>

	<div class="col-span-3">
		<table class="w-full">
			<tbody>
				{#each invitations as invite}
					<tr>
						<td class="w-1/5">
							<span
								class={[
									'badge',
									invite.status === 'pending' && 'bg-warning-700 text-warning-100',
									invite.status === 'accepted' && 'bg-success-700 text-success-100',
									invite.status === 'canceled' && 'bg-danger-700 text-danger-100'
								]}
							>
								{invite.status}
							</span>
						</td>
						<td>
							<span class="text-main-300 text-sm">
								{invite.email}
							</span>
						</td>
						<td>
							<Dropdown class="ms-auto">
								{#snippet trigger()}
									<IconDots />
								{/snippet}
								{#snippet body()}
									<ul>
										<li>
											<button
												onclick={e => revokeInvite(e, invite)}
												class="list-btn w-full text-sm font-medium"
											>
												Cancel
											</button>
										</li>
									</ul>
								{/snippet}
							</Dropdown>
						</td>
					</tr>
				{:else}
					<tr class="text-main-500">
						<td>No invitations</td>
					</tr>
				{/each}
			</tbody>
		</table>

		<div class=" pt-12">
			<h3 class="mb-3 font-semibold">Invite new member</h3>

			<form class="grid grid-cols-[1fr_auto] gap-2" onsubmit={sendInvite}>
				<input class="input-text" type="email" bind:value={inviteeEmail} />

				<Button
					disabled={inviteeEmail.trim() === '' || isInviting}
					isLoading={isInviting}
					variation="vibrant"
					class="px-3 py-1 text-sm"
					type="submit"
				>
					Send invitation
				</Button>
			</form>
		</div>
	</div>
</div>
