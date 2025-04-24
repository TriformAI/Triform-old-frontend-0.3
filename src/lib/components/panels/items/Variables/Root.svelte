<script lang="ts">
	import { page } from '$app/state'
	import VariableForm from '$lib/components/forms/Variable.svelte'
	import { onMount } from 'svelte'
	import IconAdd from '~icons/mdi/plus-circle'
	import Button from '$lib/components/atoms/Button.svelte'

	import Item from './Item.svelte'

	let variableDialog = $state<HTMLDialogElement>()

	let query = $state('')

	let filteredModifiers = $derived(
		page.data.modifiers.filter(modifier => {
			return modifier.name.toLowerCase().includes(query.toLowerCase())
		})
	)

	onMount(() => {
		//variableDialog?.showModal()
	})
</script>

<div>
	{#await page.data.modifiers}
		<p>Loading modifiers…</p>
	{:then modifiers}
		<div class=" mb-2 grid grid-cols-[1fr_auto] items-end gap-4">
			{#if modifiers.length > 0}
				<label class="-ms-3 block">
					<span class="sr-only">Filter</span>
					<input
						type="text"
						placeholder="Filter variables"
						class="bg-main-800 w-full rounded-md px-3 py-1.5 outline-0"
						bind:value={query}
					/>
				</label>
			{/if}

			<Button
				class="btn hover:text-main-200 !px-1 py-1 text-sm font-semibold"
				type="button"
				variation="link"
				onClick={() => {
					variableDialog?.showModal()
				}}
			>
				{#snippet body()}
					<span class="text-accent-300 flex items-center gap-x-1">
						<IconAdd class="size-[20px]" /> Create
					</span>
				{/snippet}
			</Button>
		</div>
		<ul class="text-sm font-medium">
			{#each filteredModifiers as modifier}
				<Item {modifier} />
			{:else}
				<li class="text-main-500">No variables found</li>
			{/each}
		</ul>
	{:catch _error}
		<p>Could not load variables</p>
	{/await}
</div>

<VariableForm bind:dialog={variableDialog} />
