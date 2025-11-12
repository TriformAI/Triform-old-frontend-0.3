<script lang="ts">
	import { getProject } from '$lib/stores/canvas.svelte'
	import Tokens from './Tokens.svelte'
	import Nodes from './Nodes.svelte'

	getProject()
</script>

<div class="flex flex-col gap-y-4">
	<Tokens />
	<Nodes />
</div>
