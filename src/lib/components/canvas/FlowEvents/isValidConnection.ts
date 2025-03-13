import type { IsValidConnection as IsValidConnectionType, useSvelteFlow } from '@xyflow/svelte'

export const isValidConnection: AddParameters<
	IsValidConnectionType,
	[ReturnType<typeof useSvelteFlow>]
> = (connection, useSvelteFlow) => {
	console.log(connection)
	return true
}
