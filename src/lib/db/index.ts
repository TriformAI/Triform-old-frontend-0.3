import { POSTGRES_URL } from '$env/static/private'
import { drizzle } from 'drizzle-orm/neon-serverless'
import { Pool, neonConfig } from '@neondatabase/serverless'
import * as schema from './schema'
import ws from 'ws'

neonConfig.webSocketConstructor = ws

console.log('POSTGRES_URL', POSTGRES_URL)

const pool = new Pool({
	connectionString: POSTGRES_URL
})

export const db = drizzle({ client: pool, schema })
