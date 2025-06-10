<script lang="ts">
	const { data } = $props()
</script>

<svelte:head>
	<title>{data.project?.meta?.name || 'Project'} | Triform</title>
</svelte:head>
