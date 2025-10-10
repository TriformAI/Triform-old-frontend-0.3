<script lang="ts">
	import ComboBox from '$lib/components/atoms/ComboBox.svelte'
	import Popover from '$lib/components/atoms/Popover.svelte'
	import IconAdd from '~icons/mdi/plus-circle-outline'
	import IconRemove from '~icons/material-symbols/close-rounded'
	import { getProject, saveContainer } from '$lib/stores/canvas.svelte'
	import { ingressTokens as ingressTokensStore } from '$lib/stores/ingressTokens.svelte'
	import { createIngressToken } from '$lib/actions/tokens'
	import { clone } from '$lib/utils/clone'
	import { toast } from 'svelte-sonner'
	import { confirmStore } from '$lib/stores/confirm.svelte'
	import Button from '$lib/components/atoms/Button.svelte'
	import { slide } from 'svelte/transition'

	const project = getProject()

	const tokens = $derived(
		(
			project?.spec.triggers.endpoints.ingress_tokens.map(t =>
				ingressTokensStore?.find(i => i.id === t)
			) ?? []
		).filter(t => t !== undefined)
	)

	let selectedTokenId = $state('')
	let searchValue = $state('')
	let open = $state(false)
	let createdPlaintextToken = $state('')

	const items = $derived(
		(ingressTokensStore ?? []).filter(t => !!t.id).map(t => ({ value: t.id!, label: t.meta.name }))
	)

	const addToken = async () => {
		if (!project) {
			toast.error('No project found')
			return
		}
		let name = searchValue?.trim()
		if (!name) {
			name = prompt('Enter token name')?.trim() ?? ''
		}
		if (!name) return

		const { success, data, token } = await createIngressToken({ meta: { name, intention: '' } })
		if (!success || !data) {
			toast.error('Failed to create token')
			return
		}

		ingressTokensStore.push(data)
		// Show the one-time plaintext token to the user
		createdPlaintextToken = token || ''
		await onSelectToken(data.id!)
	}

	const removeToken = async (tokenId: string) => {
		if (!project) {
			toast.error('No project found')
			return
		}
		const confirmed = await confirmStore.show({
			title: 'Are you sure?',
			message:
				'This will remove the token from the trigger. You will have to deploy the project to apply the changes.'
		})
		if (!confirmed) return
		const snapshot = clone($state.snapshot(project))
		const list = project.spec.triggers.endpoints.ingress_tokens
		list.splice(list.indexOf(tokenId), 1)
		const res = await saveContainer(snapshot)
		if (!res.success) {
			toast.error('Failed to save tokens')
			return
		}
		ingressTokensStore.splice(
			ingressTokensStore.findIndex(t => t.id === tokenId),
			1
		)
	}

	const onSelectToken = async (tokenId: string) => {
		open = false
		if (!project) {
			toast.error('No project found')
			return
		}
		const snapshot = clone($state.snapshot(project))
		const list = project.spec.triggers.endpoints.ingress_tokens
		if (!list.includes(tokenId)) list.push(tokenId)
		const res = await saveContainer(snapshot)
		if (!res.success) {
			toast.error('Failed to save tokens')
			return
		}
		selectedTokenId = ''
		searchValue = ''
	}

	const handleSelect = async (tokenId: string) => {
		selectedTokenId = tokenId
		await onSelectToken(tokenId)
	}
</script>

<div class="flex flex-col gap-2">
	<div class="flex flex-row items-center gap-2">
		<span class="text-main-300 font-medium"> Assigned Tokens </span>
		<Popover bind:open sideOffset={10} align="center">
			{#snippet trigger()}
				<button
					type="button"
					class="text-main-500 hover:text-main-200 icon-btn cursor-pointer transition"
				>
					<IconAdd class="size-4" />
				</button>
			{/snippet}
			<div class="w-80">
				<ComboBox
					bind:value={selectedTokenId}
					bind:searchValue
					{items}
					placeholder="Select or create a token"
					createNew={{ label: `Create \"${searchValue || 'token'}\"`, trigger: addToken }}
					expandOnMount={true}
					onSelect={handleSelect}
				/>
			</div>
		</Popover>
	</div>
	{#if createdPlaintextToken}
		<div
			class="border-main-700 bg-main-900 text-main-200 flex flex-col gap-2 rounded-md border p-3"
			transition:slide={{ axis: 'y' }}
		>
			<div class="flex flex-col">
				<span class="text-main-300 text-sm">New token</span>
				<span class="text-main-400 text-xs">
					Your token is only shown once, make sure to save it now!
				</span>
			</div>
			<div class="bg-main-950 rounded px-3 py-2 font-mono text-sm break-all">
				{createdPlaintextToken}
			</div>
			<div class="flex justify-end gap-2">
				<Button onClick={() => (createdPlaintextToken = '')} variation="link" class="py-1 text-sm">
					Dismiss
				</Button>
				<Button
					type="button"
					class="py-1 text-sm"
					onClick={async () => {
						try {
							await navigator.clipboard.writeText(createdPlaintextToken)
							toast.success('Token copied to clipboard')
						} catch {
							toast.error('Failed to copy')
						}
					}}
				>
					Copy
				</Button>
			</div>
		</div>
	{/if}
	<div class="flex flex-row gap-x-2 overflow-x-auto">
		{#each tokens as token}
			<div class="bg-main-950 flex flex-row items-center gap-x-2 rounded-md py-2 pl-3">
				<span class="text-main-300 text-sm">{token.meta.name}</span>
				<button
					type="button"
					class="text-main-500 hover:text-danger-400 icon-btn -ml-1 pr-1 transition"
					onclick={() => removeToken(token.id!)}
				>
					<IconRemove class="size-4" />
				</button>
			</div>
		{:else}
			<p class="text-main-500 text-sm text-center">No tokens assigned yet</p>
		{/each}
	</div>
</div>
