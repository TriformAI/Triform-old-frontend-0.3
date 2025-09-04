<script lang="ts">
	import IconGenerate from '~icons/mdi/shimmer'
	import Button from '$lib/components/atoms/Button.svelte'

	interface Props {
		onClick: () => void
		disabled?: boolean
		label?: string
		tooltip?: string
		loading?: boolean
	}

	let { onClick, disabled, label = 'Generate', tooltip, loading = false }: Props = $props()
</script>

<Button class="py-1 text-sm" {onClick} {disabled} {tooltip} isLoading={loading}>
	{#snippet icon()}
		<IconGenerate />
	{/snippet}
	{#snippet body()}
		{label}
	{/snippet}
</Button>
