import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"

// base: "/" because the site is served from its own GitHub Pages domain
// (Life-Experimentalist.github.io/portfolio-creator would need "/portfolio-creator/",
// so the deploy workflow passes BASE_PATH and this reads it).
export default defineConfig({
	base: process.env.BASE_PATH || "/",
	plugins: [react()],
	build: { outDir: "dist", sourcemap: false },
})
