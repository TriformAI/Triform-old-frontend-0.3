import type { z } from 'zod'
import { requirementsModel } from '$lib/schemas/requirements'
type Requirements = z.infer<typeof requirementsModel>

export const getDefaultRequirements = () => ({
	context: [],
	userStories: [],
	outcomes: [],
	guidelines: [],
	dependencies: [],
	boundaries: [],
	safety: []
})

export const requirements = $state<{ value: Requirements }>({ value: getDefaultRequirements() })
