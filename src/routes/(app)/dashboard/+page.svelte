<script lang="ts">
	import type { Project } from '$lib/types/project'

	import Button from '$lib/components/atoms/Button.svelte'
	import NewProject from '$lib/components/modals/NewProject.svelte'

	import IconChevronRight from '~icons/material-symbols/chevron-right'
	import IconAdd from '~icons/material-symbols/new-window-rounded'

	import testProject from '$lib/dev/test-project.json'

	const projects: Project[] = [testProject, testProject]

	let projectDialog = $state<HTMLDialogElement | undefined>(undefined)
</script>

<div>
	<NewProject bind:dialog={projectDialog} />

	<div class="flex flex-row justify-start gap-2">
		<h1 class="text-2xl font-semibold text-zinc-300">Projects</h1>
		<Button variation="link" onClick={() => projectDialog?.showModal()}>
			{#snippet icon()}
				<IconAdd />
			{/snippet}
		</Button>
	</div>
	<div class="mt-4 grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-4">
		{#each projects as project}
			<a
				class="
				bg-zinc-850 group/project relative flex w-full transform flex-row items-center
					justify-between gap-5 rounded-lg border border-zinc-700
					p-4 pr-8 transition hover:border-zinc-600 hover:bg-zinc-800
				"
				href="/project/{project.meta.id}"
			>
				<div>
					<h2>{project.meta.name}</h2>
					<p class="text-zinc-400">Last modified sometime</p>
				</div>
				<div
					class="absolute right-4 opacity-0 transition-all duration-300 group-hover/project:right-1 group-hover/project:opacity-100"
				>
					<IconChevronRight class="text-lg text-zinc-400" />
				</div>
			</a>
		{/each}
	</div>
</div>
