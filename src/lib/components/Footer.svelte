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
	class="fixed bottom-0 grid w-full items-center bg-zinc-950 px-6 transition-transform delay-200 ease-[cubic-bezier(0.85,_0.09,_0.15,_0.91)]"
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
		<ChevronUp class="col-start-1 row-start-1 mx-auto size-6 text-white" />
	</button>
</footer>

<Dialog bind:dialog appearance="bottom" class="bg-zinc-950  px-5 pb-5">
	<SystemCharts data={stats} />
</Dialog>
