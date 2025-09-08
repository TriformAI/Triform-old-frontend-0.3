<script lang="ts">
	import IconGenerate from '~icons/mdi/shimmer'
	import Button from '$lib/components/atoms/Button.svelte'

	interface Props {
		onClick: () => void
		disabled?: boolean
		label?: string
		tooltip?: string
		loading?: boolean
		type?: 'generate' | 'build'
	}

	let { onClick, disabled, label = 'Generate', tooltip, loading = false, type }: Props = $props()

	function openChatPanel() {
		if (type !== 'build') return
		const el = document.querySelector<HTMLButtonElement>('[data-grid-handle-name="chatPanel"]')
		if (!el) return
		el.dispatchEvent(new MouseEvent('dblclick', { bubbles: true, cancelable: true }))
	}
</script>

<Button
	class="py-1 text-sm"
	onClick={() => {
		onClick()
		openChatPanel()
	}}
	{disabled}
	{tooltip}
	isLoading={loading}
	id={`generate-button-${type}`}
>
	{#snippet icon()}
		<IconGenerate />
	{/snippet}
	{#snippet body()}
		{label}
	{/snippet}
</Button>
