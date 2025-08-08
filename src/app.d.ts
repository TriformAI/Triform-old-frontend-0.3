import 'unplugin-icons/types/svelte'
import { API } from '$lib/api'
import type { Payload, Project, Variable } from '$lib/types/resources'
import type { User, Session } from 'better-auth/types'
import type { Organization } from 'better-auth/plugins/organization'
import type { ingressTokenModel } from '$lib/schemas/triggers'
import type * as z from 'zod'

// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			isAuthenticated?: boolean
			user?: User
			session?: Session & {
				activeOrganizationId?: string | null
			}
			organizations?: Organization[]
			api: InstanceType<typeof API>
		}
		interface PageData {
			user?: User
			project?: Project
			variables?: Variable[]
			payloads?: Payload[]
			ingressTokens?: z.infer<typeof ingressTokenModel>[]
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
