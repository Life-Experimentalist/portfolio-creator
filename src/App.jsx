/**
 * The whole application: a wizard on the left, your answers in the middle, and
 * what the portfolio will actually read on the right.
 *
 * Everything runs in the browser. There is no backend, no account, and nothing
 * is uploaded anywhere - the only network calls are to api.github.com, and
 * only when you ask for them. Refreshing loses nothing, because the work in
 * progress is kept in this browser's own storage.
 */

import { useEffect, useMemo, useState } from "react"

import { STEPS, TRACKED_PATHS } from "./data/steps.js"
import { CREDIT, INTEGRATIONS, TEMPLATE } from "./data/template.js"
import starter from "./data/starter.json"
import { validateSettings } from "./lib/schema.js"
import { completion, download, get, set, toSettingsJson } from "./lib/settings.js"
import { applyDerived } from "./lib/derive.js"
import Field from "./components/Field.jsx"
import ImportPanel from "./components/ImportPanel.jsx"
import Landing from "./components/Landing.jsx"
import PublishPanel from "./components/PublishPanel.jsx"
import ThemeToggle from "./components/ThemeToggle.jsx"

const STORAGE_KEY = "portfolio-creator:draft"

/** Work in progress, kept in this browser and nowhere else. */
const loadDraft = () => {
	try {
		const saved = localStorage.getItem(STORAGE_KEY)
		return saved ? JSON.parse(saved) : structuredClone(starter)
	} catch {
		return structuredClone(starter)
	}
}

/** "#/create" is the builder; anything else is the landing page. */
const routeFromHash = () =>
	window.location.hash.startsWith("#/create") ? "create" : "home"

const TABS = [
	{ id: "start", label: "Start" },
	...STEPS.map((step) => ({ id: step.id, label: step.title })),
	{ id: "publish", label: "Publish" },
]

