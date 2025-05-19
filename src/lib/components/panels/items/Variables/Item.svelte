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
	class={[
		'group animate-fade-in grid grid-cols-[1fr_1fr_auto] items-center justify-between gap-3 py-1.5 text-sm',
		isDetaching && 'animate-pulse'
	]}
>
	<span
		class={[
			'text-main-300 w-fit max-w-full truncate font-mono uppercase',
			'bg-main-800 rounded-md px-2 py-1',
			'border-main-700 border'
		]}
	>
		{variable.spec.key}
	</span>

	<span class="text-main-400 truncate">
		{variable.meta.name}
	</span>

	<div
		class={[
			'pointer-events-none ms-auto flex transform items-center gap-2 opacity-0 transition',
			'group-hover:pointer-events-auto group-hover:opacity-100',
			'hover:text-main-200 text-main-500 active:scale-95',
			'disabled:cursor-wait disabled:opacity-50'
		]}
	>
		<button type="button" title="Detach" onclick={handleDetach} disabled={isDetaching}>
			<IconDetach class={'size-5'} />
		</button>
	</div>
</li>
