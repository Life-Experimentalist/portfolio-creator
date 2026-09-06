/**
 * Publishing, three ways.
 *
 * Manual is the honest default and always works: download settings.json, drop
 * it into your fork, push. The automated route asks for a fine-grained
 * personal access token and does the same three steps for you.
 *
 * There is deliberately no "sign in with GitHub" button. A browser-only OAuth
 * flow cannot complete against github.com - the token endpoint sends no CORS
 * headers - so the honest options are a token you paste, or a small server
 * somewhere doing the exchange. See docs/hosting.md for the second one.
 */

import { useState } from "react"

import {
	createFromTemplate,
	enablePages,
	removeInheritedSeo,
	putFile,
	tokenScopes,
	whoami,
} from "../lib/github.js"
import { download, toSettingsJson } from "../lib/settings.js"
import { TEMPLATE } from "../data/template.js"

const Step = ({ done, failed, children }) => (
	<li className="flex items-start gap-2.5 text-sm">
		<span
			className={
				failed
					? "mt-0.5 text-accent2"
					: done
						? "mt-0.5 text-ok"
						: "mt-0.5 text-tx5"
			}
		>
			{failed ? "×" : done ? "✓" : "•"}
		</span>
		<span className={failed ? "text-accent2" : done ? "text-tx2" : "text-tx4"}>
			{children}
		</span>
	</li>
)

