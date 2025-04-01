<script lang="ts">
	import './styles.css'
	import Prompt from './Prompt.svelte'
	import Flow from './Flow.svelte'
	import { animate } from 'motion'
	import { SvelteFlowProvider } from '@xyflow/svelte'

	let step = $state(0)

	async function nextStep() {
		if (!curtain) {
			return
		}

		await animate(curtain, { scaleX: 1 }, { duration: 1, ease: 'circInOut' })
		step++
		curtain.style.transformOrigin = 'right'
		await animate(curtain, { scaleX: 0 }, { duration: 1, ease: 'circInOut' })
	}

	let curtain = $state<HTMLElement>()
</script>

<SvelteFlowProvider>
	<div class="grid h-full">
		<div
			style="transform: scaleX(0)"
			bind:this={curtain}
			class="bg-main-950 width-0 pointer-events-none absolute inset-y-0 z-20 w-full origin-left"
		></div>

		{#if step === 0}
			<Prompt onSubmit={() => nextStep()} />
		{:else if step === 1}
			<Flow />
		{/if}
	</div>
</SvelteFlowProvider>
