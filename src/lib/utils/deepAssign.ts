const isPlainObject = (value: unknown): value is Record<string, unknown> =>
	Object.prototype.toString.call(value) === '[object Object]'

export const deepAssign = <T extends Record<string, unknown>>(
	base: T,
	update: DeepPartial<T>
): T => {
	for (const [key, value] of Object.entries(update)) {
		if (value === undefined) continue
		if (typeof value === 'object' && value !== null) {
			// If value is an array, copy it directly.
			if (Array.isArray(value)) {
				;(base as Record<string, unknown>)[key] = value.slice()
			} else if (!isPlainObject(value)) {
				// {{change 2}}: For non-plain objects (Date, Map, Set, etc.), do a shallow assignment.
				;(base as Record<string, unknown>)[key] = value
			} else {
				// Only merge recursively if both base and update are plain objects.
				if (!isPlainObject(base[key])) {
					;(base as Record<string, unknown>)[key] = {}
				}
				deepAssign(base[key] as T, value as T)
			}
		} else {
			;(base as Record<string, unknown>)[key] = value
		}
	}
	return base
}
