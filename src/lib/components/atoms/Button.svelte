<script lang="ts">
	import { type Snippet } from 'svelte'

	import { fly, scale } from 'svelte/transition'
	import { twMerge } from 'tailwind-merge'

	import AutorenewIcon from '~icons/material-symbols/autorenew-rounded'

	let {
		variation = 'primary',
		body,
		children,
		onClick: onClickProp,
		autoLoad,
		icon,
		class: classProp,
		href,
		target,
		disabled,
		tooltip,
		tooltipPos = 'up',
		type = 'button',
		element = $bindable(),
		isLoading = $bindable(false),
		id,
		fastClick = false
	}: {
		variation?: 'primary' | 'vibrant' | 'link' | 'danger' | 'warning' | 'confirm'
		// disabled
		// href
		// etc...
		body?: Snippet
		icon?: Snippet
		children?: Snippet
		// promise = show until promise resolves
		autoLoad?: 'promise'
		// If it returns a promise, show loading indicator until it resolves
		onClick?: () => unknown | Promise<unknown>
		class?: string | string[]
		href?: string
		target?: '_blank'
		disabled?: boolean
		tooltip?: string
		tooltipPos?: 'up' | 'right' | 'down' | 'left'
		type?: 'button' | 'submit' | 'reset'
		element?: HTMLButtonElement
		isLoading?: boolean
		id?: string
		fastClick?: boolean
	} = $props()

	const content = $derived(body ?? children)

	const hasTextColor = ['danger'].includes(variation)

	const onClick = async () => {
		// Click handler with optional auto-loading behaviour
		// 1. Follows external links immediately (if href provided)
		// 2. Runs the user-supplied onClick handler
		// 3. If autoLoad === 'promise' and the handler returns a promise:
		//    • Show a spinner after a short delay (to avoid UI flash)
		//    • Keep the spinner visible until the promise settles
		// 4. Always clears timers / loading state in the finally block so we don't
		//    leak state when the handler throws or rejects
		if (href) {
			if (target === '_blank') window.open(href, '_blank')
			else window.location.href = href
		}

		// No click handler → nothing more to do
		if (typeof onClickProp !== 'function') return

		// Should we auto-manage loading UI?
		const useAutoLoad = autoLoad === 'promise'

		// Indicates whether the handler has finished (successfully or not)
		let settled = false

		// Delay before showing the spinner. If the handler resolves quickly we
		// cancel this timer so the spinner never flashes.
		const delay = 150
		const timer = useAutoLoad
			? setTimeout(() => {
					if (!settled) isLoading = true
				}, delay)
			: undefined

		try {
			const result = onClickProp()
			// Await only if it looks like a promise
			if (useAutoLoad && result && typeof (result as any).then === 'function') {
				await result
			}
		} finally {
			// Cleanup no matter what
			settled = true
			if (timer) clearTimeout(timer)
			if (useAutoLoad) isLoading = false
		}
	}
</script>

<button
	bind:this={element}
	class={twMerge([
		variation === 'primary' &&
			'border-main-700 bg-main-800 hover:enabled:border-main-600 hover:enabled:bg-main-700 border',
		variation === 'confirm' &&
			'border-complement-600 bg-complement-700 text-complement-100! hover:text-complement-50! hover:enabled:border-complement-500 hover:enabled:bg-complement-600 border',
		variation === 'vibrant' &&
			'bg-accent-700 inset-shadow-accent-500/40 hover:enabled:bg-accent-600 border-accent-600 border inset-shadow-xs',
		variation === 'link' && 'text-main-200 hover:enabled:bg-main-800',
		variation === 'danger' &&
			'bg-danger-900 text-danger-100 hover:enabled:text-danger-50 hover:enabled:bg-danger-800',
		variation === 'warning' && 'bg-warning-800 text-warning-100 hover:enabled:bg-warning-700',
		!icon && !!body && 'px-5',
		!hasTextColor && 'text-main-300 hover:enabled:text-main-200',
		`active:enabled:border-main-500 flex transform cursor-pointer
    flex-row items-center justify-center gap-x-2
    rounded-md p-3 font-medium transition-all
    duration-300 active:enabled:scale-95
		disabled:cursor-not-allowed disabled:opacity-75`,
		'group/button',
		classProp
	])}
	{id}
	{type}
	disabled={disabled || isLoading}
	onclick={fastClick ? undefined : onClick}
	onmousedown={fastClick ? onClick : undefined}
	aria-label={tooltip}
	data-balloon-pos={tooltip ? tooltipPos : undefined}
	data-balloon-nofocus
	data-balloon-instant={disabled}
>
	<!-- If we have an icon, animate it for loading state -->
	{#if !!icon}
		<div class="grid grid-cols-[1fr] grid-rows-[1fr]">
			{#if isLoading}
				<div
					in:scale={{ start: 1.5, opacity: 0, duration: 500, delay: 50 }}
					out:scale={{ start: 0.5, opacity: 0, duration: 500, delay: 0 }}
					class="col-start-1 row-start-1"
				>
					<AutorenewIcon class="shrink-0 animate-spin" />
				</div>
			{:else}
				<div
					in:scale={{ start: 1.5, opacity: 0, duration: 500, delay: 75 }}
					out:scale={{ start: 0.5, opacity: 0, duration: 500, delay: 0 }}
					class="col-start-1 row-start-1"
				>
					{@render icon?.()}
				</div>
			{/if}
		</div>
		{@render content?.()}
	{:else}
		<!-- If we don't have an icon, replace the entire text with the loading icon -->
		{@const animY = 10}
		<div class="grid grid-cols-[1fr] grid-rows-[1fr]">
			{#if isLoading}
				<div
					in:fly={{ y: animY, duration: 300, delay: 50 }}
					out:fly={{ y: -animY, duration: 300, delay: 0 }}
					class="col-start-1 row-start-1 mx-auto flex items-center"
				>
					<AutorenewIcon class="shrink-0 animate-spin" />
				</div>
			{:else}
				<div
					in:fly={{ y: animY, duration: 300, delay: 50 }}
					out:fly={{ y: -animY, duration: 300, delay: 0 }}
					class="col-start-1 row-start-1"
				>
					{@render content?.()}
				</div>
			{/if}
			<!-- Copy of the body to make sure the button is always the same width even when loading -->
			<div class="pointer-events-none invisible col-start-1 row-start-1">
				{@render content?.()}
			</div>
		</div>
	{/if}
</button>
