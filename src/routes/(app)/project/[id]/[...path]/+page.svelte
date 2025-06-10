<script lang="ts">
	import { breadcrumbs } from '$lib/stores/canvas.svelte'

	const crumbs = $derived.by(() => {
		const data = breadcrumbs()

		if (!data) {
			return ''
		}

		return data
			.slice(1)
			.reverse()
			.map(c => c.name)
			.join(' | ')
	})
</script>

<svelte:head>
	<title>
		{crumbs} | Triform
	</title>
</svelte:head>
