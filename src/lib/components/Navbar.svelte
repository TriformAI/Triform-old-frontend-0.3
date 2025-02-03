<script lang="ts">
	// @ts-nocheck
	import logo from '$lib/images/Logo.svg'

	import Button from '$lib/components/atoms/Button.svelte'
	import Dropdown from './common/Dropdown.svelte'

	import { openModal, ModalId } from '$lib/stores/modals.svelte'
	import { getTolgee } from '@tolgee/svelte'

	import { T } from '@tolgee/svelte'

	const tolgee = getTolgee(['language'])
	const lang = $derived($tolgee.getLanguage())
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
		<Button onClick={() => openModal(ModalId.ShareCanvas)}>
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
