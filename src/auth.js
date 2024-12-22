import { SvelteKitAuth } from '@auth/sveltekit';
import { GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET, AUTH_SECRET } from '$env/static/private';
import GitHub from '@auth/sveltekit/providers/github';

export const { handle, signIn, signOut } = SvelteKitAuth({
	providers: [
		GitHub({
			clientId: GITHUB_CLIENT_ID,
			clientSecret: GITHUB_CLIENT_SECRET
		})
	],
	secret: AUTH_SECRET,
	trustHost: true,
	callbacks: {
		async jwt({ token, account }) {
			// If the user signs in for the first time, add additional details to the token
			if (account) {
				token.accessToken = account.access_token;
				token.id = account.providerAccountId;
			}
			return token;
		},
		async session({ session, token }) {
			// Expose token details in the session
			session.accessToken = token.accessToken;
			session.userId = token.id;
			return session;
		}
	}
});
