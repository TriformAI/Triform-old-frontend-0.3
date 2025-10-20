<script lang="ts">
	import logo from '$lib/images/Logo.svg'
	import { apiStatus } from '$lib/stores/apiStatus.svelte'
	import Spinner from './Spinner.svelte'
	import { type Snippet } from 'svelte'
	import UserNav from './UserNav.svelte'
	import { page } from '$app/state'

	interface Props {
		children?: Snippet
		extras?: Snippet
	}

	const { children, extras }: Props = $props()

	const isChat = $derived(page.url.pathname.startsWith('/chat'))
</script>

<header
	class={[
		'bg-main-850 sticky top-0 z-30 w-full items-center px-2 py-2 md:pr-5 md:pl-2.5',
		'flex flex-row md:grid md:grid-cols-[1fr_auto_1fr]'
	]}
>
	<div class="flex flex-row items-center md:gap-4">
		<a href="/">
			<img alt="Triform logo" src={logo} class="mt-1 w-7 md:mt-0 md:w-10" />
		</a>
		<div class="flex flex-row items-center gap-2">
			<a
				href="/dashboard"
				class={[
					isChat
						? 'text-main-500 hover:text-main-400'
						: 'text-main-300 hover:text-main-200 font-medium',
					'transition'
				]}
			>
				Build
			</a>
			<span class="text-main-500 font-medium"> / </span>
			<a
				href="/chat"
				class={[
					isChat
						? 'text-main-300 hover:text-main-200 font-medium'
						: 'text-main-500 hover:text-main-400',
					'transition'
				]}
			>
				Chat
			</a>
		</div>
	</div>

	<div
		class="divide-main-700 mx-auto flex min-w-0 translate-y-[2px] flex-row items-center divide-x"
	>
		<div class="flex min-w-0 items-center pl-2 md:pl-5">
			<div class="min-w-0 flex-1">
				{@render children?.()}
			</div>

			<p class="text-complement-500 ms-2 grid text-sm font-semibold *:col-start-1 *:row-start-1">
				<span
					class={[
						'transition-opacity duration-300',
						apiStatus.saving ? 'opacity-100' : 'opacity-0'
					]}
				>
					<Spinner class="size-4" />
				</span>
			</p>
		</div>
	</div>

	<div class="ms-auto mt-2 flex shrink-0 flex-row items-center justify-end gap-4 md:w-full">
		{@render extras?.()}

		<UserNav />
	</div>
</header>
