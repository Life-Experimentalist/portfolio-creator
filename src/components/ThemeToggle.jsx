/** One button: sun in the dark, moon in the light. */

import { useState } from "react"

import { currentTheme, toggleTheme } from "../lib/theme.js"

export default function ThemeToggle() {
	const [theme, setTheme] = useState(currentTheme)

	return (
		<button
			className="btn btn-ghost h-9 w-9 shrink-0 !p-0 text-base"
			title={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
			aria-label={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
			onClick={() => setTheme(toggleTheme())}
		>
			{theme === "light" ? "☾" : "☀︎"}
		</button>
	)
}
