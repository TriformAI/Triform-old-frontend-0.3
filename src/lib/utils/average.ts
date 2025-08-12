export const average = (numbers: number[]) =>
	numbers.reduce((acc, curr) => acc + curr, 0) / numbers.length
