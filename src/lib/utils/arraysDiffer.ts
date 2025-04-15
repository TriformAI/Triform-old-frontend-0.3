// Checks if two arrays have the same items, even if they're in different orders
export const arraysDiffer = <T>(a: T[], b: T[]): boolean => {
	if (a.length !== b.length) return true
	return a.some(value => !b.includes(value))
}
