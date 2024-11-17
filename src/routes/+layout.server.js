export const prerender = false;

import { PUBLIC_API_URL } from '$env/static/public';

export const load = async ({ locals, fetch, cookies }) => {
	const session = await locals.auth(); // Assuming you use the auth object to get the session
	//get the authType from the cookies
	const authType = cookies.get('authType');
	const apiUrl = PUBLIC_API_URL;
	let GithubAuthToken = null;

	if (session) {
		const endpoint = authType === 'register' ? '/api/v1/register' : '/api/v1/login';
		const body =
			authType === 'register'
				? {
						accessToken: session.accessToken,
						userId: session.userId,
						email: session.user.email,
						name: session.user.name,
						image: session.user.image
					}
				: {
						email: session.user.email,
						password: '',
						accessToken: session.accessToken
					};

		try {
			const response = await fetch(`${apiUrl}${endpoint}`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(body)
			});

			if (response.ok) {
				const data = await response.json();
				GithubAuthToken = data.token;
			} else {
				const errorText = await response.text();
				console.error(`Failed to authenticate with external API (${response.status}):`, errorText);
			}
		} catch (error) {
			console.error('Error during API request:', error);
		}
	}

	return {
		session,
		GithubAuthToken
	};
};
