export const pick = <T extends Record<string, unknown>, K extends keyof T>(
	obj: T,
	keys: K[]
): Pick<T, K> =>
	Object.fromEntries(Object.entries(obj).filter(([key]) => keys.includes(key as K))) as Pick<T, K>
