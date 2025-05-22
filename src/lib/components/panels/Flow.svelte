<script lang="ts">
	import Panel from './Panel.svelte'
	import Icon from '~icons/material-symbols/network-node'
	import { type Component } from '$lib/types/agent'
	const { componentData }: { componentData: Component } = $props()
</script>

<Panel {componentData} {Icon}>
	{#snippet panels({ Execute, Metadata, Variables })}
		<Metadata {componentData} />
		<Execute {componentData} />
		<Variables {componentData} />
	{/snippet}
</Panel>
