<script lang="ts">
	import type { WidgetData, WidgetCompleteCallback } from '$lib/stores/chat.svelte'
	import InputField from '$lib/components/atoms/InputField.svelte'
	import IconExternalLink from '~icons/material-symbols/arrow-outward-rounded'
	import Button from '$lib/components/atoms/Button.svelte'
	import { getProject, rollbackContainer } from '$lib/stores/canvas.svelte'
	import { toast } from 'svelte-sonner'
	import { saveProject } from '$lib/actions/project'
	import { clone } from '$lib/utils/clone'
	import { slide } from 'svelte/transition'

	const { item, onComplete }: { item: WidgetData; onComplete?: WidgetCompleteCallback } = $props()

	const variables = $state<Record<string, string>>({})

	const onSubmit = async () => {
		const project = getProject()
		if (!project) return toast.error('No project found')
		const snapshot = clone($state.snapshot(project))
		for (const [key, value] of Object.entries(variables)) {
			const variable = project.spec.environment.variables.find(v => v.key === key)
			if (!variable) project.spec.environment.variables.push({ key, value, secret: false })
			else variable.value = value
		}
		const res = await saveProject(project)
		if (!res.success) {
			rollbackContainer(snapshot)
			return toast.error('Failed to save variables')
		}
		toast.success('Variables saved successfully')

		return await onComplete?.(item.id)
	}

	// just complete without setting the variables
	const onSkip = async () => await onComplete?.(item.id)
</script>

{#if !item.completed}
	<div class="mt-4 flex flex-col gap-6" transition:slide={{ axis: 'y' }}>
		<div class="grid grid-cols-[auto_auto_1fr] items-center gap-2">
			{#each item.data.props.variables as variable}
				<span class="text-main-300 bg-main-950 h-fit w-full rounded px-2 py-1.5 font-mono text-sm">
					{variable.key}
				</span>
				<span class="text-main-500"> = </span>
				<div class="flex flex-col gap-2">
					<InputField
						name={variable.key}
						bind:value={variables[variable.key]}
						placeholder="Value"
						class="font-mono text-sm"
					/>
				</div>
				{#if variable.hint?.text || variable.hint?.url}
					<div class="col-start-3 flex justify-between not-last:mb-3">
						<span class="text-main-400 break-words">
							{variable.hint?.text ?? ''}
						</span>
						{#if variable.hint?.url}
							<a
								href={variable.hint?.url ?? ''}
								target="_blank"
								rel="noopener noreferrer"
								class="text-accent-400 hover:text-accent-300 group/link"
							>
								Get key
								<IconExternalLink
									class="inline size-4 transition group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5"
								/>
							</a>
						{/if}
					</div>
				{/if}
			{/each}
		</div>

		<div class="flex flex-row justify-end gap-2">
			<Button variation="ghost" class="px-8" onClick={onSkip} autoLoad="promise">Skip</Button>
			<Button variation="vibrant" class="px-6" onClick={onSubmit} autoLoad="promise">Submit</Button>
		</div>
	</div>
{/if}
