export async function load({ locals }) {
	// Take user obj from locals and page it available as pageData
	return {
		user: locals.user
	}
}
