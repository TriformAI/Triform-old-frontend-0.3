<script lang="ts">
	import type { PageData } from './$types'
	import Executions from '$lib/components/executions/Executions.svelte'
	import { executionsResponseModel } from '$lib/schemas'

	const { data }: { data: PageData } = $props()

	const executions = $derived.by(() => {
		const { data: parsedData, success } = executionsResponseModel.safeParse(data.executions)
		if (!success) return []
		return parsedData
	})
</script>

<div>
	<h1 class="text-xl font-bold">Latest executions</h1>
	<Executions {executions} showHeaders />
</div>
