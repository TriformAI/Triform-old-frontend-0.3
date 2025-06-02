<script lang="ts">
	import { fade } from 'svelte/transition'
	import IconAlert from '~icons/mdi/alert-circle-outline'

	let { show } = $props<{ show: boolean }>()
</script>

{#if show}
	<p
		class="text-main-400 flex items-center gap-1 text-sm font-medium"
		transition:fade={{ duration: 200 }}
	>
		<IconAlert class="text-warning-500" /> You have unpublished changes
	</p>
{/if}
