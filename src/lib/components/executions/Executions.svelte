<script lang="ts">
	import { type z } from 'zod'
	import { executionsResponseModel } from '$lib/schemas'
	import Disclosure from '../atoms/Disclosure.svelte'
	import IconChevronRight from '~icons/mdi/chevron-right'
	import CodeViewer from '../common/CodeViewer.svelte'
	import { slide } from 'svelte/transition'
	import Executions from './Executions.svelte'

	const { executions }: { executions: z.infer<typeof executionsResponseModel> } = $props()
</script>

<table class="w-full table-fixed">
	<thead>
		<tr>
			<th>Status</th>
			<th>Source</th>
			<th>Created At</th>
			<th>Finished At</th>
		</tr>
	</thead>
	<tbody>
		{#each executions as execution}
			<Disclosure transparentLayout contentClass="contents" disableAnimation>
				{#snippet trigger()}
					<tr
						class="text-main-400 hover:text-main-300 group-[.open]/trigger:text-main-300 transition"
					>
						<td class="flex items-center gap-2 capitalize">
							<IconChevronRight
								class={[
									'-ml-4 size-4 shrink-0 opacity-0 transition-all',
									'group-hover/trigger:ml-0 group-hover/trigger:opacity-100 ',
									'group-[.open]/trigger:ml-0 group-[.open]/trigger:rotate-90 group-[.open]/trigger:opacity-100'
								].join(' ')}
							/>
							<div
								class={[
									'size-2 shrink-0 rounded-full',
									execution.state === 'completed' && 'bg-success',
									execution.state === 'failed' && 'bg-danger-500',
									execution.state === 'running' && 'bg-accent-500 animate-pulse',
									execution.state === 'pending' && 'border-main-400 border'
								]}
							></div>
							{execution.state}
						</td>
						<td class="capitalize">
							{execution.source}
						</td>
						<td>
							{execution.createdAt?.toLocaleString() ?? 'N/A'}
						</td>
						<td>
							{execution.finishedAt?.toLocaleString() ?? 'N/A'}
						</td>
					</tr>
				{/snippet}

				<tr>
					<td colspan="4" class="p-0">
						<!-- TODO: better scrolling... -->
						<div
							class="grid max-h-[85dvh] w-full grid-cols-[1fr_1fr] gap-4 overflow-y-auto"
							transition:slide={{ axis: 'y' }}
						>
							<CodeViewer value={JSON.stringify(execution.payload, null, 2)} title="Input" />
							<CodeViewer value={JSON.stringify(execution.output, null, 2)} title="Output" />
						</div>
					</td>
				</tr>
			</Disclosure>
		{:else}
			<tr>
				<td colspan="4">Your executions will appear here</td>
			</tr>
		{/each}
	</tbody>
</table>
