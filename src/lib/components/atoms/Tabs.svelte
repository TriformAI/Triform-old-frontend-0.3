<script lang="ts">
	import type { Component as SvelteComponent } from 'svelte'

	export interface Tab {
		key: string
		label: string
		icon?: SvelteComponent
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

<div
	class="border-main-800 grid overflow-hidden rounded-sm border"
	style="grid-template-columns: repeat({tabs.length}, 1fr)"
>
	{#each tabs as tab, idx}
		{@const isActive = idx === activeTab}
		<button
			class={[
				'hover:text-main-200 block w-full truncate text-center text-sm leading-tight transition-colors',
				isActive ? ' bg-main-800 text-main-200' : 'text-main-500',
				!!tab.icon ? 'pt-2 pb-3' : 'py-2',
				classes
			]}
			type="button"
			onclick={() => onTabSelect(idx)}
		>
			{#if tab.icon}
				<tab.icon class="mx-auto size-8 py-1" />
			{/if}
			<span>{tab.label}</span>
		</button>
	{/each}
</div>
