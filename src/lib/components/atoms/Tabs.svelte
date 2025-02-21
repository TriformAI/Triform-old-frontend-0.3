<script lang="ts">
	export interface Tab {
		key: string
		label: string
	}

	let {
		tabs,
		activeTab = $bindable(0),
		class: classes
	}: {
		tabs: Tab[]
		activeTab: number
		class?: string
	} = $props()

	const onTabSelect = (idx: number) => {
		activeTab = idx
	}
</script>

<div class="flex gap-2">
	{#each tabs as tab, idx}
		{@const isActive = idx === activeTab}
		<button
			class={[
				'hover:text-main-200  border-b  px-4 py-2 transition-colors',
				isActive ? 'border-main-300 text-main-200' : 'text-main-500 border-transparent',
				classes
			]}
			onclick={() => onTabSelect(idx)}
		>
			{tab.label}
		</button>
	{/each}
</div>
