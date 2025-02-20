<script lang="ts">
	import logo from '$lib/images/Logo.svg'
	import Dropdown from './common/Dropdown.svelte'
	import { currentCanvas } from '$lib/stores/canvas.svelte'
	// import { getTolgee } from '@tolgee/svelte'

	import { page } from '$app/state'

	// const tolgee = getTolgee(['language'])
	// const lang = $derived($tolgee.getLanguage())

	// todo: add more languages and change the way this language selector works
	// const toggleLanguage = () => {
	// 	if (lang === 'en') $tolgee.changeLanguage('sv')
	// 	else $tolgee.changeLanguage('en')
	// }
</script>

<div
	class="border-b-main-800 bg-main-900 flex w-full items-center justify-between border-b px-8 py-2"
>
	<div class="divide-main-800 flex flex-row items-center divide-x">
		<a href="/" class="pr-5">
			<img alt="Triform logo" src={logo} class="w-10" />
		</a>

		<span class="pl-5 text-zinc-300">
			{currentCanvas.project?.meta.name}
		</span>
	</div>

	<div class="mt-2">
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
</div>
