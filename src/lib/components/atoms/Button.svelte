<script lang="ts">
	import { type Snippet } from 'svelte'

	import { fly, scale } from 'svelte/transition'

	import AutorenewIcon from '~icons/material-symbols/autorenew-rounded'

	interface Props {
		variation?: 'primary' | 'vibrant' | 'link' | 'danger'
		// disabled
		// href
		// etc...
		body?: Snippet
		icon?: Snippet
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
	}

	let {
		variation = 'primary',
		body,
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
		isLoading = $bindable(false)
	}: Props = $props()

	const hasTextColor = ['danger'].includes(variation)

	const onClick = () => {
		if (href) {
			if (target === '_blank') window.open(href, '_blank')
			else window.location.href = href
		}

		if (typeof onClickProp === 'function') {
			let timeout: ReturnType<typeof setTimeout>
			// Wait a bit before we show the loading indicator, so it doesn't flash
			if (autoLoad === 'promise') timeout = setTimeout(() => (isLoading = true), 75)
			// If it wasn't a promise this will just resolve immediately
			Promise.resolve(onClickProp())
				.then(() => {
					if (autoLoad !== 'promise') return
					if (timeout) clearTimeout(timeout)
					isLoading = false
					// hack, in case the promise is resolved too fast
					// (basically never happens but its pretty catastrophic if it does
					// so better to just fix it like this)
					setTimeout(() => (isLoading = false), 150)
				})
				.catch(_e => {
					if (timeout) clearTimeout(timeout)
					isLoading = false
				})
		}
	}
</script>

<button
	bind:this={element}
	class={[
		variation === 'primary' &&
			'border-main-700 bg-main-800 hover:enabled:border-main-600 hover:enabled:bg-main-700 border',
		variation === 'vibrant' &&
			'bg-accent-700 inset-shadow-accent-500/40 hover:enabled:bg-accent-600 inset-shadow-xs',
		variation === 'link' && 'text-main-200 hover:enabled:bg-main-800',
		variation === 'danger' &&
			'bg-danger-200 text-danger-600 hover:enabled:text-danger-700 hover:enabled:bg-danger-300',
		!icon && !!body && 'px-5',
		!hasTextColor && 'text-main-300 hover:enabled:text-main-200',
		`active:enabled:border-main-500 flex transform cursor-pointer
    flex-row items-center justify-center gap-x-2
    rounded-md p-3
    font-medium transition active:enabled:scale-95
		disabled:cursor-not-allowed disabled:opacity-75`,
		classProp
	]}
	disabled={disabled || isLoading}
	{type}
	onclick={onClick}
	aria-label={tooltip}
	data-balloon-pos={tooltip ? tooltipPos : undefined}
	data-balloon-nofocus
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
					<AutorenewIcon class="animate-spin" />
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
		{@render body?.()}
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
					<AutorenewIcon class="animate-spin" />
				</div>
			{:else}
				<div
					in:fly={{ y: animY, duration: 300, delay: 50 }}
					out:fly={{ y: -animY, duration: 300, delay: 0 }}
					class="col-start-1 row-start-1"
				>
					{@render body?.()}
				</div>
			{/if}
			<!-- Copy of the body to make sure the button is always the same width even when loading -->
			<div class="pointer-events-none invisible col-start-1 row-start-1">
				{@render body?.()}
			</div>
		</div>
	{/if}
</button>
