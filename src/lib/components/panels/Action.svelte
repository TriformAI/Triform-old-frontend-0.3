<script lang="ts">
	import Panel from './Panel.svelte'
	import Icon from '~icons/mdi/rhombus'
</script>

<Panel {Icon}>
	{#snippet panels({ CodeEditor, Execute, Metadata, Variables })}
		<Metadata />
		<CodeEditor />
		<Execute />
		<Variables />
	{/snippet}
</Panel>
