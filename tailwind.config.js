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
                "website-primary": "#030712",
                "website-secondary": "#101827",
                "brand-primary": "#0D1541",
                "brand-secondary": "#7A43AE",
                cream: "#A19595",
                "custom-blue": "#A5B4FC",
                "custom-red": "#F44336",
                "custom-gray": "#D1D5DB",
                "custom-gray-2": "#9CA3AF",
                "custom-green": "#22C55E",
            },
            borderRadius: {
                "4xl": "13px",
            },
        },
    },

    plugins: [],
}




