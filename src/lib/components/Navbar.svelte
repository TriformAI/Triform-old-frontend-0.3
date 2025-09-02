<script lang="ts">
	import logo from '$lib/images/Logo.svg'
	import Dropdown from './common/Dropdown.svelte'
	import { page } from '$app/state'
	import { sessionStore } from '$lib/stores/session.svelte'
	import { authClient } from '$lib/auth-client'
	import { apiStatus } from '$lib/stores/apiStatus.svelte'
	import Spinner from './Spinner.svelte'
	import { goto } from '$app/navigation'
	import type { Snippet } from 'svelte'
	import Button from './atoms/Button.svelte'
	import IconDeploy from '~icons/mdi/rocket-launch'
	import { API } from '$lib/api'
	import { toast } from 'svelte-sonner'
	import { getCurrentContainer } from '$lib/stores/canvas.svelte'

	const api = new API()

	const activeOrganization = authClient.useActiveOrganization()

	const { children }: { children?: Snippet } = $props()

	async function logout() {
		await authClient.signOut({
			fetchOptions: {
				onSuccess: () => {
					goto('/login')
				}
			}
		})
	}

	let isDeploying = $state(false)

	async function deployProject() {
		isDeploying = true
		const result = await api.post<{ data: { id: string } }>(
			`projects/${page.data.project?.id}/deploy`,
			{}
		)

		if (result.success) {
			toast.success('Project deployed successfully!')
		} else {
			toast.error('Failed to deploy project')
		}

		isDeploying = false
	}

	const projectIsEmpty = $derived.by(() => {
		const container = getCurrentContainer()
		if (!container) {
			return undefined
		}

		const { spec, resource } = container
		return resource.startsWith('project') && Object.keys(spec.nodes ?? {}).length === 0
	})
</script>

<header
	class="bg-main-850 sticky top-0 z-30 grid w-full grid-cols-[1fr_4fr_1fr] items-center px-5 py-2"
>
	<a href="/">
		<img alt="Triform logo" src={logo} class="w-10" />
	</a>

	<div class="divide-main-700 mx-auto flex translate-y-[2px] flex-row items-center divide-x">
		<div class="flex items-center pl-5">
			{#if page.data.project}
				{#if children}
					{@render children()}
				{:else}
					<span class="font-medium">Projects</span>
				{/if}
			{/if}

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

	<div class="ms-auto mt-2 flex flex-row items-center gap-8">
		{#if page.data.project && !projectIsEmpty}
			<Button isLoading={isDeploying} variation="vibrant" onClick={deployProject}>
				{#snippet body()}
					<span class=" font-semibold">Deploy project</span>
				{/snippet}
				{#snippet icon()}
					<IconDeploy />
				{/snippet}
			</Button>
		{/if}

		<Dropdown>
			{#snippet trigger()}
				{#if sessionStore.user}
					<img alt="Avatar" src={sessionStore.user.image} class="w-8 rounded-full" />
				{/if}
			{/snippet}

			{#snippet body()}
				<ul class="text-sm">
					<li class="border-main-700 bg-main-800 -mx-1 mb-1 rounded-t border-b px-4 py-2">
						<span class="text-main-400 block">Active Organization</span>
						<div class="flex items-end gap-2">
							<span>{$activeOrganization.data?.name}</span>
							<a
								href="/account/organizations"
								class="text-accent-400 hover:text-accent-300 font-semibold">Change</a
							>
						</div>
					</li>
					<li>
						<a href="/account" class="list-btn w-full">Account</a>
					</li>
					<li>
						<button onclick={logout} class="list-btn w-full">Log out</button>
					</li>
				</ul>
			{/snippet}
		</Dropdown>
	</div>
</header>
