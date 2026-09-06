/**
 * The front door. Everything it claims, the builder actually does; if a claim
 * stops being true, delete it here rather than softening it.
 */

import { CREDIT, TEMPLATE } from "../data/template.js"
import ThemeToggle from "./ThemeToggle.jsx"

const HOW = [
	{
		n: "1",
		title: "Answer",
		body: "A guided form asks about you, your work and how the site should look. Your draft is saved in this browser and nowhere else.",
	},
	{
		n: "2",
		title: "Check",
		body: "Every answer is validated against the same JSON Schema the portfolio itself reads, so anything this page accepts will build.",
	},
	{
		n: "3",
		title: "Publish",
		body: "Create the repository from the template and push settings.json without leaving the page - or download the file and add it yourself.",
	},
]

const FEATURES = [
	{
		title: "One file is the whole site",
		body: "The form writes settings.json and that file is the entire portfolio - content, colours, sections, links.",
	},
	{
		title: "Projects that update themselves",
		body: "The portfolio reads your repositories from GitHub at view time, so the site keeps up with your work untouched.",
	},
	{
		title: "Import what already exists",
		body: "Point it at your GitHub account and it pre-fills your name, bio, location and links from your profile.",
	},
	{
		title: "No server, no account",
		body: "Everything runs in your browser. The only network calls are to api.github.com, and only when you ask.",
	},
	{
		title: "Readable by machines too",
		body: "A generated site ships llms.txt, humans.txt and /api/portfolio.json, so an AI handed your URL can actually use it.",
	},
	{
		title: "Works offline",
		body: "The app is a PWA - the form keeps working when the network does not, and your draft survives a refresh.",
	},
]

const TARGETS = ["GitHub Pages", "Cloudflare", "Netlify", "Vercel", "Render"]

export default function Landing({ hasDraft }) {
	return (
		<div className="min-h-screen bg-ink">
			<header className="sticky top-0 z-20 border-b border-edge bg-ink/90 backdrop-blur">
				<div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
					<span className="text-lg font-bold">
						<span className="grad">Portfolio Creator</span>
					</span>
					<div className="flex items-center gap-2">
						<ThemeToggle />
						<a className="btn btn-primary" href="#/create">
							{hasDraft ? "Continue" : "Start"}
						</a>
					</div>
				</div>
			</header>

			<main>
				{/* --- hero --- */}
				<section className="mx-auto max-w-6xl px-4 pb-16 pt-14 text-center sm:px-6 sm:pb-24 sm:pt-24">
					<h1 className="mx-auto max-w-3xl text-4xl font-bold leading-tight text-tx sm:text-6xl">
						Fill in a form.
						<br />
						<span className="grad">Get a portfolio.</span>
					</h1>
					<p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-tx3 sm:text-lg">
						A fast, SEO-ready developer portfolio without writing code. Answer a
						guided form, import your GitHub profile, and publish - straight from
						this page.
					</p>
					<div className="mt-8 flex flex-wrap items-center justify-center gap-3">
						<a className="btn btn-primary px-6 py-3 text-base" href="#/create">
							{hasDraft ? "Continue your draft" : "Start building"}
						</a>
						<a
							className="btn btn-ghost px-6 py-3 text-base"
							href={TEMPLATE.demo}
							target="_blank"
							rel="noreferrer"
						>
							See one live
						</a>
					</div>
					<p className="mt-6 text-xs text-tx4">
						Free · open source · nothing leaves your browser unless you ask it to
					</p>
				</section>

				{/* --- how it works --- */}
				<section className="border-y border-edge bg-panel/50">
					<div className="mx-auto grid max-w-6xl gap-6 px-4 py-12 sm:grid-cols-3 sm:px-6 sm:py-16">
						{HOW.map((step) => (
							<div key={step.n} className="space-y-2">
								<span className="grad text-3xl font-bold">{step.n}</span>
								<h2 className="text-lg font-semibold text-tx">{step.title}</h2>
								<p className="text-sm leading-relaxed text-tx3">{step.body}</p>
							</div>
						))}
					</div>
				</section>

				{/* --- features --- */}
				<section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
					<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
						{FEATURES.map((feature) => (
							<div key={feature.title} className="card space-y-2 p-5">
								<h3 className="font-semibold text-tx">{feature.title}</h3>
								<p className="text-sm leading-relaxed text-tx3">{feature.body}</p>
							</div>
						))}
					</div>
				</section>

				{/* --- deploy targets + closing CTA --- */}
				<section className="mx-auto max-w-6xl px-4 pb-16 text-center sm:px-6 sm:pb-24">
					<p className="text-sm text-tx4">Deploys anywhere static files do</p>
					<div className="mt-4 flex flex-wrap items-center justify-center gap-2">
						{TARGETS.map((target) => (
							<span
								key={target}
								className="rounded-full border border-edge px-3 py-1 text-xs text-tx3"
							>
								{target}
							</span>
						))}
					</div>
					<a className="btn btn-primary mt-10 px-6 py-3 text-base" href="#/create">
						{hasDraft ? "Continue your draft" : "Start building"}
					</a>
				</section>
			</main>

			<footer className="border-t border-edge">
				<div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-6 text-xs text-tx4 sm:px-6">
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
						. Licensed {CREDIT.license}.
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
					</p>
				</div>
			</footer>
		</div>
	)
}
