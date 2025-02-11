// Utility function to get the value of a specific cookie by name
export function getCookie(name) {
	if (typeof document === 'undefined') {
		return null
	}

	const cookieString = document.cookie
	const cookies = cookieString.split('; ').reduce((acc, cookie) => {
		const [cookieName, cookieValue] = cookie.split('=')
		acc[cookieName] = cookieValue
		return acc
	}, {})
	return cookies[name]
}

// Function to get the auth token specifically
export function getAuthToken() {
	return getCookie('authToken')
}

// Function to remove a specific cookie by name
export function removeCookie(name) {
	if (typeof document !== 'undefined') {
		document.cookie = `${name}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;`
	}
}
