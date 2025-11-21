import { sveltekit } from '@sveltejs/kit/vite'
import { defineConfig } from 'vitest/config'
import Icons from 'unplugin-icons/vite'
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
	plugins: [
		// @ts-expect-error expects plugin, but gets promise<plugin>
		tailwindcss(),
		// @ts-expect-error expects plugin, but gets promise<plugin>
		sveltekit(),
		// @ts-expect-error expects plugin, but gets promise<plugin>
		Icons({
			compiler: 'svelte'
		})
	],
	test: {
		include: ['src/**/*.{test,spec}.{js,ts}']
	},
	server: {
		host: '0.0.0.0',
		allowedHosts: true
	}
})
