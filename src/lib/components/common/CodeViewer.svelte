<script lang="ts">
	import { toast } from 'svelte-sonner'
	import LightEditor from '$lib/components/atoms/LightEditor.svelte'
	import IconCopy from '~icons/mdi/content-copy'

	const {
		value,
		title,
		copyable,
		language = 'json',
		readOnly = true,
		wordWrap = true,
		class: className
	}: {
		value: string
		title?: string
		copyable?: boolean
		language?: string
		readOnly?: boolean
		wordWrap?: boolean
		class?: string | string[]
	} = $props()

	const copyCode = () => {
		navigator.clipboard.writeText(value)
		toast.success('Copied to clipboard')
	}
</script>

<div class="bg-main-800/50 grid grid-rows-[auto_auto] rounded-lg px-3">
	{#if title || copyable}
		<div class="mt-1 mb-4 flex items-end justify-between">
			{#if title}
				<p class="text-sm font-medium">
					<span class="text-main-300">{title}</span>
				</p>
			{/if}
			{#if copyable && value}
				<button
					class="text-main-400 hover:text-main-300 ms-auto -mt-1 transition-colors"
					onclick={() => copyCode()}
				>
					<IconCopy class="size-4.5" />
				</button>
			{/if}
		</div>
	{/if}

	<LightEditor
		{readOnly}
		{wordWrap}
		{language}
		{value}
		class={['text-sm', 'max-h-full overflow-y-auto', className]}
		id="code-viewer-editor"
	/>
</div>
