<script lang="ts">
	import Panel from './Panel.svelte'
	import Execute from '$lib/components/panels/items/Execute.svelte'
	import Metadata from './items/Metadata.svelte'
	import Variables from '$lib/components/panels/items/Variables/Root.svelte'
	import Icon from '~icons/material-symbols/network-node'

	const items = [
		{
			title: 'Execute',
			component: Execute
		},
		{
			title: 'Metadata',
			component: Metadata
		},
		{
			title: 'Variables',
			component: Variables
		}
	]
</script>

<Panel {items} {Icon} />
