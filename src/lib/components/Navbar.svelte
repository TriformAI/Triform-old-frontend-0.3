<script lang="ts">
	import logo from '$lib/images/Logo.svg'
	import ShareCanvas from '$lib/components/modals/ShareCanvas.svelte'
	import Button from '$lib/components/atoms/Button.svelte'
	import Dropdown from './common/Dropdown.svelte'
	import Dialog from '$lib/components/common/Dialog.svelte'
	import { openModal, ModalId } from '$lib/stores/modals.svelte'
	import { getTolgee } from '@tolgee/svelte'

	import { T } from '@tolgee/svelte'
	import { onMount } from 'svelte'

	const tolgee = getTolgee(['language'])
	const lang = $derived($tolgee.getLanguage())

	let shareModal = $state<HTMLDialogElement>()

	// todo: add more languages and change the way this language selector works
	const toggleLanguage = () => {
		if (lang === 'en') $tolgee.changeLanguage('sv')
		else $tolgee.changeLanguage('en')
	}
</script>

<nav
	class="flex items-center justify-between w-full px-8 py-2 border-b bg-zinc-900 border-b-zinc-700"
>
	<div class="flex items-center overflow-auto gap-x-4">
		<img alt="triform logo" src={logo} class="relative w-8 lg:w-12" />
	</div>

	<div class="flex items-center justify-center gap-x-5">
		<Button
			onClick={() => {
				shareModal?.showModal()
			}}
		>
			{#snippet body()}
				<T keyName="share-canvas-button" defaultValue="Share Canvas" />
			{/snippet}
		</Button>

		<div class="relative pl-5 border-l border-l-zinc-700">
			<Dropdown buttonVariation="link">
				{#snippet button()}
					<img alt="profile logo" src="https://picsum.photos/100" class="w-8 rounded-full" />
				{/snippet}

				{#snippet body()}
					<ul>
						<li>
							<button class="w-full" onclick={toggleLanguage}>
								Language: {lang}
							</button>
						</li>
					</ul>
				{/snippet}
			</Dropdown>
		</div>
	</div>
</nav>

<Dialog class="w-3xl" appearance="center" bind:dialog={shareModal}>
	<ShareCanvas />
</Dialog>
