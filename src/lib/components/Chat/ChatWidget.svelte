<script lang="ts">
	import type { WidgetData, WidgetCompleteCallback } from '$lib/stores/chat.svelte'
	import VariablesPrompt from './widgets/VariablesPrompt.svelte'

	const {
		item,
		onComplete
	}: {
		item: WidgetData
		onComplete?: WidgetCompleteCallback
	} = $props()

	const widgetMap = $derived({
		variable_prompt: {
			component: VariablesPrompt,
			title: 'Required variables',
			description: item.completed
				? 'Variables were provided'
				: 'The variables below are required to execute your components.'
		}
	})

	const { component: Widget, title, description } = $derived(widgetMap[item.data.type])
</script>

<div class={['bg-main-900/60 border-main-800 mb-2 rounded border px-4 pt-3 pb-4']}>
	<h3 class="text-main-300 mb-1 text-base font-medium">
		{title}
	</h3>
	<p class="text-main-500">
		{description}
	</p>
	<Widget {item} {onComplete} />
</div>
