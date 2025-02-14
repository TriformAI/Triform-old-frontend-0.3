<script lang="ts">
	import logo from '$lib/images/Logo.svg'
	// import { getTolgee } from '@tolgee/svelte'
	import { userData } from '$lib/stores/user.svelte'

	// const tolgee = getTolgee(['language'])
	// const lang = $derived($tolgee.getLanguage())

	// todo: add more languages and change the way this language selector works
	// const toggleLanguage = () => {
	// 	if (lang === 'en') $tolgee.changeLanguage('sv')
	// 	else $tolgee.changeLanguage('en')
	// }
</script>

<div
	class="flex w-full items-center justify-between border-b border-b-zinc-700 bg-zinc-900 px-8 py-2"
>
	<a href="/dashboard">
		<img alt="Triform logo" src={logo} class="-ms-2 w-10 lg:w-12" />
	</a>

	<img alt="Avatar" src={userData()?.avatar} class="w-8 rounded-full py-2" />

	<!-- <Dropdown buttonVariation="link">
		{#snippet button()}
			<img alt="Avatar" src={userData()?.avatar} class="w-8 rounded-full" />
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
	</Dropdown> -->
</div>
