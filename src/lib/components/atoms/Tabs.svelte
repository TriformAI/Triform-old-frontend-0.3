<script lang="ts">
	import { onMount } from 'svelte'

	export interface Tab {
		key: string
		label: string
	}

	let {
		tabs,
		activeTab = $bindable()
	}: {
		tabs: Tab[]
		activeTab: Tab | null
	} = $props()

	const onTabSelect = (tab: Tab) => {
		activeTab = tab
	}

	onMount(() => {
		if (!activeTab) {
			activeTab = tabs[0]
		}
	})
</script>

<div class="flex flex-row">
	{#each tabs as tab}
		{@const isActive = tab.key === activeTab?.key}
		<button
			class="
        transition-all px-6 py-2
        border-b border-transparent
        {isActive
				? 'border-zinc-300 text-zinc-200'
				: 'text-zinc-500 hover:text-zinc-400 hover:border-zinc-700'}
      "
			onclick={() => onTabSelect(tab)}
		>
			{tab.label}
		</button>
	{/each}
</div>
