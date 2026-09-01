/** @type {import('tailwindcss').Config} */
export default {
	content: ["./index.html", "./src/**/*.{js,jsx}"],
	theme: {
		extend: {
			colors: {
				ink: "#07070b",
				panel: "#101018",
				edge: "#22222e",
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
