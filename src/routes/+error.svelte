<script>
	import { goto } from '$app/navigation'
	import { page } from '$app/state'
	import Button from '$lib/components/atoms/Button.svelte'
	$inspect(page.error)
</script>

<svelte:head>
	<title>Error | Triform</title>
</svelte:head>

<section class="bg-main-900 flex h-screen flex-col items-center justify-center text-white">
	<div class="mx-auto px-4 py-8 lg:px-6 lg:py-16">
		<div class="mx-auto flex flex-col gap-y-4 text-center">
			<h1 class="text-7xl font-bold">
				{page.status}
			</h1>
			<p class="text-main-500 mb-6 text-xl">
				{page.error.error ?? 'An unknown error occurred'}
			</p>
			<div class="flex items-center justify-center">
				<Button variation="primary" onClick={() => goto('/')}>
					{#snippet body()}
						Go home
					{/snippet}
				</Button>
			</div>
		</div>
	</div>
</section>
