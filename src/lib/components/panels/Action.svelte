<script lang="ts">
	import Panel from './Panel.svelte'
	import CodeEditor from '$lib/components/panels/items/CodeEditor.svelte'
	import Execute from '$lib/components/panels/items/Execute.svelte'
</script>

<Panel title="Action" desc="An action is a function">
	{#snippet slot({ PanelItem })}
		<PanelItem title="Execute" isOpen={false}>
			<Execute />
		</PanelItem>

		<PanelItem title="Code">
			<CodeEditor />
		</PanelItem>
	{/snippet}
</Panel>
