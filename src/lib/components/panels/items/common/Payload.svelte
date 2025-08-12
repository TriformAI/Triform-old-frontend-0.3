<script lang="ts">
	import IconAdd from '~icons/mdi/plus-circle-outline'
	import LightEditor from '$lib/components/atoms/LightEditor.svelte'
	import ComboBox from '$lib/components/atoms/ComboBox.svelte'
	import PayloadDialog from '../Execute/PayloadDialog.svelte'
	import { page } from '$app/state'
	import { twMerge } from 'tailwind-merge'

	let {
		value = $bindable(),
		placeholder = 'Use saved payload',
		class: className = '',
		hasJsonErrors = $bindable(false),
		usePortal = false
	}: {
		value: string
		placeholder?: string
		class?: string
		hasJsonErrors?: boolean
		usePortal?: boolean
	} = $props()

	let newPayload = $state('')
	let payloadDialog = $state<HTMLDialogElement>()

	$effect(() => {
		if (newPayload) {
			value = page.data.payloads?.find(p => p.id === newPayload)?.spec.payload ?? ''
			newPayload = ''
		}
	})

	function setPayload(val: string) {
		value = val
		if (!val) {
			hasJsonErrors = false
			return
		}
		try {
			JSON.parse(val)
			hasJsonErrors = false
		} catch (e) {
			hasJsonErrors = true
		}
	}

	let portal = $state<HTMLDivElement>()
</script>

<div class="relative">
	{#if usePortal}
		<div bind:this={portal}></div>
	{/if}

	<div class={twMerge('grid gap-y-4', className)}>
		{#if page.data.payloads?.length}
			<ComboBox
				bind:value={newPayload}
				{placeholder}
				items={page.data.payloads?.map(v => ({ value: v.id, label: v.spec.name })) ?? []}
				target={usePortal ? portal : undefined}
			/>
		{/if}

		<div class="bg-main-800/50 rounded-lg p-3">
			<div class=" -mt-1 mb-4 flex items-end justify-between">
				<p class="input-title">
					<span class="text-main-300">JSON Payload</span>
				</p>

				<button
					aria-label="Save payload"
					data-balloon-pos="left"
					class="text-main-400 hover:text-main-300 -mt-1 transition-colors"
					type="button"
					onclick={() => payloadDialog?.showModal()}
				>
					<IconAdd class="size-5" />
				</button>
			</div>

			{#key newPayload}
				<LightEditor
					wordWrap={true}
					language="json"
					bind:value
					onUpdate={v => setPayload(v)}
					class="text-sm"
				/>
			{/key}
		</div>
	</div>
</div>

{#key value}
	<PayloadDialog payload={value} bind:dialog={payloadDialog} />
{/key}
