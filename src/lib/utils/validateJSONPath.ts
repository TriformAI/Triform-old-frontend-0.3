import { JSONPath } from '@astronautlabs/jsonpath'

export const validateJSONPath = (path: string) => {
	try {
		JSONPath.parse(path)
		return { success: true }
	} catch (error) {
		return { success: false, error }
	}
}
