<script lang="ts">
	import Panel from './Panel.svelte'
	import Execute from './items/Execute.svelte'
	import Metadata from './items/Metadata.svelte'
	import Icon from '~icons/material-symbols/bolt'

	const items = [
		{
			title: 'Execute',
			component: Execute
		},
		{
			title: 'Metadata',
			component: Metadata
		}
	]
</script>

<Panel {items} {Icon} />
