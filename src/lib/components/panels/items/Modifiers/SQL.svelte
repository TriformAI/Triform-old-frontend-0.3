<script lang="ts">
	import type { z } from 'zod'
	import { modifierModel } from '$lib/schemas'
	import Button from '$lib/components/atoms/Button.svelte'

	const { modifier }: { nodeId: string; modifier: z.infer<typeof modifierModel> } = $props()
</script>

<div class="flex flex-col gap-8 pt-4">
	<p class="text-main-300 text-sm">
		Use the <code>triform.sql</code> API in your action to read and write data to a PostgreSQL
		database.
		<br />
		Use your own Postgres library (e.g. <code>psycopg</code>) to interact with the database.
	</p>
	<Button variation="vibrant" disabled tooltip="Coming soon" class="w-full">
		Execute SQL Query
	</Button>
</div>
