<script lang="ts">
	import { page } from '$app/state'
	import Button from '$lib/components/atoms/Button.svelte'
	import { API } from '$lib/api'
	import { toast } from 'svelte-sonner'

	interface Props {
		getOrganization: () => Promise<void>
	}

	let { getOrganization }: Props = $props()

	const api = new API()

	let isAdding = $state(false)

	async function addMember(e: Event) {
		e.preventDefault()
		isAdding = true

		// First try to get the user by email. We need the user id to add the user to the organization
		const userByEmail = await api.post<{ email: string; id: string }>(`users/by-email`, {
			email: newMemberEmail
		})

		if (!userByEmail.data) {
			toast.error('User not found. Please ask the user to login first.')
			isAdding = false
			return
		}

		// If we have the user, add them to the organization
		const newMember = await api.post(`organizations/${page.params.id}/members`, {
			organizationId: page.params.id,
			role: newMemberRole,
			userId: userByEmail.data.id
		})

		isAdding = false

		if (newMember.status !== 201) {
			toast.error('Could not add member')
			return
		}

		toast.success('Member added!')
		await getOrganization()
	}

	let newMemberEmail = $state('')
	let newMemberRole = $state('member')
</script>

<div class="bg-main-850 border-main-800 mt-8 rounded border p-4">
	<h3 class="mb-1 font-semibold">Add user to organization</h3>
	<p class="text-main-400 text-sm text-balance">
		Please note that a user with this email needs to exist before being added to this organization.
		Ask the user to login first before proceeding with this step.
	</p>

	<form class="mt-6 grid gap-4" onsubmit={addMember}>
		<div>
			<label class="grid grid-cols-6 items-center">
				<span class="text-main-400 text-sm font-semibold">Email</span>
				<input class="input-text col-span-5" type="email" bind:value={newMemberEmail} />
			</label>
		</div>

		<div class="grid grid-cols-6 items-center">
			<span class="text-main-400 text-sm font-semibold">Role</span>
			<div class="col-span-5 flex gap-4">
				<label class="flex cursor-pointer items-center gap-1.5">
					<input type="radio" name="role" class="radio" value="member" bind:group={newMemberRole} />
					Member
				</label>

				<label class="flex cursor-pointer items-center gap-1.5">
					<input type="radio" name="role" class="radio" value="admin" bind:group={newMemberRole} />
					Admin
				</label>
			</div>
		</div>

		<div class="flex justify-end">
			<Button
				disabled={newMemberEmail.trim() === '' || isAdding}
				isLoading={isAdding}
				variation="vibrant"
				class="px-3 py-1 text-sm"
				type="submit"
			>
				Add user as {newMemberRole}
			</Button>
		</div>
	</form>
</div>
