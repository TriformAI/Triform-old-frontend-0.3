<script lang="ts">
	import type { Snippet } from 'svelte'
	import ChevronDown from '~icons/mdi/chevron-down'

	let {
		children,
		dialog = $bindable(),
		appearance = 'center',
		onClose,
		closeByClickOutside = true,
		allowEscapeClose = true,
		class: classes
	}: {
		children: Snippet
		dialog: HTMLDialogElement | undefined
		appearance: 'center' | 'bottom'
		onClose?: () => void
		closeByClickOutside?: boolean
		allowEscapeClose?: boolean
		class?: string
	} = $props()

	function clickOutside(el: HTMLDialogElement) {
		el.addEventListener('click', e => {
			if (closeByClickOutside && e.target === el) {
				el.close()
			}
		})
	}
</script>

<dialog
	use:clickOutside
	bind:this={dialog}
	onclose={() => {
		console.log('onclose')

		if (onClose) {
			onClose()
		}
	}}
	class={[
		classes,
		appearance,
		`fixed m-0 overflow-visible bg-transparent`,
		appearance === 'center' && 'top-1/2 mx-auto w-full max-w-md rounded-lg md:max-w-xl',
		appearance === 'bottom' && 'inset-x-0 top-auto bottom-0 w-full max-w-none'
	]}
>
	<div class="grid">
		{#if appearance === 'bottom'}
			<button
				type="button"
				class="bg-main-800/50 mx-auto rounded-b px-8 outline-none"
				onclick={() => {
					dialog?.close()
				}}
			>
				<ChevronDown class="mx-auto size-6 text-white" />
			</button>
			<!-- {:else if appearance === 'center'}
			<button
				type="button"
				class="absolute end-6 top-5.5 z-10 outline-none"
				onclick={() => {
					dialog?.close()
				}}
			>
				<Close class="size-5 text-white" />
			</button> -->
		{/if}

		{@render children()}
	</div>
</dialog>

<style>
	dialog.center {
		transition:
			opacity 0.2s var(--easing-circ),
			transform 0.2s ease-in-out,
			display 0.2s,
			overlay 0.2s;
		transition-behavior: allow-discrete;
		transform: translateY(-50%) scale(0.98);
		opacity: 0;
	}

	dialog.center[open] {
		opacity: 1;
		transform: translateY(-50%) scale(1);
		transition:
			opacity 0.3s var(--easing-circ),
			transform 0.3s ease-in-out,
			display 0.3s,
			overlay 0.3s;
	}

	dialog.center::backdrop {
		transition:
			backdrop-filter 0.3s ease-out,
			opacity 0.3s ease-out;
		background-color: rgba(0, 0, 0, 0.5);
		backdrop-filter: blur(0px);
		opacity: 0;
	}

	dialog.center[open]::backdrop {
		backdrop-filter: blur(var(--blur-xs));
		opacity: 1;
	}

	@starting-style {
		dialog.center[open] {
			opacity: 0;
			transform: translateY(-50%) scale(0.925);
		}

		dialog.center[open]::backdrop {
			backdrop-filter: blur(0px);
			opacity: 0;
		}
	}

	dialog.bottom {
		transform: translateY(100%);
		transition:
			transform 0.5s var(--easing-circ),
			overlay 0.3s ease-out allow-discrete,
			display 0.3s ease-out allow-discrete;
	}

	dialog.bottom[open] {
		transform: translateY(0%);
	}

	@starting-style {
		dialog.bottom[open] {
			transform: translateY(100%);
		}
	}
</style>
