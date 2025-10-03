<script lang="ts">
	import Button from '$lib/components/atoms/Button.svelte'
	import IconExpired from '~icons/material-symbols/close-rounded'
	import IconGift from '~icons/material-symbols/redeem-rounded'
	import { fly } from 'svelte/transition'

	type Props = {
		invite: {
			id: string
			recipient?: any
			expiresAt?: Date | string
		}
	}

	let { invite }: Props = $props()

	let copiedInvite = $state(false)
	async function copyInvite(inviteId: string) {
		await navigator.clipboard.writeText(inviteId)
		copiedInvite = true
		setTimeout(() => {
			copiedInvite = false
		}, 3000)
	}

	function getTimeRemaining(expiresAt: Date | string) {
		const expiry = typeof expiresAt === 'string' ? new Date(expiresAt) : expiresAt
		const now = new Date()
		const diff = expiry.getTime() - now.getTime()

		if (diff <= 0) return 'Expired'

		const days = Math.floor(diff / (1000 * 60 * 60 * 24))
		const hours = Math.floor(diff / (1000 * 60 * 60))

		if (days > 0) return `Expiring in ${days} ${days === 1 ? 'day' : 'days'}`
		if (hours > 0) return `Expiring in ${hours} ${hours === 1 ? 'hour' : 'hours'}`
		return 'Expiring in less than an hour'
	}

	const isUsed = $derived(!!invite.recipient)
	const isExpired = $derived(invite.expiresAt && new Date(invite.expiresAt) < new Date())
	const isActive = $derived(!isUsed && !isExpired)
</script>

<div
	class={[
		'flex flex-col items-center gap-2 rounded-xl border p-6 transition-all duration-200',
		isActive ? 'border-accent-500/80 bg-accent-400/5' : 'border-main-700 bg-main-850'
	]}
>
	<div
		class={[
			'mb-4 flex items-center justify-center rounded-lg p-4',
			isActive ? 'bg-accent-400/10 text-accent-300' : 'bg-main-800 text-main-600'
		]}
	>
		{#if isUsed || isExpired}
			<IconExpired class="size-6" />
		{:else}
			<IconGift class="size-6" />
		{/if}
	</div>

	<span
		class={[
			'border-main-700 bg-main-900/60 mb-3 rounded-lg border px-3 py-2.5',
			'text-main-300 w-fit px-4 text-center font-mono text-sm',
			!isActive && 'text-main-400 line-through opacity-80'
		]}
	>
		{invite.id}
	</span>

	<!-- Copy Button -->
	<Button
		variation={isActive ? 'vibrant' : 'primary'}
		disabled={!isActive}
		onClick={() => copyInvite(invite.id)}
		class="mb-3 w-full text-sm"
	>
		{#snippet body()}
			{#if isActive}
				<div class="grid grid-cols-[1fr] grid-rows-[1fr]">
					{#key copiedInvite}
						<span
							in:fly={{ duration: 400, y: 15, delay: 50 }}
							out:fly={{ duration: 400, y: -15 }}
							class="col-start-1 row-start-1"
						>
							{copiedInvite ? 'Invite Copied!' : 'Copy Invite'}
						</span>
					{/key}
				</div>
			{:else}
				Expired
			{/if}
		{/snippet}
	</Button>

	<!-- Time Remaining -->
	{#if invite.expiresAt && isActive}
		<span class="text-main-400 text-sm">{getTimeRemaining(invite.expiresAt)}</span>
	{/if}
</div>
