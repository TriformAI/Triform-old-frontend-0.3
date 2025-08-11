<script lang="ts">
	import Button from '$lib/components/atoms/Button.svelte'
	import InputField from '$lib/components/atoms/InputField.svelte'
	import ComboBox from '$lib/components/atoms/ComboBox.svelte'
	import ArrowBackRounded from '~icons/material-symbols/arrow-back-rounded'
	import { createIngressToken } from '$lib/actions/tokens'
	import { ingressTokens } from '$lib/stores/ingressTokens.svelte'
	import { toast } from 'svelte-sonner'
	import IconClose from '~icons/material-symbols/close-rounded'

	let {
		trigger,
		componentData,
		dialog
	}: {
		trigger: any
		componentData: any
		dialog?: HTMLDialogElement
	} = $props()

	// Token management state
	let selectedTokens = $state<string[]>([])
	let tokenComboValue = $state('')
	let isCreatingToken = $state(false)
	let createdTokenPlainText = $state<string | null>(null)
	let tokenSearchValue = $state('')
	let comboBoxElement = $state<HTMLElement | null>(null)

	// Initialize selected tokens from trigger
	$effect(() => {
		if (trigger?.spec?.ingress_tokens) {
			selectedTokens = [...trigger.spec.ingress_tokens]
		}
	})

	// Update trigger when selectedTokens changes
	$effect(() => {
		if (trigger?.spec) {
			trigger.spec.ingress_tokens = selectedTokens
		}
	})

	// Auto-add token when selected
	$effect(() => {
		if (tokenComboValue && tokenComboValue !== 'new' && !selectedTokens.includes(tokenComboValue)) {
			selectedTokens.push(tokenComboValue)
			// Explicitly blur the ComboBox and reset values
			const input = comboBoxElement?.querySelector('input')
			if (input) {
				input.blur()
			}
			tokenComboValue = ''
			tokenSearchValue = ''
		}
	})

	// Token management functions
	const availableTokens = $derived(
		ingressTokens.map(token => ({
			value: token.id || '',
			label: token.meta.name
		}))
	)

	const createNewOption = $derived(() => {
		if (!tokenSearchValue.trim()) {
			return {
				label: 'Create new token...',
				trigger: () => {
					// Prompt for token name
					// TODO: replace this with some better modal or something
					const tokenName = (prompt('Enter a name for the new token:') as string)?.trim()
					if (!tokenName) return
					handleCreateToken(tokenName)
				}
			}
		}
		return {
			label: `Create new token '${tokenSearchValue.trim()}'`,
			trigger: () => handleCreateToken(tokenSearchValue.trim())
		}
	})

	const handleCreateToken = async (tokenName: string) => {
		if (!tokenName.trim()) return

		isCreatingToken = true
		try {
			const result = await createIngressToken({
				meta: { name: tokenName.trim(), intention: 'Trigger access token' }
			})

			// Add the new token to the store
			ingressTokens.push(result.data)

			// Show the plain text token to the user
			createdTokenPlainText = result.token

			// Auto-select the new token
			if (result.data.id && !selectedTokens.includes(result.data.id)) {
				selectedTokens.push(result.data.id)
			}

			toast.success('Token created successfully')
		} catch (error) {
			console.error(error)
			toast.error('Failed to create token')
		} finally {
			isCreatingToken = false
		}
	}

	const removeToken = (tokenId: string) => {
		selectedTokens = selectedTokens.filter(id => id !== tokenId)
	}

	const getTokenName = (tokenId: string) => {
		return ingressTokens.find(token => token.id === tokenId)?.meta.name || 'Unknown Token'
	}
</script>

{#if trigger}
	<span class="eyebrow">Payload mapping</span>
	<div class="grid grid-cols-[auto_auto_1fr] items-center gap-x-3 gap-y-3">
		<span class="text-main-400 text-sm">Input key</span>
		<span></span>
		<span class="text-main-400 text-sm">Payload JSON path</span>
		{#each Object.keys(componentData?.spec && 'inputs' in componentData.spec ? componentData.spec.inputs : {}) as key}
			<div
				class="text-main-300 bg-main-950/70 flex w-fit items-center rounded-md px-3 py-1.5 font-mono text-sm"
			>
				<span>{key}</span>
			</div>
			<ArrowBackRounded class="text-main-400 size-4" />
			<InputField name={key} bind:value={trigger.spec.payload_mapping[key]} class="font-mono" />
		{/each}
	</div>

	<span class="eyebrow">Ingress tokens</span>
	<div class="space-y-3">
		<!-- Token selection -->
		<div class="space-y-2" bind:this={comboBoxElement}>
			<ComboBox
				bind:value={tokenComboValue}
				bind:searchValue={tokenSearchValue}
				items={availableTokens.filter(token => !selectedTokens.includes(token.value))}
				placeholder="Search tokens or type to create new..."
				createNew={createNewOption()}
				target={dialog}
			/>
		</div>

		<!-- New token display -->
		{#if createdTokenPlainText}
			<div class="border-main-600 bg-main-950/20 relative space-y-3 rounded-md border p-4">
				<button
					type="button"
					onclick={() => (createdTokenPlainText = null)}
					class="text-main-400 hover:text-main-200 absolute top-3 right-3"
					aria-label="Close token display"
				>
					<IconClose class="size-4" />
				</button>
				<h4 class="text-main-200 pr-8 font-medium">New ingress token created</h4>
				<p class="text-main-300 text-sm">
					This is your new ingress token. Copy it now as it won't be shown again!
				</p>
				<div class="bg-main-900 border-main-600 rounded border p-3">
					<code class="text-main-200 font-mono text-sm break-all">{createdTokenPlainText}</code>
				</div>
			</div>
		{/if}

		<!-- Selected tokens display -->
		{#if selectedTokens.length > 0}
			<div class="flex flex-wrap gap-2">
				{#each selectedTokens as tokenId}
					<div
						class="bg-main-950/70 text-main-200 flex items-center rounded-md px-3 py-1.5 text-sm"
					>
						<span>{getTokenName(tokenId)}</span>
						<button
							type="button"
							onclick={() => removeToken(tokenId)}
							class="text-main-400 hover:text-main-200 ml-2"
							aria-label="Remove token"
						>
							<IconClose class="size-4" />
						</button>
					</div>
				{/each}
			</div>
		{/if}
	</div>
{/if}
