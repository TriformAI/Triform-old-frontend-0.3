<script module lang="ts">
	export type ButtonVariation = 'primary' | 'link'
</script>

<script lang="ts">
	import type { Snippet } from 'svelte'

	import { fly, scale } from 'svelte/transition'

	import AutorenewIcon from '~icons/material-symbols/autorenew-rounded'

	const {
		variation = 'primary',
		body,
		onClick: onClickProp,
		autoLoad,
		icon,
		class: classProp,
		href,
		target,
		disabled
	}: {
		// Will have secondary, muted, link etc as we need them
		variation?: ButtonVariation
		// disabled
		// href
		// etc...
		body?: Snippet
		icon?: Snippet
		// Optionally disable the automatic loading indicator
		autoLoad?: boolean
		// If it returns a promise, show loading indicator until it resolves
		onClick?: () => unknown | Promise<unknown>
		class?: string
		href?: string
		target?: '_blank'
		disabled?: boolean
	} = $props()

	let isLoading = $state(false)
	const onClick = () => {
		if (href) {
			if (target === '_blank') window.open(href, '_blank')
			else window.location.href = href
		}

		if (typeof onClickProp === 'function') {
			try {
				// If it wasn't a promise this will just resolve immediately
				Promise.resolve(onClickProp()).then(() => {
					if (!autoLoad) return
					isLoading = false
					// hack, in case the promise is resolved too fast
					// (basically never happens but its pretty catastrophic if it does
					// so better to just fix it like this)
					setTimeout(() => (isLoading = false), 50)
				})
				if (autoLoad) {
					console.log('loading')
					isLoading = true
				}
			} catch (e) {
				if (autoLoad) isLoading = false
				throw e
			}
		}
	}
</script>

<button
	class="
    {variation === 'primary'
		? 'border border-zinc-700 bg-zinc-800 hover:enabled:border-zinc-600 hover:enabled:bg-zinc-700'
		: ''}
    {variation === 'link' ? 'hover:enabled:bg-zinc-500/10' : ''}
    p-3 {!icon && !!body ? 'px-5' : ''} flex transform cursor-pointer flex-row items-center
    justify-center gap-x-2 rounded-md
    text-zinc-200 transition
    active:enabled:scale-95 active:enabled:border-zinc-500
		disabled:cursor-not-allowed disabled:opacity-75
    {classProp}
  "
	{disabled}
	onclick={onClick}
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
