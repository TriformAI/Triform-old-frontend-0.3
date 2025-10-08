<script lang="ts">
	import { Popover } from 'bits-ui'

	let {
		open = $bindable(false),
		side = 'bottom',
		align = 'start',
		sideOffset = 8,
		trigger,
		children,
		portal
	}: {
		open?: boolean
		side?: 'top' | 'bottom' | 'left' | 'right'
		align?: 'start' | 'center' | 'end'
		sideOffset?: number
		trigger?: any
		children?: any
		portal?: HTMLElement
	} = $props()
</script>

<Popover.Root bind:open>
	<Popover.Trigger>
		{@render trigger?.()}
	</Popover.Trigger>
	<Popover.Portal to={portal}>
		<Popover.Content {side} {align} {sideOffset} class="z-10">
			{@render children?.()}
		</Popover.Content>
	</Popover.Portal>
</Popover.Root>
