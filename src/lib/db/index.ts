import { env } from '$env/dynamic/private'
import { drizzle } from 'drizzle-orm/neon-serverless'
import { Pool, neonConfig } from '@neondatabase/serverless'
import * as schema from './schema'
import ws from 'ws'

neonConfig.webSocketConstructor = ws

console.log('POSTGRES_URL', env.POSTGRES_URL)

const pool = new Pool({
	connectionString: env.POSTGRES_URL
})

export const db = drizzle({ client: pool, schema })
