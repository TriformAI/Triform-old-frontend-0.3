const MS_PER_SECOND = 1000
const MS_PER_MINUTE = MS_PER_SECOND * 60
const MS_PER_HOUR = MS_PER_MINUTE * 60
const MS_PER_DAY = MS_PER_HOUR * 24
const MS_PER_WEEK = MS_PER_DAY * 7
const MS_PER_MONTH = MS_PER_DAY * 30
const MS_PER_YEAR = MS_PER_DAY * 365

const units: Array<{ unit: Intl.RelativeTimeFormatUnit; ms: number }> = [
  { unit: 'year', ms: MS_PER_YEAR },
  { unit: 'month', ms: MS_PER_MONTH },
  { unit: 'week', ms: MS_PER_WEEK },
  { unit: 'day', ms: MS_PER_DAY },
  { unit: 'hour', ms: MS_PER_HOUR },
  { unit: 'minute', ms: MS_PER_MINUTE },
  { unit: 'second', ms: MS_PER_SECOND }
]

export const formatRelativeDate = (date: Date) => {
	const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' })
	
	const elapsed = date.getTime() - Date.now()
	
	for (const { unit, ms } of units) {
		const value = Math.round(elapsed / ms)
		if (Math.abs(value) >= 1) return rtf.format(value, unit)
	}
	
	return rtf.format(0, 'second')
}