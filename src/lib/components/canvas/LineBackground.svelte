<script lang="ts">
	import { useSvelteFlow } from '@xyflow/svelte'

	let {
		gap = 20,
		lineWidth = 1,
		bgColor = '#18181b',
		patternColor = '#52525c',
		class: className
	}: {
		gap?: number
		lineWidth?: number
		bgColor?: string
		patternColor?: string
		class?: string
	} = $props()

	let viewport = $derived(useSvelteFlow().getViewport())

	let patternId = $derived(`horizontal-lines-${Math.random().toString(36).substring(2, 15)}`)
	let scaledGap = $derived(gap * (viewport?.zoom || 1))
</script>

<svg
	class={['svelte-flow__background', 'svelte-flow__container', className]}
	data-testid="svelte-flow__background"
	style:--xy-background-color-props={bgColor}
	style:--xy-background-pattern-color-props={patternColor}
>
	<pattern
		id={patternId}
		x={viewport?.x ? viewport.x % scaledGap : 0}
		y={viewport?.y ? viewport.y % scaledGap : 0}
		width={scaledGap}
		height={scaledGap}
		patternUnits="userSpaceOnUse"
	>
		<path
			stroke-width={lineWidth}
			stroke={patternColor}
			d={`M0 ${scaledGap / 2} H${scaledGap}`}
			class="svelte-flow__background-pattern"
		/>
	</pattern>
	<rect x="0" y="0" width="100%" height="100%" fill={`url(#${patternId})`} />
</svg>
