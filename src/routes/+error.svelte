<script>
	import { goto } from '$app/navigation'
	import Button from '$lib/components/atoms/Button.svelte'
</script>

<section
	class="bg-main-900 dark:bg-main-900 flex h-screen flex-col items-center justify-center text-white"
>
	<div class="mx-auto px-4 py-8 lg:px-6 lg:py-16">
		<div class="mx-auto text-center">
			<h1 class="error404Head">404</h1>
			<p class="text-main-900 mb-4 text-3xl font-bold tracking-tight md:text-4xl dark:text-white">
				Page Not Found
			</p>
			<p class="text-main-500 dark:text-main-400 mb-6 font-light">Sorry, we can't find that page</p>
			<div class="flex items-center justify-center">
				<Button variation="primary" onClick={() => goto('/')}>
					{#snippet body()}
						Go To Homepage
					{/snippet}
				</Button>
			</div>
		</div>
	</div>
</section>

<style>
	.error404Head {
		font-size: 7rem;
		font-weight: 700;
	}
</style>
