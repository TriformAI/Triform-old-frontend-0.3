import defaultTheme from "tailwindcss/defaultTheme"


/** @type {import('tailwindcss').Config} */
export default {
    important: false,
    content: ['./src/**/*.{html,js,svelte,ts}'],
    theme: {
        extend: {
            fontFamily: {
                sans: ["Figtree", ...defaultTheme.fontFamily.sans],
                mono: ["Space Mono", ...defaultTheme.fontFamily.mono],
            },
            colors: {
                "website-primary": "#0B1544",
                "website-secondary": "#121C4A",
                "website-tertiary": "#1A2350",
                "brand-white": "#FFF",
                "brand-gray": "#D1D5DB",
            },
            borderRadius: {
                "4xl": "13px",
            },
        },
    },

    plugins: [],
}




