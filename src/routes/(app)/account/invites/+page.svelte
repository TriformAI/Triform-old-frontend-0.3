<script lang="ts">
	import { getInvites, refreshInvites } from '$lib/stores/invites.svelte'
	import { onMount } from 'svelte'
	import IconGift from '~icons/material-symbols/redeem-rounded'
	import InviteCard from './InviteCard.svelte'

	let invites = $derived(getInvites())

	onMount(async () => {
		await refreshInvites()
		console.log($state.snapshot(invites))
	})
</script>

<div class="flex flex-col gap-y-6">
	<div>
		<h1 class="text-2xl font-semibold">Your Invites</h1>
		<p class="text-main-400 mt-2 text-sm">
			Share Triform with up to {invites.length} friends
		</p>
	</div>

	{#if invites.length}
		<div
			class="border-main-700 bg-main-850 flex flex-col items-center justify-center rounded-xl border px-12 py-16"
		>
			<IconGift class="text-main-600 mb-4 size-16" />
			<p class="text-main-400 text-center text-sm">You don't have any invites yet.</p>
		</div>
	{:else}
		<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
			{#each invites as invite}
				<InviteCard {invite} />
			{/each}
		</div>
	{/if}
</div>
