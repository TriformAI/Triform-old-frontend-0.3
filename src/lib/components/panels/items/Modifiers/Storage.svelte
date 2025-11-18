<script lang="ts">
	import type { z } from 'zod'
	import { modifierModel } from '$lib/schemas'
	import Button from '$lib/components/atoms/Button.svelte'

	const { modifier }: { nodeId: string; modifier: z.infer<typeof modifierModel> } = $props()

	// const modifierData = $derived(
	// 	oauthProviders.find(provider => provider.id === modifier.spec.provider)
	// )
</script>

<div class="flex flex-col gap-8 pt-4">
	<p class="text-main-300 text-sm">
		Use the <code>triform.storage</code> API in your action to read and write files.
		<br />
		It's encouraged to use triform.storage.generateLink() to create a public link to a file.
	</p>
	<Button variation="vibrant" disabled tooltip="Coming soon" class="w-full">Browse files</Button>
</div>
