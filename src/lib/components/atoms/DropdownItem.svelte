<script lang="ts">
	import type { Snippet } from 'svelte'
	import { DropdownMenu } from 'bits-ui'

	interface Props {
		onSelect?: () => void
		children: Snippet
		class?: string
		disabled?: boolean
	}

	let { onSelect, children, class: classes, disabled = false }: Props = $props()
</script>

<DropdownMenu.Item
	{onSelect}
	{disabled}
	class={[
		'text-main-400 cursor-pointer flex-row items-center px-2 py-1',
		'hover:text-main-200 hover:bg-main-800 group transition',
		'disabled:cursor-not-allowed disabled:opacity-50',
		classes
	]}
>
	{@render children()}
</DropdownMenu.Item>