export default function App() {
	const [settings, setSettings] = useState(loadDraft)
	const [route, setRoute] = useState(routeFromHash)
	const [tab, setTab] = useState("start")
	const [notice, setNotice] = useState("")
	const [showJson, setShowJson] = useState(false)

	useEffect(() => {
		const onHash = () => setRoute(routeFromHash())
		window.addEventListener("hashchange", onHash)
		return () => window.removeEventListener("hashchange", onHash)
	}, [])

	useEffect(() => {
		try {
			localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
		} catch {
			// A private window with storage switched off. The form still works;
			// it just will not survive a refresh.
		}
	}, [settings])

	// Derived fields are filled in on the way out, not on every keystroke, so
	// nothing rewrites itself underneath someone who is still typing.
	const exported = useMemo(() => applyDerived(settings), [settings])
	const { valid, errors, bySection } = useMemo(
		() => validateSettings(exported),
		[exported]
	)
	const percent = completion(settings, TRACKED_PATHS)

	const change = (path, value) => setSettings((current) => set(current, path, value))
	const step = STEPS.find((s) => s.id === tab)

	const reset = () => {
		if (!confirm("Clear every answer and start again? This cannot be undone.")) return
		localStorage.removeItem(STORAGE_KEY)
		setSettings(structuredClone(starter))
		setTab("start")
		setNotice("")
	}

	if (route === "home") {
		// Any answer at all counts as a draft worth coming back to.
		const hasDraft = JSON.stringify(settings) !== JSON.stringify(starter)
		return <Landing hasDraft={hasDraft} />
	}

	return (
		<div className="min-h-screen bg-ink text-tx2">
			<header className="sticky top-0 z-20 border-b border-edge bg-ink/90 backdrop-blur">
				<div className="mx-auto flex max-w-7xl flex-wrap items-center gap-3 px-4 py-3 sm:gap-4 sm:px-5">
					<h1 className="text-lg font-bold">
						<a className="grad" href="#/" title="Back to the front page">
							Portfolio Creator
						</a>
					</h1>
					<div className="flex flex-1 items-center gap-3">
						<div className="h-1.5 flex-1 overflow-hidden rounded-full bg-panel">
							<div
								className="h-full rounded-full bg-gradient-to-r from-accent to-accent2 transition-all duration-500"
								style={{ width: `${percent}%` }}
							/>
						</div>
						<span className="w-10 text-right text-xs tabular-nums text-tx4">
							{percent}%
						</span>
					</div>
					<span
						className={
							valid
								? "rounded-full bg-ok/15 px-3 py-1 text-xs text-ok"
								: "rounded-full bg-accent2/15 px-3 py-1 text-xs text-accent2"
						}
					>
						{valid ? "valid" : `${errors.length} to fix`}
					</span>
					<ThemeToggle />
					<button
						className="btn btn-primary text-sm"
						onClick={() => download("settings.json", toSettingsJson(exported))}
					>
						Download
					</button>
				</div>
			</header>

			<div className="mx-auto grid max-w-7xl grid-cols-[minmax(0,1fr)] gap-6 px-4 py-6 sm:px-5 lg:grid-cols-[13rem_minmax(0,1fr)_20rem]">
				{/* --- steps --- */}
				<nav className="scroll-thin lg:sticky lg:top-20 lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto">
					<ul className="flex gap-1 overflow-x-auto pb-2 lg:block lg:space-y-0.5 lg:overflow-visible lg:pb-0">
						{TABS.map(({ id, label }) => {
							const count = bySection[id]?.length || 0
							return (
								<li key={id}>
									<button
										className={`flex w-full shrink-0 items-center justify-between gap-2 whitespace-nowrap rounded-lg px-3 py-2 text-left text-sm transition ${
											tab === id
												? "bg-accent/15 text-accent"
												: "text-tx3 hover:bg-hov/5 hover:text-tx2"
										}`}
										onClick={() => setTab(id)}
									>
										{label}
										{count > 0 && (
											<span className="rounded-full bg-accent2/20 px-1.5 text-[10px] text-accent2">
												{count}
											</span>
										)}
									</button>
								</li>
							)
						})}
					</ul>
					<button
						className="btn btn-ghost mt-3 hidden w-full text-xs text-tx4 lg:inline-flex"
						onClick={reset}
					>
						Start over
					</button>
				</nav>

				{/* --- the questions --- */}
				<main className="min-w-0 space-y-5">
					{notice && (
						<p className="rounded-lg border border-accent/40 bg-accent/10 px-4 py-3 text-sm text-accent">
							{notice}
						</p>
					)}

					{tab === "start" && (
						<>
							<section className="card space-y-3 p-6">
								<h2 className="text-xl font-semibold text-tx">
									Answer some questions, get a portfolio.
								</h2>
								<p className="text-sm leading-relaxed text-tx3">
									This form writes one file - <code>settings.json</code> - and that file
									is the entire portfolio. Your projects come from your GitHub account
									automatically, so the site keeps up with your work without you
									touching it again. Every answer is checked against the same JSON
									Schema the portfolio itself uses, which means anything this page
									accepts will build.
								</p>
								<p className="text-sm leading-relaxed text-tx3">
									It also publishes machine-readable copies of everything -{" "}
									<code>llms.txt</code>, <code>/api/portfolio.json</code>,{" "}
									<code>humans.txt</code> - so handing someone your URL and asking an AI
									to write your resume from it actually works.
								</p>
								<p className="text-sm leading-relaxed text-tx4">
									Nothing leaves your browser unless you ask it to. Your draft is saved
									here, on this device.
								</p>
							</section>
							<ImportPanel
								settings={settings}
								onReplace={setSettings}
								onNotice={setNotice}
							/>
						</>
					)}

					{step && (
						<section className="card space-y-5 p-6">
							<div className="space-y-1.5">
								<h2 className="text-lg font-semibold text-tx">{step.title}</h2>
								<p className="text-sm leading-relaxed text-tx3">{step.blurb}</p>
							</div>
							<div className="space-y-5">
								{step.fields.map((field) => (
									<Field
										key={field.path}
										field={field}
										settings={settings}
										onChange={change}
									/>
								))}
							</div>
						</section>
					)}

					{step?.id === "look" && (
						<section className="card space-y-4 p-6">
							<h3 className="font-semibold text-tx">Sister projects</h3>
							{INTEGRATIONS.map((integration) => (
								<div key={integration.name} className="space-y-1">
									<a
										className="text-sm font-medium text-accent hover:underline"
										href={integration.url}
										target="_blank"
										rel="noreferrer"
									>
										{integration.name}
									</a>
									<span className="ml-2 text-xs text-tx5">
										{get(settings, integration.enabledPath) ? "on" : "off"}
									</span>
									<p className="text-sm leading-relaxed text-tx3">
										{integration.blurb}
									</p>
								</div>
							))}
						</section>
					)}

					{tab === "publish" && <PublishPanel settings={exported} valid={valid} />}

					{step && (
						<div className="flex justify-between gap-3">
							<button
								className="btn btn-ghost"
								onClick={() => {
									const i = TABS.findIndex((t) => t.id === tab)
									setTab(TABS[Math.max(0, i - 1)].id)
									window.scrollTo({ top: 0, behavior: "smooth" })
								}}
							>
								← Back
							</button>
							<button
								className="btn btn-primary"
								onClick={() => {
									const i = TABS.findIndex((t) => t.id === tab)
									setTab(TABS[Math.min(TABS.length - 1, i + 1)].id)
									window.scrollTo({ top: 0, behavior: "smooth" })
								}}
							>
								Next →
							</button>
						</div>
					)}
				</main>

				{/* --- what the portfolio will read --- */}
				<aside className="scroll-thin space-y-4 lg:sticky lg:top-20 lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto">
					<div className="card p-4">
						<div className="mb-2 flex items-center justify-between">
							<h3 className="text-sm font-semibold text-tx2">
								{valid ? "Ready to build" : `${errors.length} things to fix`}
							</h3>
							<button
								className="text-xs text-tx4 hover:text-accent"
								onClick={() => setShowJson((on) => !on)}
							>
								{showJson ? "hide json" : "show json"}
							</button>
						</div>

						{valid ? (
							<p className="text-xs leading-relaxed text-tx4">
								Everything matches the schema. Download the file, or publish it from the
								last step.
							</p>
						) : (
							<ul className="space-y-1.5">
								{errors.slice(0, 40).map((error, i) => (
									<li key={i} className="text-xs leading-relaxed">
										<button
											className="text-left hover:text-accent"
											onClick={() => setTab(error.section)}
										>
											<code className="text-tx4">{error.path}</code>{" "}
											<span className="text-accent2">{error.message}</span>
										</button>
									</li>
								))}
								{errors.length > 40 && (
									<li className="text-xs text-tx5">
										...and {errors.length - 40} more
									</li>
								)}
							</ul>
						)}
					</div>

					{showJson && (
						<pre className="card scroll-thin max-h-96 overflow-auto p-3 text-[11px] leading-relaxed text-tx3">
							{toSettingsJson(exported)}
						</pre>
					)}

					<div className="card space-y-2 p-4 text-xs leading-relaxed text-tx4">
						<p>
							Built on the{" "}
							<a
								className="text-accent hover:underline"
								href={TEMPLATE.url}
								target="_blank"
								rel="noreferrer"
							>
								portfolio template
							</a>
							{" - "}
							<a
								className="text-accent hover:underline"
								href={TEMPLATE.demo}
								target="_blank"
								rel="noreferrer"
							>
								see one live
							</a>
							.
						</p>
						<p>
							{CREDIT.credit} -{" "}
							<a
								className="hover:text-accent hover:underline"
								href={CREDIT.github}
								target="_blank"
								rel="noreferrer"
							>
								{CREDIT.author}
							</a>
							. Licensed {CREDIT.license}.
						</p>
					</div>

					<button className="btn btn-ghost w-full text-xs text-tx4 lg:hidden" onClick={reset}>
						Start over
					</button>
				</aside>
			</div>
		</div>
	)
}
