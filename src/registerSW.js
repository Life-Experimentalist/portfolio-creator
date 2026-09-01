/**
 * registerSW.js — turns on the offline copy of the form.
 *
 * The app is served from /portfolio-creator/ on GitHub Pages, so both the
 * script URL and the scope come from BASE_URL. A worker registered at the root
 * would be out of scope and would silently control nothing.
 *
 * Development is left alone: a service worker caching a dev server is a good
 * way to spend an afternoon wondering why an edit did not appear.
 */

export function registerServiceWorker() {
	if (!import.meta.env.PROD) return
	if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return

	const base = import.meta.env.BASE_URL || "/"

	window.addEventListener("load", () => {
		navigator.serviceWorker.register(`${base}sw.js`, { scope: base }).catch((error) => {
			// Losing this costs the offline copy and nothing else.
			console.warn("[sw] registration failed:", error)
		})
	})
}
