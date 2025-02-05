<script lang="ts">
	import type { Snippet } from 'svelte'
	import ChevronDown from '~icons/mdi/chevron-down'
	import Close from '~icons/mdi/close'

	interface Props {
		children: Snippet
		dialog: HTMLDialogElement | undefined
		appearance: 'center' | 'bottom'
		onClose?: VoidFunction
		closeByClickOutside?: boolean
		class?: string
	}

	let {
		children,
		dialog = $bindable(),
		appearance = 'center',
		onClose,
		closeByClickOutside = true,
		class: classes
	}: Props = $props()

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
		if (onClose) {
			onClose()
		}
	}}
	class={[
		classes,
		appearance,
		`fixed m-0 overflow-visible bg-transparent`,
		appearance === 'center' && 'top-1/2 mx-auto w-full max-w-xs rounded-lg md:max-w-xl',
		appearance === 'bottom' && 'inset-x-0 top-auto bottom-0 w-full max-w-none'
	]}
>
	<div class="grid">
		{#if appearance === 'bottom'}
			<button
				type="button"
				class="mx-auto rounded-b bg-zinc-800/50 px-8 outline-none"
				onclick={() => {
					dialog?.close()
				}}
			>
				<ChevronDown class="mx-auto size-6 text-white" />
			</button>
		{:else if appearance === 'center'}
			<button
				type="button"
				class="absolute end-6 top-5.5 z-10 outline-none"
				onclick={() => {
					dialog?.close()
				}}
			>
				<Close class="size-5 text-white" />
			</button>
		{/if}

		{@render children()}
	</div>
</dialog>

<style>
	dialog.center {
		transition:
			opacity 0.1s var(--easing-circ),
			display 0.1s,
			overlay 0.1s;
		transition-behavior: allow-discrete;
		transform: translateY(-50%);
		opacity: 0;
	}

	dialog.center[open] {
		opacity: 1;
		transition:
			opacity 0.3s var(--easing-circ),
			display 0.3s,
			overlay 0.3s;
	}

	dialog.center::backdrop {
		transition: backdrop-filter 0.3s ease-out;
		background-color: rgba(0, 0, 0, 0.05);
		backdrop-filter: blur(0px);
	}

	dialog.center[open]::backdrop {
		backdrop-filter: blur(var(--blur-md));
	}

	@starting-style {
		dialog.center[open] {
			opacity: 0;
			transform: translateY(-50%);
		}

		dialog.center[open]::backdrop {
			backdrop-filter: blur(0px);
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
