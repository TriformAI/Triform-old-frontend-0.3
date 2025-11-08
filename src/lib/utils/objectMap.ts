export function objectMap<T, R>(
	obj: Record<string, T>,
	fn: (value: T, key: string) => R
): Record<string, R> {
	return Object.fromEntries(Object.entries(obj).map(([key, value]) => [key, fn(value, key)]))
}
