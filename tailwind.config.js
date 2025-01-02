import defaultTheme from 'tailwindcss/defaultTheme'

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
				'website-primary': '#1D1E20',
				'website-dark-primary': '#181819',
				'website-secondary': '#252526',
				'website-tertiary': '#2A2B2C',
				'brand-white': '#FFF',
				'brand-primary-gray': '#3F4041',
				'brand-secondary-gray': '#ffffff65',
				'brand-tertiary-gray': '#D1D5DB',
				'brand-light-gray': '#9CA3AF',
				'primary-red': '#F44336',
				'primary-green': '#22C55E',
				'primary-yellow': '#FFC107',
				'zinc': {
					...defaultTheme.colors.zinc,
					850: '#1D1D20'
				}
			},
			borderRadius: {
				'4xl': '13px'
			},

			spacing: {
				1: '4px',
				2: '6px',
				3: '8px',
				4: '12px',
				5: '16px',
				6: '24px'
			}
		}
	},

	plugins: []
}
