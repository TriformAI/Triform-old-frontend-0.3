<script lang="ts">
	import Panel from '$lib/components/panels/Panel.svelte'
</script>

<Panel title="Flow" desc="A collection of actions">
	{#snippet slot({ PanelItem })}
		<p class="text-main-400 text-center">Coming soon…</p>
	{/snippet}
</Panel>
