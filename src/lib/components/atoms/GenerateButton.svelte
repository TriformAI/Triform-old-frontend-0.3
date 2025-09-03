<script lang="ts">
	import IconGenerate from '~icons/mdi/shimmer'
	import Button from '$lib/components/atoms/Button.svelte'
	import { chat } from '$lib/stores/chat.svelte'

	interface Props {
		onClick: () => void
		disabled?: boolean
		label?: string
	}

	let { onClick, disabled, label = 'Generate' }: Props = $props()

	function openChatPanel() {
		const el = document.querySelector<HTMLButtonElement>('[data-grid-handle-name="chatPanel"]')

		if (!el) return

		el.dispatchEvent(new MouseEvent('dblclick', { bubbles: true, cancelable: true }))
	}
</script>

<Button
	class="py-1 text-sm"
	onClick={() => {
		openChatPanel()
		onClick()
	}}
	{disabled}
>
	{#snippet icon()}
		<IconGenerate />
	{/snippet}
	{#snippet body()}
		{label}
	{/snippet}
</Button>
