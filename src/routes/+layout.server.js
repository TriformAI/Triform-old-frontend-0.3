// src/routes/+layout.server.js or a relevant layout/page file
import { PUBLIC_API_URL } from '$env/static/public';

export const load = async ({ locals, fetch }) => {
	const session = await locals.auth(); // Assuming you use the auth object to get the session
	const apiUrl = PUBLIC_API_URL;

	if (session) {
		const github = {
			accessToken: session.accessToken,
			userId: session.userId,
			email: session.user.email,
			name: session.user.name,
			image: session.user.image
		};

		// console.log(github);
		// Make an API call to store GitHub data
		// try {
		// 	await fetch(`${apiUrl}/api/v1/register?provider=github`, {
		// 		method: 'POST',
		// 		headers: {
		// 			'Content-Type': 'application/json'
		// 		},
		// 		body: JSON.stringify({
		// 			name: session.user.name,
		// 			email: session.user.email,
		// 			image: session.user.image
		// 			// Add any other relevant GitHub data you have access to
		// 		})
		// 	});
		// } catch (error) {
		// 	console.error('Failed to store GitHub data:', error);
		// }
	}

	return {
		session
	};
};
