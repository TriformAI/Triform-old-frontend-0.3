<script lang="ts">
	import type { WidgetData, WidgetCompleteCallback } from '$lib/stores/chat.svelte'
	import InputField from '$lib/components/atoms/InputField.svelte'
	import IconExternalLink from '~icons/material-symbols/arrow-outward-rounded'
	import Button from '$lib/components/atoms/Button.svelte'
	import { getModifiers, getProject, rollbackContainer } from '$lib/stores/canvas.svelte'
	import { toast } from 'svelte-sonner'
	import { saveProject } from '$lib/actions/project'
	import { clone } from '$lib/utils/clone'
	import { slide } from 'svelte/transition'
	import { addSocketListener } from '$lib/stores/socket.svelte'
	import { onMount } from 'svelte'

	const { item, onComplete }: { item: WidgetData; onComplete?: WidgetCompleteCallback } = $props()

	const modifierId = $derived(item.data.props.modifierId)
	const modifier = $derived(getModifiers()[modifierId])

	// addSocketListener returns a cleanup function, so we return it to onMount so its cleaned up on unmount
	onMount(() =>
		addSocketListener(async msg => {
			// this isn't perfect, but once we get a modifier:updated event for the current modifier
			// we just assume that it's been updated and we can complete the widget. technically
			// it might've been updated by the user in the side panel or something, and it'll still
			// complete the widget, but I think this is good enough
			if (
				msg.event === 'modifier:updated' &&
				msg.data.modifier.id === modifierId &&
				msg.data.modifier.spec.refreshToken?.ciphertext &&
				!item.completed // Only complete if this widget hasn't been completed yet
			) {
				await onComplete?.(item.id)
			}
		})
	)

	// just complete without setting the variables
	const onSkip = async () => await onComplete?.(item.id)

	let showFallbackButton = $state(false)
	const authorise = async () => {
		// if it's not been authorised within a couple seconds after pressing the button, show a small fallback button
		setTimeout(() => (showFallbackButton = true), 4000)

		window.open(`/api/external/authorize/${modifierId}`, '_blank')
	}
</script>

{#if !item.completed}
	<div class="mt-4 flex flex-col gap-6" transition:slide={{ axis: 'y' }}>
		<div class="flex flex-col gap-2">
			<Button variation="vibrant" class="w-full capitalize" onClick={authorise}>
				Authorise {modifier?.spec.provider}
			</Button>
			{#if showFallbackButton}
				<div class="w-full" transition:slide={{ axis: 'y' }}>
					<Button variation="link" class="w-full" onClick={onSkip} autoLoad="promise">
						I've already authorised
					</Button>
				</div>
			{/if}
		</div>
		<div class="flex flex-row justify-between gap-2">
			<p class="text-main-500 text-xs">
				You may skip this step, but your automation won't work without it.
			</p>
			<Button variation="ghost" class="px-6" onClick={onSkip} autoLoad="promise">Skip</Button>
		</div>
	</div>
{/if}
