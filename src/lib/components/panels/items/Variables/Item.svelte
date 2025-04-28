<script lang="ts">
	import type { Variable } from '$lib/types/project'
	import { page } from '$app/state'

	import IconDetach from '~icons/mdi/link-variant-off'
	import IconVariable from '~icons/mdi/application-variable-outline'
	import { enhance } from '$app/forms'
	import { toast } from 'svelte-sonner'
	import { invalidate } from '$app/navigation'
	import { confirmStore } from '$lib/stores/confirm.svelte'
	import { API } from '$lib/api'
	import { selected } from '$lib/stores/canvas.svelte'

	let { variable, onEdit }: { variable: Variable; onEdit: () => void } = $props()

	let isDetaching = $state(false)

	const projectId = page.data.project?.meta.id
	const nodePath = selected.node?.data.path.join('/')

	async function handleDetach() {
		const api = new API()
		isDetaching = true

		try {
			await api.delete(`projects/${projectId}/variable/${variable.meta.id}?nodePath=${nodePath}`)
			toast.success('Variable detached')
			invalidate('project')
		} catch (error) {
			toast.error('Failed to detach variable')
		} finally {
			isDetaching = false
		}
	}
</script>

<li
	class="border-main-800 group animate-fade-in grid grid-cols-[1fr_1fr_auto] items-start justify-between gap-3 border-b py-1.5 text-sm"
>
	<span class="inline-flex items-center gap-2 truncate font-normal uppercase">
		<IconVariable class="size-4" />
		<span class="text-main-400">{variable.spec.key}</span>
	</span>

	<span>
		{variable.spec.value.dev}
	</span>

	<div class="invisible ms-auto flex items-center gap-2 group-hover:visible">
		<button type="button" title="Detach" onclick={handleDetach} disabled={isDetaching}>
			<IconDetach class={['text-main-400 size-5', isDetaching && 'animate-pulse']} />
		</button>
	</div>
</li>
