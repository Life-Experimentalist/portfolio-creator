/**
 * Light and dark, remembered per browser.
 *
 * The choice lives in localStorage; with no saved choice we follow the
 * system's prefers-color-scheme. index.html runs the same three lines inline
 * before the stylesheet loads, so the first paint is already the right theme -
 * keep that script in step with this file.
 */

const KEY = "portfolio-creator:theme"

// Keep the browser UI (mobile address bar) matched to --c-ink.
const BAR = { dark: "#07070b", light: "#fafafa" }

export const currentTheme = () =>
	document.documentElement.dataset.theme === "light" ? "light" : "dark"

export const applyTheme = (theme) => {
	document.documentElement.dataset.theme = theme
	document
		.querySelector('meta[name="theme-color"]')
		?.setAttribute("content", BAR[theme])
}

export const toggleTheme = () => {
	const next = currentTheme() === "light" ? "dark" : "light"
	applyTheme(next)
	try {
		localStorage.setItem(KEY, next)
	} catch {
		// Private window; the toggle still works for this tab.
	}
	return next
}
