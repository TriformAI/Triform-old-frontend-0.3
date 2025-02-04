<script lang="ts">
	import SystemStatus from '$lib/components/SystemInfo/Status.svelte'
	import SystemCharts from '$lib/components/SystemInfo/Charts.svelte'
	import ChevronUp from '~icons/mdi/chevron-up'
	import Dialog from './common/Dialog.svelte'

	let dialog = $state<HTMLDialogElement>()

	const stats = [
		{ label: 'Runs per Hour', count: 0, color: '#22C55E' },
		{ label: 'Errors per Hour', count: 0, color: '#F44336' },
		{ label: 'Alerts', count: 0, color: '#FFC107' }
	]
</script>

<footer
	class="fixed grid items-center bg-zinc-950 delay-200 bottom-0 w-full px-6 ease-[cubic-bezier(0.85,_0.09,_0.15,_0.91)] transition-transform"
>
	<div class="col-start-1 row-start-1">
		<SystemStatus data={stats} />
	</div>

	<button
		type="button"
		class="col-start-1 row-start-1 my-auto w-full outline-none"
		onclick={() => {
			dialog?.showModal()
		}}
	>
		<ChevronUp class="mx-auto text-white size-6 col-start-1 row-start-1" />
	</button>
</footer>

<Dialog bind:dialog appearance="bottom">
	<SystemCharts data={stats} />
</Dialog>
