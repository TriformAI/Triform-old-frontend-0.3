<script lang="ts">
	import type { Snippet } from 'svelte'
	import ChevronDown from '~icons/mdi/chevron-down'

	interface Props {
		children: Snippet
		dialog: HTMLDialogElement | undefined
		appearance: 'center' | 'right' | 'bottom'
		onClose?: VoidFunction
	}

	let { children, dialog = $bindable(), appearance, onClose }: Props = $props()
</script>

<dialog
	bind:this={dialog}
	onclose={() => {
		if (onClose) {
			onClose()
		}
	}}
	class={[
		appearance,
		`bg-zinc-950 grid fixed m-0 px-5 pb-5`,
		appearance === 'center' &&
			'top-1/2 mx-auto w-full max-w-xs -translate-y-1/2 rounded-lg md:max-w-md',
		appearance === 'bottom' && 'top-auto w-full bottom-0 inset-x-0 max-w-none'
	]}
>
	<button
		type="button"
		class="mx-auto bg-zinc-800/50 px-8 rounded-b outline-none"
		onclick={() => {
			dialog?.close()
		}}
	>
		<ChevronDown class="mx-auto text-white size-6" />
	</button>
	{@render children()}
</dialog>

<style>
	/*   Closed state of the dialog   */
	dialog.center {
		transform: scale(0.9);

		transition:
			transform 0s var(--emphasized-easing),
			overlay 0s ease-out allow-discrete,
			display 0s ease-out allow-discrete;
	}

	dialog.center[open] {
		transform: scale(1);
		transition:
			transform 0.5s var(--spring-easing),
			overlay 0.5s ease-out allow-discrete,
			display 0.5s ease-out allow-discrete;
	}

	/*   Before-open state  */
	/* Needs to be after the previous dialog[open] rule to take effect,
    as the specificity is the same */
	@starting-style {
		dialog.center[open] {
			transform: scale(0.9);
		}
	}

	/*   Closed state of the dialog   */
	dialog.bottom {
		transform: translateY(100%);
		transition:
			transform 0.5s cubic-bezier(0.85, 0.09, 0.15, 0.91),
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
</style>
