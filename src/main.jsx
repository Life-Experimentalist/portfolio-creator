import { StrictMode } from "react"
import { createRoot } from "react-dom/client"

import App from "./App.jsx"
import { registerServiceWorker } from "./registerSW.js"
import "./index.css"

// Offline support: reloading the tab with no network should show the form,
// not the browser's error page.
registerServiceWorker()

createRoot(document.getElementById("root")).render(
	<StrictMode>
		<App />
	</StrictMode>
)
