<script lang="ts">
	import type { Snippet } from 'svelte'
	import ChevronDown from '~icons/mdi/chevron-down'
	import Close from '~icons/mdi/close'

	interface Props {
		children: Snippet
		dialog: HTMLDialogElement | undefined
		appearance: 'center' | 'right' | 'bottom'
		onClose?: VoidFunction
		class?: string
	}

	let {
		children,
		dialog = $bindable(),
		appearance = 'center',
		onClose,
		class: classes
	}: Props = $props()
</script>

<dialog
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
				class="absolute end-4 top-4 z-10 outline-none"
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
	dialog {
		--easing: cubic-bezier(0.85, 0.09, 0.15, 0.91);
	}

	/*   Closed state of the dialog   */
	dialog.center {
		transform: scale(0.9) translateY(-50%);
		transition:
			transform 0s var(--easing),
			overlay 0s ease-out allow-discrete,
			display 0s ease-out allow-discrete;
	}

	dialog.center[open] {
		transform: scale(1) translateY(-50%);
		transition:
			transform 0.5s var(--easing),
			overlay 0.5s ease-out allow-discrete,
			display 0.5s ease-out allow-discrete;
	}

	/*   Before-open state  */
	/* Needs to be after the previous dialog[open] rule to take effect,
    as the specificity is the same */
	@starting-style {
		dialog.center[open] {
			transform: scale(0.9) translateY(-50%);
		}
	}

	/*   Closed state of the dialog   */
	dialog.bottom {
		transform: translateY(100%);
		transition:
			transform 0.5s var(--easing),
			overlay 0.3s ease-out allow-discrete,
			display 0.3s ease-out allow-discrete;
	}

	dialog.bottom[open] {
		transform: translateY(0%);
	}

	/*   Before-open state  */
	/* Needs to be after the previous dialog[open] rule to take effect,
    as the specificity is the same */
	@starting-style {
		dialog.bottom[open] {
			transform: translateY(100%);
		}
	}

	dialog.center::backdrop {
		background: var(--color-zinc-950);
		opacity: 0;
		transition: opacity 0.3s ease-out;
	}

	dialog.center[open]::backdrop {
		opacity: 1;
	}

	@starting-style {
		dialog[open]::backdrop {
			opacity: 0;
		}
	}
</style>
