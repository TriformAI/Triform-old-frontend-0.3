import defaultTheme from 'tailwindcss/defaultTheme';

/** @type {import('tailwindcss').Config} */
export default {
	important: false,
	content: ['./src/**/*.{html,js,svelte,ts}'],
	theme: {
		extend: {
			fontFamily: {
				sans: ['Figtree', ...defaultTheme.fontFamily.sans],
				mono: ['Space Mono', ...defaultTheme.fontFamily.mono]
			},
			colors: {
				'website-primary': '#0B1544',
				'website-dark-primary': '#091136',
				'website-secondary': '#121C4A',
				'website-tertiary': '#1A2350',
				'brand-white': '#FFF',
				'brand-primary-gray': '#FFFFFF1A',
				'brand-secondary-gray': '#ffffff65',
				'brand-tertiary-gray': '#D1D5DB',
				'brand-light-gray': '#9CA3AF',
				'primary-red': '#F44336',
				'primary-green': '#22C55E',
				'primary-yellow': '#FFC107'
			},
			borderRadius: {
				'4xl': '13px'
			}
		}
	},

	plugins: []
};
