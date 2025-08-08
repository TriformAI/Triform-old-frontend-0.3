<script lang="ts">
	import CronInput from './CronInput.svelte'
	import Payload from '../common/Payload.svelte'

	let {
		trigger,
		cronFields = $bindable(),
		payload = $bindable(),
		hasCronErrors = $bindable(),
		hasJsonErrors = $bindable()
	}: {
		trigger: any
		cronFields: {
			minute: string
			hour: string
			day: string
			month: string
			weekday: string
		}
		payload: string
		hasCronErrors: boolean
		hasJsonErrors: boolean
	} = $props()

	// Update trigger schedule when cron fields change
	$effect(() => {
		if (trigger?.spec) {
			trigger.spec.schedule = Object.values(cronFields).join(' ')
		}
	})

	// Update trigger payload when payload changes
	$effect(() => {
		if (trigger?.spec && payload) {
			try {
				trigger.spec.payload = JSON.parse(payload)
			} catch {
				// Invalid JSON, keep the string value
				trigger.spec.payload = {}
			}
		}
	})
</script>

{#if trigger}
	<div>
		<h4 class="eyebrow">Schedule</h4>
		<CronInput bind:cronFields bind:hasErrors={hasCronErrors} />
	</div>
	<div>
		<h4 class="eyebrow">Payload</h4>
		<Payload usePortal={true} bind:value={payload} bind:hasJsonErrors />
	</div>
{/if}
