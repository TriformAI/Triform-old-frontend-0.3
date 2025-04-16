<script lang="ts">
	import Panel from '$lib/components/panels/Panel.svelte'
</script>

<Panel title="Endpoint" desc="An trigger for your workflow">
	{#snippet slot({ PanelItem })}
		<p class="text-main-400 text-center">Coming soon…</p>
	{/snippet}
</Panel>
