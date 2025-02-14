<script lang="ts">
	import Dialog from '$lib/components/common/Dialog.svelte'

	import Card from '$lib/components/common/Card.svelte'
	import InputField from '../atoms/InputField.svelte'
	import Button from '../atoms/Button.svelte'

	let {
		dialog = $bindable()
	}: {
		dialog: HTMLDialogElement | undefined
	} = $props()

	let projectName = $state('')
	const createProject = () => {
		console.log('create project', projectName)
	}
</script>

<Dialog bind:dialog appearance="center">
	<Card onClose={() => dialog?.close()}>
		{#snippet header()}
			New Project
		{/snippet}

		{#snippet body()}
			<p class="mb-5 w-full text-zinc-300">
				A project is a discrete collection of nodes that are connected into a flow
			</p>

			<InputField bind:value={projectName} label="Project Name" placeholder="Project Name" />

			<Button variation="primary" class="mt-5 w-full" onClick={createProject}>
				{#snippet body()}
					Create
				{/snippet}
			</Button>
		{/snippet}
	</Card>
</Dialog>
