import type { Project } from '$lib/types/project'
import testProject from '$lib/dev/test-project.json'

export function load() {
	const projects: Project[] = [testProject, testProject]

	return {
		projects
	}
}
