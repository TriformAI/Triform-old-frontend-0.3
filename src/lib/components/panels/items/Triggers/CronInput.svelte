<script lang="ts">
	import cronValidate from 'cron-validate'
	import cronstrue from 'cronstrue'

	let {
		cronFields = $bindable({
			minute: '',
			hour: '',
			day: '',
			month: '',
			weekday: ''
		}),
		hasErrors = $bindable(false)
	}: {
		cronFields: {
			minute: string
			hour: string
			day: string
			month: string
			weekday: string
		}
		hasErrors: boolean
	} = $props()

	const camelCaseToSpaced = (str: string) => {
		const s = str
			.split(/(?=[A-Z])/)
			.join(' ')
			.toLowerCase()
		return s.charAt(0).toUpperCase() + s.slice(1)
	}

	// if the user writes a space: go forward
	// backspace: backward
	const onkeydown = (e: KeyboardEvent) => {
		const target = e.target as HTMLInputElement
		const currentValue = target.value

		if (e.key === ' ') {
			e.preventDefault()
			const nextInput = target.parentElement?.nextElementSibling?.querySelector('input')
			if (nextInput) {
				nextInput.focus()
			}
		} else if (e.key === 'Backspace' && currentValue === '') {
			e.preventDefault()
			const prevInput = target.parentElement?.previousElementSibling?.querySelector('input')
			if (prevInput) {
				prevInput.focus()
			}
		}
	}

	const isFinishedEntering = $derived(Object.values(cronFields).every(field => field !== ''))

	const cronValidationErrors: {
		fields: (keyof typeof cronFields)[]
		errors: string[]
	} = $derived.by(() => {
		let errors: string[] = []
		let fields: (keyof typeof cronFields)[] = []
		if (!isFinishedEntering) return { fields, errors }
		const res = cronValidate(Object.values(cronFields).join(' '), {
			useSeconds: false,
			useYears: false,
			daysOfMonth: {
				lowerLimit: 1,
				upperLimit: 31
			},
			months: {
				lowerLimit: 1,
				upperLimit: 12
			}
		})

		// for some reason, cronValidate considers day 0 & month 0 to be valid even though
		// we specify above that it shouldn't be, so we need to filter it manually
		if (cronFields.day === '0') {
			fields.push('day')
			errors.push('Day must be between 1 and 31')
		}
		if (cronFields.month === '0') {
			fields.push('month')
			errors.push('Month must be between 1 and 12')
		}

		if (res.isValid()) return { fields, errors }
		errors = [...errors, ...res.getError().map(e => e.replace(/\(Input cron: .+\)/, ''))]
		// do some suspicious guesswork to try and figure out which fields are erroring
		const fullErrors = errors.join(' ')

		const errorMap: { [key: string]: keyof typeof cronFields } = {
			'minutes field': 'minute',
			'hours field': 'hour',
			'daysOfMonth field': 'day',
			'months field': 'month',
			'daysOfWeek field': 'weekday'
		}

		for (const errorPart in errorMap) {
			if (fullErrors.includes(errorPart)) {
				fields.push(errorMap[errorPart])
			}
		}

		return { fields, errors }
	})

	const cronDescription = $derived(
		isFinishedEntering && !cronValidationErrors.errors.length
			? cronstrue.toString(Object.values(cronFields).join(' '))
			: ''
	)

	$effect(() => {
		hasErrors = cronValidationErrors?.errors.length > 0 || !isFinishedEntering
	})
</script>

<div>
	<div class="flex flex-row flex-wrap justify-center gap-4">
		{#each Object.keys(cronFields) as key}
			{@const hasError = cronValidationErrors?.fields.includes(key as keyof typeof cronFields)}
			<div class="flex flex-col items-center">
				<input
					type="text"
					bind:value={cronFields[key as keyof typeof cronFields]}
					class={[
						'input-text peer max-w-16 text-center font-mono',
						hasError &&
							'border-danger-400/60 bg-danger-400/5 focus:border-danger-400/80 focus:bg-danger-400/10'
					]}
					{onkeydown}
				/>
				<span
					class={[
						'mt-1 text-xs transition',
						hasError
							? 'text-danger-400/80 peer-focus:text-danger-400'
							: 'text-main-500 peer-focus:text-main-300'
					]}
				>
					{camelCaseToSpaced(key)}
				</span>
			</div>
		{/each}
	</div>

	{#if cronValidationErrors?.errors.length}
		<div class="mx-auto mt-2 flex max-w-lg flex-col gap-1">
			{#each cronValidationErrors?.errors as error}
				<div class="text-danger-400 text-center text-sm">
					{error}
				</div>
			{/each}
		</div>
	{:else}
		<div class="text-main-400 mt-2 text-center text-sm">
			{cronDescription}
		</div>
	{/if}
</div>
