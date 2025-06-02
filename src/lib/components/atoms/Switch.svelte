<script lang="ts">
	import { type Snippet } from 'svelte'

	interface Props {
		checked?: boolean
		children: Snippet
	}

	let { checked = $bindable(), children }: Props = $props()
</script>

<label class="switch flex cursor-pointer items-center gap-2">
	<span
		class="relative inline-grid h-5 w-8 items-center rounded-full transition-colors duration-200 ease-out"
		data-switch
	></span>
	<input type="checkbox" bind:checked />
	<span class="text-sm font-medium whitespace-nowrap">
		{@render children()}
	</span>
</label>
