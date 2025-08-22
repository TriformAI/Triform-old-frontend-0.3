<script lang="ts">
	import { DropdownMenu } from 'bits-ui'
	import { nodeTypes } from '$lib/constants/nodeTypes'
	$inspect(nodeTypes)
	export interface Item {
		id: string
		name: string
		resource: string
	}

	interface Props {
		items: Item[]
		isOpen: boolean
		onSelected: (item: Item) => void
	}

	let { isOpen = $bindable(), onSelected, items }: Props = $props()
</script>

<div>
	<DropdownMenu.Root
		open={isOpen}
		onOpenChange={state => {
			isOpen = state
		}}
	>
		<DropdownMenu.Trigger />

		<DropdownMenu.ContentStatic
			class="bg-main-800 border-main-700 w-full rounded border focus-visible:outline-none"
		>
			{#each items as item}
				{@const NodeData = nodeTypes.find(nt => nt.type === item.resource.split('/')[0])}
				{@const Icon = NodeData?.icon}
				<DropdownMenu.Item
					onSelect={() => {
						onSelected(item)
					}}
					class="text-main-300 data-highlighted:bg-main-700/50 grid grid-cols-[auto_1fr] items-center gap-2 px-2 py-1.5 hover:cursor-pointer focus-visible:outline-none"
				>
					<Icon class={['size-5', NodeData.iconClasses]} />
					{item.name}
				</DropdownMenu.Item>
			{/each}
		</DropdownMenu.ContentStatic>
	</DropdownMenu.Root>
</div>
