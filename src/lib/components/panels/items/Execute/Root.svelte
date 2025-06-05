<script lang="ts">
	import { toast } from 'svelte-sonner'
	import IconAdd from '~icons/mdi/plus-circle-outline'
	import Button from '$lib/components/atoms/Button.svelte'
	import LightEditor from '$lib/components/atoms/LightEditor.svelte'
	import IconPlay from '~icons/material-symbols/play-arrow-outline-rounded'
	import IconCopy from '~icons/mdi/content-copy'
	import IconCheck from '~icons/mdi/check-bold'
	import { selected } from '$lib/stores/panel.svelte'
	import PanelItem from '../../PanelItem.svelte'
	import PayloadDialog from './PayloadDialog.svelte'
	import ComboBox from '$lib/components/atoms/ComboBox.svelte'
	import { page } from '$app/state'
	import { blur } from 'svelte/transition'
	import { executeComponent, executor } from '$lib/actions/executor.svelte'
	import { type Component } from '$lib/types/agent'
	import { drafts } from '$lib/stores/canvas.svelte'
	import { getContext } from 'svelte'
	import { DropdownMenu } from 'bits-ui'
	import IconChevronDown from '~icons/mdi/chevron-down'

	const { componentData }: { componentData: Component } = $props()

	let payload = $state('{\n\t"msg": "hello world"\n}')
	if (selected.payload) {
		payload = selected.payload
	}

	let payloadDialog = $state<HTMLDialogElement>()

	const formattedExecutionState = $derived.by(() => {
		const state = executor.state.split('_').join(' ')
		return state.substring(0, 1).toUpperCase() + state.substring(1)
	})

	const isValidJson = $derived.by(() => {
		try {
			JSON.parse(payload)
		} catch (e) {
			return false
		}
		return true
	})

	async function copyResult() {
		await navigator.clipboard.writeText(executor.result)
		toast.success('Result copied to clipboard')
	}

	let newPayload = $state('')

	$effect(() => {
		if (newPayload) {
			payload = page.data.payloads?.find(p => p.meta.id === newPayload)?.spec.payload ?? ''
			newPayload = ''
		}
	})

	function setPayload(val: string) {
		payload = val
		selected.payload = val
	}

	const draftData = $derived.by(() => {
		return drafts[componentData.meta.id]
	})

	const useDraft = $derived(getContext<{ value: boolean }>('use-draft'))

	function run() {
		if (!payload) return toast.error('Please enter a payload')
		if (!isValidJson) return toast.error('The payload needs to be valid JSON')

		executeComponent(payload, useDraft.value ? draftData : componentData)
	}
</script>

<PanelItem {componentData} title="Execute">
	<div class={[' col-start-1 row-start-1 grid min-w-80 grid-rows-[auto_1fr_min-content] gap-y-4']}>
		{#if page.data.payloads?.length}
			<ComboBox
				bind:value={newPayload}
				placeholder="Use saved payload"
				items={page.data.payloads?.map(v => ({ value: v.meta.id, label: v.spec.name })) ?? []}
			/>
		{/if}

		<div class="bg-main-800/50 rounded-lg p-3">
			<div class=" -mt-1 mb-4 flex items-end justify-between">
				<p class="text-sm font-medium">
					<span class="text-main-300">Payload</span>
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
					bind:value={payload}
					onUpdate={v => setPayload(v)}
					class="text-sm"
				/>
			{/key}
		</div>

		<div class="bg-main-800/50 grid grid-rows-[auto_minmax(100px,1fr)] rounded-lg p-3">
			<div class=" -mt-1 mb-4 flex items-end justify-between">
				<p class="text-sm font-medium">
					<span class="text-main-300">Result</span>
				</p>
				{#if executor.result}
					<button
						class="text-main-400 hover:text-main-300 ms-auto -mt-1 transition-colors"
						onclick={() => copyResult()}><IconCopy class="size-4.5" /></button
					>
				{/if}
			</div>

			<div class="relative">
				{#if executor.isRunning}
					<div
						class={[
							'h-full min-h-16 w-full rounded-md transition-all',
							'opacity-100 starting:opacity-0',
							'flex items-center justify-center',
							'absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2'
						]}
						out:blur={{
							duration: 400,
							opacity: 0,
							amount: 3
						}}
					>
						{#key executor.state}
							<span
								class={[
									'text-main-200 h-fit w-fit truncate text-center',
									'bg-main-950/20 animate-border rounded px-4 py-2',
									'absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2'
								]}
								transition:blur={{
									duration: 800,
									opacity: 0,
									amount: 5
								}}
							>
								{formattedExecutionState}
							</span>
						{/key}
					</div>
				{/if}

				<LightEditor
					readOnly={true}
					wordWrap={true}
					language="json"
					value={executor.result}
					class={[
						'text-sm transition-all duration-300',
						executor.isRunning ? 'blur-xs grayscale-75' : 'blur-[0px] grayscale-0'
					]}
				/>
			</div>
		</div>

		<div
			class="tooltip-red mt-4 grid grow gap-2"
			aria-label={!isValidJson ? 'Invalid JSON data' : undefined}
			data-balloon-pos="up"
		>
			<div class="relative">
				<div class="absolute end-0 top-0 bottom-0">
					<DropdownMenu.Root>
						<DropdownMenu.Trigger
							class="hover:bg-accent-900 bg-accent-800 h-full items-center justify-center rounded-e-md px-3"
						>
							<IconChevronDown class="size-6" />
						</DropdownMenu.Trigger>

						<DropdownMenu.Portal>
							<DropdownMenu.Content
								class="bg-main-850 shadow-popover my-2 me-5 rounded-md outline-hidden focus-visible:outline-hidden"
							>
								<DropdownMenu.Item
									class={[
										'data-highlighted:bg-main-800 flex cursor-pointer items-center justify-between gap-2 rounded-sm px-4 py-2 text-sm font-medium ring-0! ring-transparent! select-none focus-visible:outline-none'
									]}
									onSelect={() => {
										useDraft.value = true
									}}
								>
									Current draft
									{#if useDraft.value}
										<IconCheck class="text-accent-300 size-4" />
									{/if}
								</DropdownMenu.Item>

								<div class="bg-main-700 h-[1px]"></div>

								<DropdownMenu.Item
									class={[
										'data-highlighted:bg-main-800  flex cursor-pointer items-center justify-between gap-2 rounded-sm px-4 py-2 text-sm font-medium ring-0! ring-transparent! select-none focus-visible:outline-none'
									]}
									onSelect={() => {
										useDraft.value = false
									}}
								>
									Published
									{#if !useDraft.value}
										<IconCheck class="text-accent-300 size-4" />
									{/if}
								</DropdownMenu.Item>
							</DropdownMenu.Content>
						</DropdownMenu.Portal>
					</DropdownMenu.Root>
				</div>
				<Button
					variation="vibrant"
					class="w-full"
					onClick={run}
					autoLoad="promise"
					disabled={!isValidJson || executor.isRunning}
				>
					{#snippet icon()}
						<IconPlay class="size-6" />
					{/snippet}

					{#snippet body()}
						<span>
							{#if useDraft.value}
								Run current draft
							{:else}
								Run published
							{/if}
						</span>
					{/snippet}
				</Button>
			</div>
		</div>
	</div>
</PanelItem>

{#key payload}
	<PayloadDialog {payload} bind:dialog={payloadDialog} />
{/key}
