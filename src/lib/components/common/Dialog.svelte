<script lang="ts">
	import { onMount, untrack, type Snippet } from 'svelte'
	import IconChevronDown from '~icons/mdi/chevron-down'
	import IconClose from '~icons/mdi/close'
	import { Toaster } from 'svelte-sonner'

	interface Props {
		children: Snippet
		dialog: HTMLDialogElement | undefined
		appearance: 'center' | 'bottom' | 'right'
		onClose?: () => void
		onOpen?: () => void
		closeByClickOutside?: boolean
		allowEscapeClose?: boolean
		class?: string
		open?: boolean
	}

	let {
		children,
		dialog = $bindable(),
		appearance = 'center',
		onClose,
		onOpen,
		closeByClickOutside = true,
		// allowEscapeClose = true,
		class: classes,
		open
	}: Props = $props()

	function clickOutside(el: HTMLDialogElement) {
		el.addEventListener('click', e => {
			if (closeByClickOutside && e.target === el) {
				el.close()
			}
		})
	}

	let isOpen = $state(false)

	$effect(() => {
		if (isOpen) untrack(() => onOpen?.())
	})

	onMount(() => {
		if (dialog) {
			const observer = new MutationObserver(() => {
				isOpen = !!dialog?.open
			})
			observer.observe(dialog, { attributes: true })

			return () => observer.disconnect()
		}
	})
</script>

<dialog
	{open}
	use:clickOutside
	bind:this={dialog}
	onclose={() => onClose?.()}
	class={[
		classes,
		appearance,
		'text-main-300 fixed m-0 overflow-visible bg-transparent',
		appearance === 'center' && 'top-1/2 mx-auto w-full max-w-md rounded-lg md:max-w-xl',
		appearance === 'bottom' && 'inset-x-0 top-auto bottom-0 w-full max-w-none',
		appearance === 'right' &&
			'inset-y-0 left-[min(calc(100vw-max(75vw,30rem)),calc(100vw-30rem))] grid h-dvh max-h-dvh w-[max(75vw,30rem)] md:left-[min(calc(100vw-max(25vw,30rem)),calc(100vw-30rem))] md:w-[max(25vw,30rem)]'
	]}
>
	{#if isOpen}
		<div class="toast-container absolute">
			<Toaster richColors position="top-left" />
		</div>
	{/if}

	<div class={['grid', appearance === 'right' && 'bg-main-850 p-6']}>
		{#if appearance === 'bottom'}
			<button
				type="button"
				class="bg-main-800/50 mx-auto rounded-b px-8 outline-none"
				onclick={() => {
					dialog?.close()
				}}
			>
				<IconChevronDown class="mx-auto size-6 text-white" />
			</button>
		{:else if appearance === 'right'}
			<button
				type="button"
				class="absolute end-6 top-5.5 z-10 outline-none"
				onclick={() => {
					dialog?.close()
				}}
			>
				<IconClose class="size-5 text-white" />
			</button>
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

		&[open] {
			opacity: 1;
			transform: translateY(-50%) scale(1);
			transition:
				opacity 0.3s var(--easing-circ),
				transform 0.3s ease-in-out,
				display 0.3s,
				overlay 0.3s;

			@starting-style {
				opacity: 0;
				transform: translateY(-50%) scale(0.925);
			}
		}
	}

	dialog.center::backdrop {
		transition:
			backdrop-filter 0.3s ease-out,
			opacity 0.3s ease-out;
		background-color: rgba(0, 0, 0, 0.5);
		backdrop-filter: blur(0px);
		opacity: 0;
		transition-behavior: allow-discrete;
	}

	dialog.center[open]::backdrop {
		backdrop-filter: blur(var(--blur-xs));
		opacity: 1;

		@starting-style {
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

		[open] {
			transform: translateY(0%);
			@starting-style {
				transform: translateY(100%);
			}
		}
	}

	/*   Closed state of the dialog   */
	dialog.right {
		transform: translateX(100%);
		transition:
			transform 0.5s var(--easing-circ),
			overlay 0.3s ease-out allow-discrete,
			display 0.3s ease-out allow-discrete;

		&[open] {
			transform: translateX(0%);

			@starting-style {
				transform: translateX(100%);
			}
		}
	}

	dialog.right::backdrop {
		transition:
			backdrop-filter 0.3s ease-out,
			opacity 0.3s ease-out;
		background-color: rgba(0, 0, 0, 0.5);
		backdrop-filter: blur(0px);
		opacity: 0;
	}

	dialog.right[open]::backdrop {
		backdrop-filter: blur(var(--blur-xs));
		opacity: 1;

		@starting-style {
			backdrop-filter: blur(0px);
			opacity: 0;
		}
	}

	dialog.right .toast-container {
		transform: translateX(calc(-100vw + 480px));
		float: left;
	}

	dialog.center .toast-container {
		transform: translateY(calc(-33vh)) translateX(calc(-50vw + 300px));
		float: left;
	}
</style>
