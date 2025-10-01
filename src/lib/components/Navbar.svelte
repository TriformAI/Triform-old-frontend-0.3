<script lang="ts">
	import logo from '$lib/images/Logo.svg'
	import { apiStatus } from '$lib/stores/apiStatus.svelte'
	import Spinner from './Spinner.svelte'
	import { type Snippet } from 'svelte'
	import UserNav from './UserNav.svelte'

	interface Props {
		children?: Snippet
		extras?: Snippet
	}

	const { children, extras }: Props = $props()
</script>

<header
	class="bg-main-850 sticky top-0 z-30 grid w-full grid-cols-[1fr_auto_1fr] items-center px-5 py-2"
>
	<a href="/">
		<img alt="Triform logo" src={logo} class="w-10" />
	</a>

	<div class="divide-main-700 mx-auto flex translate-y-[2px] flex-row items-center divide-x">
		<div class="flex items-center pl-5">
			{@render children?.()}

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

	<div class="ms-auto mt-2 flex flex-row items-center gap-4">
		{@render extras?.()}

		<UserNav />
	</div>
</header>
