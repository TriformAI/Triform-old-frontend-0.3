import { redirect } from '@sveltejs/kit'

export async function load({ locals }) {
	// Redirect to dashboard or login depending on logged-in state
	if (locals.isAuthenticated && locals.api) {
		try {
			// Check if user has only one recent project (fresh account)
			const projectsResult = await locals.api.get('projects')
			
			if (projectsResult.success && projectsResult.data) {
				const projects = projectsResult.data
				
				// If user has exactly 1 project created recently, redirect to it
				if (projects.length !== 1) return redirect(302, '/dashboard')
				const project = projects[0]
					
				if (new Date(project.createdAt) > new Date(Date.now() - 15 * 1000)) {
					console.log('redirecting to project', project.id)
					return redirect(302, `/project/${project.id}`)
				}
			}
		} catch (error) {
			// Re-throw redirect errors so they propagate properly
			if (error?.status === 302) throw error
			console.log('Failed to check for fresh account:', error)
		}
		
		redirect(302, '/dashboard')
	}

	redirect(302, '/login')
}
