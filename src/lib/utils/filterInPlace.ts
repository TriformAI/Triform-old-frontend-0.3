export const filterInPlace = async <T>(
	arr: T[],
	predicate: (item: T, index?: number) => boolean
) => {
	let i = 0
	let j = 0

	while (i < arr.length) {
		const val = arr[i]
		if (predicate(val, i)) arr[j++] = val
		i += 1
	}

	arr.length = j
	return arr
}
