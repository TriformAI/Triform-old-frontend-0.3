<script lang="ts">
	import IconAction from '~icons/mdi/rhombus'
	import IconFlow from '~icons/material-symbols/network-node'
	import IconEndpoint from '~icons/material-symbols/bolt'

	interface Props {
		type: string
	}

	let { type }: Props = $props()

	const Icon = $derived.by(() => {
		return {
			action: IconAction,
			flow: IconFlow,
			endpoint: IconEndpoint
		}[type]
	})
</script>

<Icon />
