/** @type {import('tailwindcss').Config} */
export default {
	content: ["./index.html", "./src/**/*.{js,jsx}"],
	theme: {
		extend: {
			colors: {
				// Semantic tokens, defined as CSS variables in src/index.css so
				// the light and dark themes swap values without touching markup.
				ink: "rgb(var(--c-ink) / <alpha-value>)",
				panel: "rgb(var(--c-panel) / <alpha-value>)",
				edge: "rgb(var(--c-edge) / <alpha-value>)",
				hov: "rgb(var(--c-hov) / <alpha-value>)",
				tx: "rgb(var(--c-tx) / <alpha-value>)",
				tx2: "rgb(var(--c-tx2) / <alpha-value>)",
				tx3: "rgb(var(--c-tx3) / <alpha-value>)",
				tx4: "rgb(var(--c-tx4) / <alpha-value>)",
				tx5: "rgb(var(--c-tx5) / <alpha-value>)",
				ok: "rgb(var(--c-ok) / <alpha-value>)",
				accent: "#a855f7",
				accent2: "#ec4899",
			},
			fontFamily: {
				sans: ["Inter", "system-ui", "sans-serif"],
				mono: ["JetBrains Mono", "ui-monospace", "monospace"],
			},
		},
	},
	plugins: [],
}
