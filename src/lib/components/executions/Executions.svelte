<script lang="ts">
	import { type z } from 'zod'
	import { executionsResponseModel } from '$lib/schemas'
	import Disclosure from '../atoms/Disclosure.svelte'
	import IconChevronRight from '~icons/mdi/chevron-right'
	import CodeViewer from '../common/CodeViewer.svelte'
	import { slide } from 'svelte/transition'
	import Executions from './Executions.svelte'
	import IconInput from '~icons/material-symbols/input-circle-rounded'
	import IconOutput from '~icons/material-symbols/output-circle-rounded'
	import { nodeTypesDict } from '$lib/constants/nodeTypes'

	const {
		executions,
		showHeaders
	}: { executions: z.infer<typeof executionsResponseModel>; showHeaders?: boolean } = $props()
</script>

<table class="w-full max-w-full table-fixed">
	<thead>
		{#if showHeaders}
			<tr>
				<th>Status</th>
				<th>Component</th>
				<th>Source</th>
				<th>Created At</th>
				<th>Finished At</th>
			</tr>
		{/if}
	</thead>
	<tbody>
		{#each executions as execution}
			{@const componentType = execution.meta.component?.resource
				? nodeTypesDict[
						execution.meta.component.resource?.split('/')[0] as keyof typeof nodeTypesDict
					]
				: undefined}
			{@const ComponentIcon = componentType?.icon}
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
						<td>
							{#if componentType}
								<ComponentIcon
									class={[componentType.iconClasses, 'mr-2 inline-block align-middle'].join(' ')}
								/>
							{/if}
							{execution.meta.component?.name ?? 'Unknown'}
						</td>
						<td class="capitalize">
							{execution.source?.replace('_', ' ')}
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
							class="ml-8 flex max-h-[85dvh] w-full flex-col gap-4 overflow-y-auto"
							transition:slide={{ axis: 'y' }}
						>
							<Disclosure showChevron>
								{#snippet trigger()}
									<span
										class="text-main-400 group-hover/trigger:text-main-300 in-[.open]:text-main-300 transition"
									>
										<IconInput class="mr-1 inline size-4 shrink-0" />
										Input
									</span>
								{/snippet}
								{#snippet children()}
									<CodeViewer value={JSON.stringify(execution.payload, null, 2)} title="Input" />
								{/snippet}
							</Disclosure>

							{#if execution.children?.length}
								<div class="border-main-800 border-l pl-4">
									<Executions executions={execution.children} />
								</div>
							{/if}

							<Disclosure showChevron>
								{#snippet trigger()}
									<span
										class="text-main-400 group-hover/trigger:text-main-300 in-[.open]:text-main-300 transition"
									>
										<IconOutput class="mr-1 inline size-4 shrink-0" />
										Output
									</span>
								{/snippet}
								{#snippet children()}
									<CodeViewer value={JSON.stringify(execution.output, null, 2)} title="Output" />
								{/snippet}
							</Disclosure>
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
