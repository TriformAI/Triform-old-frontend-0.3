<script lang="ts">
	import logo from '$lib/images/Logo.svg'
	import Dropdown from './common/Dropdown.svelte'
	import { getTolgee } from '@tolgee/svelte'
	import { T } from '@tolgee/svelte'

	import { page } from '$app/state'

	const tolgee = getTolgee(['language'])
	const lang = $derived($tolgee.getLanguage())

	// todo: add more languages and change the way this language selector works
	const toggleLanguage = () => {
		if (lang === 'en') $tolgee.changeLanguage('sv')
		else $tolgee.changeLanguage('en')
	}
</script>

<div
	class="flex w-full items-center justify-between border-b border-b-zinc-700 bg-zinc-900 px-8 py-2"
>
	<img alt="Triform logo" src={logo} class="-ms-2 w-8 lg:w-12" />

	<Dropdown>
		{#snippet trigger()}
			<img alt="Avatar" src={page.data.user?.avatar} class="w-8 rounded-full" />
		{/snippet}

		{#snippet body()}
			<ul>
				<li>
					<form action="/logout" method="post">
						<button type="submit" class="list-btn w-full">Log out</button>
					</form>
				</li>
			</ul>
		{/snippet}
	</Dropdown>
</div>
