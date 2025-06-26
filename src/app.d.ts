import 'unplugin-icons/types/svelte'
import type { User, Organization } from '$lib/types/auth'
import type { Payload, Project, Variable } from '$lib/types/project'

import { API } from '$lib/api'

// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			user?: User
			organizations?: Organization[]
			api: InstanceType<typeof API>
		}
		interface PageData {
			user?: User
			project?: Project
			variables?: Variable[]
			payloads?: Payload[]
		}
		// interface PageState {}
		// interface Platform {}
		/// <reference types="svelte" />
		/// <reference types="vite/client" />
		/// <reference types="unplugin-icons/types/svelte" />
	}
	// Global helpers
	type DeepPartial<T> = {
		[P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
	}
	type ValueOf<T> = T[keyof T]
	type AddParameters<
		TFunction extends (...args: any) => any,
		TParameters extends [...args: any]
	> = (...args: [...Parameters<TFunction>, ...TParameters]) => ReturnType<TFunction>
}

export {}
