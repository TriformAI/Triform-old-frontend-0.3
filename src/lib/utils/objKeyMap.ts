export const objKeyMap = <T, R>(
	obj: Record<string, T>,
	fn: (key: string, value: T) => R
) =>
	Object.fromEntries(
		Object.entries(obj).map(([key, value]) => [fn(key, value), value])
	)