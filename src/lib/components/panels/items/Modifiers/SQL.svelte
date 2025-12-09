<script lang="ts">
	import type { z } from 'zod'
	import { modifierModel } from '$lib/schemas'
	import Button from '$lib/components/atoms/Button.svelte'
	import InputField from '$lib/components/atoms/InputField.svelte'
	import { decryptModifier } from '$lib/actions/modifiers'
	import { toast } from 'svelte-sonner'
	import IconVisibility from '~icons/material-symbols/visibility-rounded'
	import IconVisibilityOff from '~icons/material-symbols/visibility-off-rounded'
	import IconCopy from '~icons/mdi/content-copy'
	import { slide } from 'svelte/transition'

	const { modifier }: { nodeId: string; modifier: z.infer<typeof modifierModel> } = $props()

	let uriVisible = $state(false)
	let uri = $state<string>()
	const decryptUri = async () => {
		const { data, success } = await decryptModifier(modifier)
		if (!success) return toast.error('error' in data ? data.error : 'Failed to decrypt uri')
		uri = data.uri
	}
	const toggleUriVisible = async () => {
		uriVisible = !uriVisible
		if (uriVisible && !uri) await decryptUri()
		else if (!uriVisible && uri) uri = undefined
	}
</script>

<div class="flex flex-col gap-6 pt-4">
	<p class="text-main-300 text-sm">
		Use the <code>triform.sql.uri</code> API in your action to read and write data to a PostgreSQL
		database.
		<br />
		Use your own Postgres library (e.g. <code>psycopg</code>) to interact with the database.
	</p>
	<span class="text-main-400 text-sm">
		Below you can copy the connection URI to connect to the database externally from your own tools.
		Don't share this URI with anyone as it contains your database password!
	</span>
	<div class="flex w-full items-center">
		<InputField
			value={uri ?? '*'.repeat(20)}
			type={uriVisible ? 'text' : 'password'}
			readonly
			containerClass="w-full"
		/>
		{#if uri}
			<div transition:slide={{ duration: 200, axis: 'x' }} class="pl-2">
				<Button
					variation="ghost"
					onClick={() => navigator.clipboard.writeText(uri)}
					disabled={!uri}
				>
					<IconCopy />
				</Button>
			</div>
		{/if}
		<Button
			variation="ghost"
			onClick={toggleUriVisible}
			tooltip={uriVisible ? 'Hide URI' : 'Show URI'}
			autoLoad="promise"
			class="ml-2"
		>
			{#snippet icon()}
				{#if uriVisible && uri}
					<IconVisibilityOff />
				{:else}
					<IconVisibility />
				{/if}
			{/snippet}
		</Button>
	</div>
</div>
