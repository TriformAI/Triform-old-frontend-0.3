<script lang="ts">
	import Panel from './Panel.svelte'
	import CodeEditor from '$lib/components/panels/items/CodeEditor.svelte'
	import Execute from '$lib/components/panels/items/Execute.svelte'
	import Metadata from './items/Metadata.svelte'
	import { selected } from '$lib/stores/canvas.svelte'
</script>

{#key selected.node?.id}
	<Panel
		title={selected.node?.data.trinode.spec.meta.name || 'Action'}
		desc={selected.node?.data.trinode.spec.meta.intention?.purpose}
	>
		{#snippet slot({ PanelItem })}
			<PanelItem title="Metadata" isOpen={false}>
				<Metadata />
			</PanelItem>

			<PanelItem title="Code">
				<CodeEditor />
			</PanelItem>

			<PanelItem title="Execute">
				<Execute />
			</PanelItem>
		{/snippet}
	</Panel>
{/key}
