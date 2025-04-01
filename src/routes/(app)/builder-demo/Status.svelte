<script lang="ts">
	import { animate } from 'motion'
	import { onMount } from 'svelte'

	interface Props {
		onComplete?: () => void
		onStepComplete?: (idx: number) => void
		statuses: string[] | [string, number][]
		class?: string
		autoplay?: boolean
		hideLastItem?: boolean
		centerText?: boolean
	}

	let {
		onComplete,
		onStepComplete,
		statuses,
		class: classes,
		autoplay = true,
		hideLastItem = false,
		centerText = true
	}: Props = $props()

	let pauseGateResolve: (() => void) | null = null

	const pauseGate = () =>
		new Promise<void>(resolve => {
			pauseGateResolve = resolve
		})

	let isPaused = $state(false)

	export function pause() {
		if (!isPaused) {
			isPaused = true
		}
	}

	export function resume() {
		if (isPaused) {
			isPaused = false
			pauseGateResolve?.() // Release the pause gate
			pauseGateResolve = null
		}
	}

	let listEl = $state<HTMLElement>()

	const randomDelay = () => Math.random() * 0.5 + 0.1

	let isComplete = $state(false)

	async function runSequence() {
		if (!listEl) {
			return
		}

		await animate(listEl, { opacity: 1 }, { duration: 0.3, delay: 0.5 })

		let idx = 0

		while (idx < statuses.slice(0, -1).length) {
			if (isPaused) {
				await pauseGate() // Maybe pause here
			}

			const delay = Array.isArray(statuses[idx]) ? statuses[idx][1] : randomDelay()

			await animate(
				listEl,
				{ transform: `translateY(-${idx + 1}lh)` },
				{ duration: 0.3, delay, ease: 'backOut' }
			)

			onStepComplete?.(idx)

			idx++
		}

		if (hideLastItem) {
			await animate(listEl, { opacity: 0 }, { duration: 0.3, delay: 0.5 })
		}
	}

	export async function play() {
		await runSequence()
		isComplete = true
		onComplete?.()
	}

	onMount(async () => {
		if (autoplay) {
			play()
		}
	})
</script>

<div
	class="text-main-300 relative h-[1lh] overflow-hidden leading-loose font-medium whitespace-nowrap {classes}"
>
	<ul class="opacity-0" bind:this={listEl}>
		{#each statuses as item, idx}
			<li data-status={idx} class={['flex h-[1lh] items-center', centerText && 'justify-center']}>
				{Array.isArray(item) ? item[0] : item}
			</li>
		{/each}
	</ul>

	{#if !isComplete}
		<div
			class=" absolute inset-0"
			style={`background-image:linear-gradient(to top,
			#181819 0%,
			oklch(0.359 0.144 278.697 / 0) 25%,
			oklch(0.359 0.144 278.697 / 0) 50%,
			oklch(0.359 0.144 278.697 / 0) 75%, 
			#181819 100%)
			`}
		></div>
	{/if}
</div>
