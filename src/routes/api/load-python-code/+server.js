// src/routes/api/load-python-code/+server.js
import fs from 'fs';
import path from 'path';

/** @type {import('@sveltejs/kit').RequestHandler} */
export async function GET() {
	try {
		// Use process.cwd() to ensure the path is resolved from the root directory
		const filePath = path.join(process.cwd(), 'src/lib/scripts/temp.py');
		const code = fs.readFileSync(filePath, 'utf-8');

		return new Response(JSON.stringify({ code }), {
			status: 200,
			headers: {
				'Content-Type': 'application/json'
			}
		});
	} catch (error) {
		console.error('Error loading Python file:', error);
		return new Response(JSON.stringify({ error: 'Failed to load Python file' }), {
			status: 500,
			headers: {
				'Content-Type': 'application/json'
			}
		});
	}
}
