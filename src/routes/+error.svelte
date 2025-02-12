<script>
	import { goto } from '$app/navigation'
	import Button from '$lib/components/atoms/Button.svelte'
</script>

<section
	class="bg-website-dark-primary flex h-screen flex-col items-center justify-center text-white dark:bg-zinc-900"
>
	<div class="mx-auto px-4 py-8 lg:px-6 lg:py-16">
		<div class="mx-auto text-center">
			<h1 class="error404Head">404</h1>
			<p class="mb-4 text-3xl font-bold tracking-tight text-zinc-900 md:text-4xl dark:text-white">
				Page Not Found
			</p>
			<p class="mb-6 font-light text-zinc-500 dark:text-zinc-400">
				Sorry, we can't find that page
			</p>
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
