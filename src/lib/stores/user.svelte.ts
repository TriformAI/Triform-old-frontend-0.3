import type { User } from '$lib/types/auth'

import { getSelf } from '$lib/actions/auth'
import { FetchError } from '$lib/types/fetch'
import { toast } from 'svelte-sonner'

let userDataStore = $state<User | Record<string, never>>({})

export const userData = () => userDataStore

export const refreshUserData = async () => {
	try {
		const data = await getSelf()
		userDataStore = data
	} catch (err) {
		// If we 401, we'll assume the user has expired or they're not logged in
		if (err instanceof FetchError && err.status === 401) {
			userDataStore = {}
			console.log('user is logged out')
			if (document.location.pathname !== '/login') {
				//document.location.href = '/login'
			}
		} else {
			console.error(err)
			// For some reason we can't show this immediately, in case the page wasn't loaded
			setTimeout(() => {
				toast.error('There was an unknown error retrieving your user data')
			}, 200)
		}
	}
}
