<script lang="ts">
	import { animate, stagger } from 'motion'
	import TypeWriter from './TypeWriter.svelte'

	let msgComplete = $state(false)

	let { restart }: { restart: () => void } = $props()

	$effect(() => {
		if (msgComplete) {
			animate('.btn', { opacity: 1, y: 0 }, { duration: 0.5, delay: stagger(0.2), ease: 'circOut' })
		}
	})
</script>

<div class="my-auto grid place-items-center gap-4 text-lg">
	<TypeWriter
		text="Your flow has been created!"
		onComplete={() => {
			msgComplete = true
		}}
	/>

	<div class="mt-2 flex justify-center gap-4">
		<button class="btn opacity-0" type="button" onclick={restart}>Rebuild flow</button>
	</div>
</div>
