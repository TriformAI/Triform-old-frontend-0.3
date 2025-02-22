import 'unplugin-icons/types/svelte'
import type { User } from '$lib/types/auth'
import { API } from '$lib/api'

// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			user?: User
			api: InstanceType<typeof API>
		}
		interface PageData {
			user?: User
		}
		// interface PageState {}
		// interface Platform {}
		/// <reference types="svelte" />
		/// <reference types="vite/client" />
		/// <reference types="unplugin-icons/types/svelte" />
	}
	// Global DeepPartial type definition
	type DeepPartial<T> = {
		[P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
	}
}

export {}
