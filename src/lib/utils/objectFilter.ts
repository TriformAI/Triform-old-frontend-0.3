export const objFilter = <T>(
	obj: Record<string, T>,
	predicate: (key: string, value: T) => boolean
): Record<string, T> => {
	return Object.fromEntries(Object.entries(obj).filter(([key, value]) => predicate(key, value)))
}