export default function PublishPanel({ settings, valid }) {
	const [token, setToken] = useState("")
	const [user, setUser] = useState(null)
	const [repoName, setRepoName] = useState("")
	const [log, setLog] = useState([])
	const [busy, setBusy] = useState(false)
	const [error, setError] = useState("")
	const [siteUrl, setSiteUrl] = useState("")

	const json = toSettingsJson(settings)

	const note = (text, failed = false) =>
		setLog((entries) => [...entries, { text, failed }])

	const check = async () => {
		setError("")
		setBusy(true)
		try {
			const me = await whoami(token)
			const scopes = await tokenScopes(token)
			setUser({ ...me, scopes })
			if (!repoName) setRepoName(`${me.login}.github.io`)
		} catch (e) {
			setError(e.message)
			setUser(null)
		} finally {
			setBusy(false)
		}
	}

	const publish = async () => {
		setBusy(true)
		setError("")
		setLog([])
		const owner = user.login
		try {
			await createFromTemplate(token, {
				templateOwner: TEMPLATE.owner,
				templateRepo: TEMPLATE.repo,
				owner,
				name: repoName,
				description: `${settings?.home?.name || owner}'s portfolio`,
			})
			note(`Created ${owner}/${repoName} from the template.`)

			await putFile(token, {
				owner,
				repo: repoName,
				path: "public/settings.json",
				content: json,
				message: "Configure portfolio",
			})
			note("Committed public/settings.json.")

			try {
				const removed = await removeInheritedSeo(token, {
					owner,
					repo: repoName,
				})
				if (removed.length)
					note(
						`Removed ${removed.length} files the template had pointing at its owner's domain. Your build regenerates them from your settings.`
					)
			} catch {
				note(
					"Could not remove the template's own robots.txt, sitemap.xml and JSON endpoints. They name the template owner's site, not yours; your first build overwrites them, but delete them by hand if it does not.",
					true
				)
			}

			try {
				await enablePages(token, { owner, repo: repoName })
				note("Turned on GitHub Pages, building from the Actions workflow.")
			} catch {
				note(
					"Could not turn on Pages automatically - open Settings > Pages and set the source to GitHub Actions.",
					true
				)
			}

			const url =
				repoName.toLowerCase() === `${owner.toLowerCase()}.github.io`
					? `https://${owner.toLowerCase()}.github.io/`
					: `https://${owner.toLowerCase()}.github.io/${repoName}/`
			setSiteUrl(url)
			note(`The first build takes a couple of minutes. Then: ${url}`)
		} catch (e) {
			setError(e.message)
		} finally {
			setBusy(false)
		}
	}

	return (
		<div className="space-y-6">
			{!valid && (
				<p className="rounded-lg border border-accent2/40 bg-accent2/10 px-4 py-3 text-sm text-accent2">
					The settings do not validate yet. You can still download the file, but the
					portfolio build will reject it - fix the errors in the panel on the right
					first.
				</p>
			)}

			<section className="card space-y-3 p-5">
				<h3 className="font-semibold text-tx">1. Download and do it yourself</h3>
				<p className="text-sm leading-relaxed text-tx3">
					Fork the template, drop this file in at <code>public/settings.json</code>,
					push. Nothing here ever sees a token, and it works the same on every host.
				</p>
				<div className="flex flex-wrap gap-2">
					<button
						className="btn btn-primary"
						onClick={() => download("settings.json", json)}
					>
						Download settings.json
					</button>
					<button
						className="btn btn-ghost"
						onClick={() => navigator.clipboard?.writeText(json)}
					>
						Copy to clipboard
					</button>
					<a
						className="btn btn-ghost"
						href={`https://github.com/${TEMPLATE.owner}/${TEMPLATE.repo}/generate`}
						target="_blank"
						rel="noreferrer"
					>
						Use the template on GitHub
					</a>
				</div>
			</section>

			<section className="card space-y-4 p-5">
				<div>
					<h3 className="font-semibold text-tx">2. Let it publish for you</h3>
					<p className="mt-1 text-sm leading-relaxed text-tx3">
						Paste a fine-grained personal access token with{" "}
						<strong className="text-tx2">Administration: read and write</strong> and{" "}
						<strong className="text-tx2">Contents: read and write</strong>. The
						token stays in this page for as long as the tab is open: it is never
						stored, never logged, and goes nowhere except api.github.com. Close the
						tab and it is gone. Revoke it afterwards anyway.
					</p>
				</div>

				<div className="flex flex-wrap gap-2">
					<input
						type="password"
						className="field flex-1 min-w-[16rem] font-mono text-sm"
						placeholder="github_pat_..."
						value={token}
						onChange={(e) => setToken(e.target.value)}
						autoComplete="off"
					/>
					<button className="btn btn-ghost" onClick={check} disabled={!token || busy}>
						Check token
					</button>
				</div>

				{user && (
					<div className="space-y-3 rounded-lg border border-edge bg-black/20 p-4">
						<p className="text-sm text-tx2">
							Signed in as <strong>{user.login}</strong>
							{user.scopes?.length ? (
								<span className="text-tx4"> - scopes: {user.scopes.join(", ")}</span>
							) : (
								<span className="text-tx4">
									{" "}
									- fine-grained token, permissions are set per repository
								</span>
							)}
						</p>
						<div className="flex flex-wrap items-center gap-2">
							<span className="text-sm text-tx4">{user.login}/</span>
							<input
								className="field flex-1 min-w-[12rem]"
								value={repoName}
								onChange={(e) => setRepoName(e.target.value)}
								placeholder={`${user.login}.github.io`}
							/>
						</div>
						<p className="text-xs text-tx4">
							Naming it <code>{user.login}.github.io</code> puts the site at the root of
							your github.io address. Any other name puts it in a subfolder.
						</p>
						<button
							className="btn btn-primary"
							onClick={publish}
							disabled={busy || !repoName}
						>
							{busy ? "Working..." : "Create the repository and publish"}
						</button>
					</div>
				)}

				{error && (
					<p className="rounded-lg border border-accent2/40 bg-accent2/10 px-3 py-2 text-sm text-accent2">
						{error}
					</p>
				)}

				{log.length > 0 && (
					<ul className="space-y-1.5">
						{log.map((entry, i) => (
							<Step key={i} done failed={entry.failed}>
								{entry.text}
							</Step>
						))}
					</ul>
				)}

				{siteUrl && (
					<a
						className="btn btn-primary inline-block"
						href={siteUrl}
						target="_blank"
						rel="noreferrer"
					>
						Open {siteUrl}
					</a>
				)}
			</section>

			<section className="card space-y-3 p-5">
				<h3 className="font-semibold text-tx">3. Somewhere other than GitHub Pages</h3>
				<p className="text-sm leading-relaxed text-tx3">
					The build output is a static folder, so Cloudflare Pages, Cloudflare Workers,
					Netlify, Vercel and Render all host it happily - each with its own trade-offs
					around build minutes, custom domains and how quickly things go wrong at 2am.
					They are written up, with the catches, in{" "}
					<a
						className="text-accent hover:underline"
						href={`https://github.com/${TEMPLATE.owner}/${TEMPLATE.repo === "portfolio-creator" ? "portfolio-creator" : TEMPLATE.repo}/blob/main/docs/hosting.md`}
						target="_blank"
						rel="noreferrer"
					>
						docs/hosting.md
					</a>
					.
				</p>
			</section>

			<section className="card space-y-3 p-5">
				<h3 className="font-semibold text-tx">Coming back later</h3>
				<p className="text-sm leading-relaxed text-tx3">
					The template keeps improving. Your answers live in one file, so pulling in new
					pages, new sections and new schema fields is a merge of the upstream template
					rather than a rewrite of your site - and anything the schema gains shows up in
					this form the next time you open it. Keep your settings.json; that is the
					whole of your portfolio.
				</p>
			</section>
		</div>
	)
}
