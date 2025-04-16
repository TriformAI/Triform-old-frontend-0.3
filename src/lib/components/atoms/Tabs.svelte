<script lang="ts">
	export interface Tab {
		key: string
		label: string
	}

	interface Props {
		tabs: Tab[]
		activeTab: number
		class?: string
	}

	let { tabs, activeTab = $bindable(0), class: classes }: Props = $props()

	const onTabSelect = (idx: number) => {
		activeTab = idx
	}
</script>

<div class="border-main-800 grid grid-cols-3 gap-2 overflow-hidden rounded-sm border">
	{#each tabs as tab, idx}
		{@const isActive = idx === activeTab}
		<button
			class={[
				'hover:text-main-200 block w-full truncate py-2 text-center text-sm leading-tight  transition-colors',
				isActive ? ' bg-main-800 text-main-200' : 'text-main-500',
				classes
			]}
			onclick={() => onTabSelect(idx)}
		>
			{tab.label}
		</button>
	{/each}
</div>
