<script lang="ts">
	import { onMount } from 'svelte'
	import { sleep } from './utils'

	interface Props {
		speed?: 'fast' | 'normal' | 'slow'
		text: string
		onComplete?: () => void
		class?: string
		autoplay?: boolean
		disableAnimation?: boolean
		delay?: number
	}

	let {
		text,
		speed = 'normal',
		onComplete,
		class: classes,
		autoplay = true,
		disableAnimation = false,
		delay = 0
	}: Props = $props()

	let displayed = $state('')
	let isTyping = $state(autoplay)

	const sleepDuration = $derived.by(() => {
		if (speed === 'fast') {
			return 15
		} else if (speed === 'slow') {
			return 25
		} else {
			return 15 + Math.random() * 25
		}
	})

	export async function write() {
		if (disableAnimation) {
			displayed = text
			return
		}

		displayed = ''
		isTyping = true
		await sleep(delay)

		for (let i = 0; i < text.length; i++) {
			displayed += text[i]

			// Faster timing overall
			if (/[.,!?]/.test(text[i])) {
				await sleep(100 + Math.random() * 100) // short pause after punctuation
			} else {
				await sleep(sleepDuration) // faster typing
			}
		}

		isTyping = false

		if (onComplete) {
			onComplete()
		}
	}

	onMount(async () => {
		if (autoplay) {
			await write()
		}
	})
</script>

{#if isTyping || displayed}
	<p class={['ai-text', classes]}>
		{displayed}<span class="cursor">{isTyping ? '|' : ''}</span>
	</p>
{/if}

<style>
	.cursor {
		display: inline-block;
		width: 1ch;
		animation: blink 1s steps(2, start) infinite;
	}

	@keyframes blink {
		to {
			visibility: hidden;
		}
	}
</style>
