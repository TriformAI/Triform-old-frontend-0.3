<script lang="ts">
	import { onMount } from 'svelte'
	import { twMerge } from 'tailwind-merge'

	let {
		speed = 20,
		gap = 16,
		pauseOnHover = false,
		children,
		class: classProp
	}: {
		speed?: number
		gap?: number
		pauseOnHover?: boolean
		children: any
		class?: string | string[]
	} = $props()

	let containerRef = $state<HTMLDivElement>()
	let duration = $state(0)
	let distance = $state(0)

	onMount(() => {
		if (containerRef) {
			// Measure just the first content section, not both duplicates
			const width = containerRef.offsetWidth
			distance = width + gap
			duration = distance / speed
		}
	})

	const classes = $derived(classProp ? (Array.isArray(classProp) ? classProp : [classProp]) : [])
</script>

<div class={twMerge(['marquee-wrapper max-w-full', classes])}>
	<div
		class="marquee-container flex"
		class:pause-on-hover={pauseOnHover}
		style="--marquee-distance: {distance}px; animation-duration: {duration}s; gap: {gap}px"
	>
		<div bind:this={containerRef} class="marquee-content flex shrink-0" style="gap: {gap}px">
			{@render children()}
		</div>
		<div class="marquee-content flex shrink-0" style="gap: {gap}px" aria-hidden="true">
			{@render children()}
		</div>
		<div class="marquee-content flex shrink-0" style="gap: {gap}px" aria-hidden="true">
			{@render children()}
		</div>
	</div>
</div>

<style>
	.marquee-wrapper {
		position: relative;
		width: 100%;
		min-width: 0;
		overflow: hidden;
		mask-image: linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%);
		-webkit-mask-image: linear-gradient(
			to right,
			transparent 0%,
			black 10%,
			black 90%,
			transparent 100%
		);
	}

	.marquee-container {
		animation: scroll linear infinite;
		will-change: transform;
	}

	.pause-on-hover:hover {
		animation-play-state: paused;
	}

	@keyframes scroll {
		from {
			transform: translateX(0);
		}
		to {
			transform: translateX(calc(-1 * var(--marquee-distance)));
		}
	}
</style>
