<script lang="ts">
	import logo from '$lib/images/Logo.svg'
	import { apiStatus } from '$lib/stores/apiStatus.svelte'
	import Spinner from './Spinner.svelte'
	import { type Snippet } from 'svelte'
	import UserNav from './UserNav.svelte'
	import { page } from '$app/state'
	import { getActiveBuildPath, setActiveBuildPath } from '$lib/stores/navbar.svelte'

	interface Props {
		children?: Snippet
		extras?: Snippet
	}

	const { children, extras }: Props = $props()

	const isBuildActive = $derived(
		page.url.pathname.startsWith('/dashboard') || page.url.pathname.startsWith('/project')
	)

	const activeBuildPath = $derived(getActiveBuildPath())
	const onTabClick = (id: string) => {
		if (id === 'build' || !isBuildActive) return
		// if we're leaving the build tab, store the project we were in so we can return to it
		setActiveBuildPath(page.url.pathname)
	}

	const tabs = $derived([
		{
			label: 'Build',
			id: 'build',
			isActive: isBuildActive,
			href: isBuildActive ? '/dashboard' : activeBuildPath
		},
		{
			label: 'Chat',
			id: 'chat',
			href: '/chat',
			isActive: page.url.pathname.startsWith('/chat')
		},
		{
			label: 'Monitor',
			href: '/monitor/executions',
			isActive: page.url.pathname.startsWith('/monitor/executions')
		}
	])
</script>

<header
	class={[
		'bg-main-850 sticky top-0 z-30 w-full max-w-screen items-center px-2 md:pr-5 md:pl-2.5',
		'flex flex-row md:grid md:grid-cols-[1fr_auto_1fr]',
		'border-main-800 border-b'
	]}
>
	<div class="flex h-full flex-row items-center md:gap-4">
		<a href="/" class="py-2">
			<img alt="Triform logo" src={logo} class="mt-1 w-7 md:mt-0 md:w-10" />
		</a>
		<div class="flex h-full flex-row items-center pt-2">
			{#each tabs as tab}
				{@const { isActive } = tab}
				<a
					class={[
						isActive
							? 'text-main-300 hover:text-main-200 border-b-main-900 bg-main-900/90 font-medium'
							: 'text-main-400 hover:text-main-300',
						'flex h-full items-center px-4 transition-all',
						'border-main-800 box-content rounded-t border border-b',
						'not-first:border-l-0',
						'hover:mb-0.5 hover:pb-0.5 active:mb-0 active:pb-0'
					]}
					href={tab.href}
					onclick={() => onTabClick(tab.id)}
				>
					{tab.label}
				</a>
			{/each}
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
