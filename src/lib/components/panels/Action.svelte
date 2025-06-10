<script lang="ts">
	import Panel from './Panel.svelte'
	import Icon from '~icons/mdi/rhombus'
	import { type Component } from '$lib/types/agent'
	const { componentData }: { componentData: Component } = $props()
</script>

<Panel {componentData} {Icon}>
	{#snippet panels({ CodeEditor, Execute, Metadata, Variables, Triggers })}
		<Metadata {componentData} />
		<Triggers {componentData} />
		<CodeEditor {componentData} />
		<Execute {componentData} />
		<Variables {componentData} />
	{/snippet}
</Panel>
