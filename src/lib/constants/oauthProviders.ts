import { modifierModel } from '$lib/schemas'
import type { z } from 'zod'

import IconGoogle from '~icons/bxl/google'
import IconMicrosoft from '~icons/bxl/microsoft'
import IconGitHub from '~icons/bxl/github'
import IconDropbox from '~icons/bxl/dropbox'
import IconShopify from '~icons/bxl/shopify'
import IconNotion from '~icons/mdi/cube'

export const oauthProviders = [
	{
		id: 'google',
		label: 'Google',
		icon: IconGoogle,
		scopes: [
			'https://www.googleapis.com/auth/userinfo.email',
			'https://www.googleapis.com/auth/userinfo.profile',
			'https://www.googleapis.com/auth/drive',
			'https://www.googleapis.com/auth/drive.file',
			'https://www.googleapis.com/auth/drive.readonly',
			'https://www.googleapis.com/auth/drive.metadata.readonly',
			'https://www.googleapis.com/auth/gmail.readonly',
			'https://www.googleapis.com/auth/gmail.send',
			'https://www.googleapis.com/auth/gmail.modify',
			'https://www.googleapis.com/auth/gmail.compose',
			'https://www.googleapis.com/auth/calendar',
			'https://www.googleapis.com/auth/calendar.readonly',
			'https://www.googleapis.com/auth/calendar.events',
			'https://www.googleapis.com/auth/contacts',
			'https://www.googleapis.com/auth/contacts.readonly',
			'https://www.googleapis.com/auth/spreadsheets',
			'https://www.googleapis.com/auth/spreadsheets.readonly',
			'https://www.googleapis.com/auth/documents',
			'https://www.googleapis.com/auth/documents.readonly',
			'https://www.googleapis.com/auth/photoslibrary',
			'https://www.googleapis.com/auth/photoslibrary.readonly'
		]
	},
	// {
	// 	id: 'microsoft',
	// 	label: 'Microsoft',
	// 	icon: IconMicrosoft,
	// },
	// {
	// 	id: 'github',
	// 	label: 'GitHub',
	// 	icon: IconGitHub,
	// 	scopes: [
	// 		'repo',
	// 		'repo:status',
	// 		'repo_deployment',
	// 		'public_repo',
	// 		'repo:invite',
	// 		'security_events',
	// 		'admin:repo_hook',
	// 		'write:repo_hook',
	// 		'read:repo_hook',
	// 		'admin:org',
	// 		'write:org',
	// 		'read:org',
	// 		'admin:public_key',
	// 		'write:public_key',
	// 		'read:public_key',
	// 		'admin:org_hook',
	// 		'gist',
	// 		'notifications',
	// 		'user',
	// 		'read:user',
	// 		'user:email',
	// 		'user:follow',
	// 		'project',
	// 		'read:project',
	// 		'delete_repo',
	// 		'write:packages',
	// 		'read:packages',
	// 		'delete:packages',
	// 		'admin:gpg_key',
	// 		'write:gpg_key',
	// 		'read:gpg_key',
	// 		'codespace',
	// 		'workflow',
	// 		'read:audit_log'
	// 	]
	// },
	// {
	// 	id: 'dropbox',
	// 	label: 'Dropbox',
	// 	icon: IconDropbox,
	// 	// dropbox sets the scopes in the dashboard, so it's not customisable
	// 	scopes: false
	// },
	// {
	// 	id: 'shopify',
	// 	label: 'Shopify',
	// 	icon: IconShopify,
	// },
	{
		id: 'notion',
		label: 'Notion',
		icon: IconNotion,
		// notion sets the scopes in the dashboard, so it's not customisable
		scopes: false
	}
] as {
	id: z.infer<typeof modifierModel>['spec']['provider']
	label: string
	icon: typeof IconGoogle,
	scopes: false | string[]
}[]