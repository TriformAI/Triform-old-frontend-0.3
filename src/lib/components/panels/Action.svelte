<script lang="ts">
	import Panel from './Panel.svelte'
	import CodeEditor from './items/CodeEditor.svelte'
	import Execute from './items/Execute.svelte'
	import Metadata from './items/Metadata.svelte'
	import Variables from './items/Variables/Root.svelte'
	import Icon from '~icons/mdi/rhombus'

	const items = [
		{
			title: 'Code',
			component: CodeEditor
		},
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
