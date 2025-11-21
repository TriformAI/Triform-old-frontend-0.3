import * as Sentry from '@sentry/sveltekit'

Sentry.init({
	dsn: 'https://a489be08ad974bf061b03df5b08f5917@o4510401943764992.ingest.de.sentry.io/4510401947172944',

	tracesSampleRate: 1.0,

	// Enable logs to be sent to Sentry
	enableLogs: true

	// uncomment the line below to enable Spotlight (https://spotlightjs.com)
	// spotlight: import.meta.env.DEV,
})
