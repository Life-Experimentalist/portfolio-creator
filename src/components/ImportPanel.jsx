/**
 * Three ways in: start from a GitHub account, upload a settings.json you
 * already have, or type everything by hand.
 *
 * The GitHub route is a prefill, not an import — it fills the fields a public
 * profile can honestly answer (name, bio, location, blog, avatar) and leaves
 * the rest alone. No token is needed for any of it; public profile data is
 * public.
 */

import { useState } from "react"

import { fetchProfile, fetchRepos } from "../lib/github.js"
import { set } from "../lib/settings.js"

/** Fields a public GitHub profile can fill in without guessing. */
const fromProfile = (settings, profile) => {
	let next = settings
	const put = (path, value) => {
		if (value) next = set(next, path, value)
	}

	put("github.username", profile.login)
	put("home.name", profile.name || profile.login)
	put("home.description", profile.bio)
	put("home.location.text", profile.location)
	put("home.location.city", profile.location)
	put("home.profileImage.altText", profile.name || profile.login)
	put("about.image.altText", profile.name || profile.login)
	put("seo.author", profile.name || profile.login)
	put("projects.devUsername", profile.login)
	put("projects.officialName", profile.name || profile.login)
	put("social.contact.email", profile.email)
	put("social.contact.location", profile.location)
	put("footer.copyright.name", profile.name || profile.login)
	put("navbar.logo.name", profile.name || profile.login)
	if (profile.twitter_username) put("seo.twitter.creator", `@${profile.twitter_username}`)

	const sameAs = [profile.html_url, profile.blog].filter(Boolean)
	if (sameAs.length) next = set(next, "seo.structuredData.sameAs", sameAs)

	return next
}

export default function ImportPanel({ settings, onReplace, onNotice }) {
	const [username, setUsername] = useState("")
	const [busy, setBusy] = useState(false)
	const [repos, setRepos] = useState([])
	const [error, setError] = useState("")

	const pull = async () => {
		const login = username.trim()
		if (!login) return
		setBusy(true)
		setError("")
		try {
			const profile = await fetchProfile(login)
			const list = await fetchRepos(login, settings?.github?.type || "user")
			setRepos(list)
			onReplace(fromProfile(settings, profile))
			onNotice(
				`Filled in what ${profile.login}'s public profile could answer. Everything else is still yours to write.`
			)
		} catch (e) {
			setError(e.message)
		} finally {
			setBusy(false)
		}
	}

	const upload = async (file) => {
		if (!file) return
		try {
			const parsed = JSON.parse(await file.text())
			onReplace(parsed)
			onNotice(`Loaded ${file.name}. Check the validation panel before publishing.`)
		} catch (e) {
			setError(`That file is not valid JSON: ${e.message}`)
		}
	}

	const hidden = new Set(settings?.projects?.ignore || [])
	const toggleRepo = (name) => {
		const next = new Set(hidden)
		if (next.has(name)) next.delete(name)
		else next.add(name)
		onReplace(set(settings, "projects.ignore", [...next]))
	}

	return (
		<div className="space-y-6">
			<section className="card space-y-3 p-5">
				<h3 className="font-semibold text-zinc-100">Start from a GitHub account</h3>
				<p className="text-sm leading-relaxed text-zinc-400">
					Reads the public profile and repository list. No sign-in, no token, nothing
					stored. It fills in the questions a public profile can actually answer and
					leaves the rest blank.
				</p>
				<div className="flex flex-wrap gap-2">
					<input
						className="field flex-1 min-w-[14rem]"
						placeholder="github username or organisation"
						value={username}
						onChange={(e) => setUsername(e.target.value)}
						onKeyDown={(e) => e.key === "Enter" && pull()}
					/>
					<button className="btn btn-primary" onClick={pull} disabled={busy}>
						{busy ? "Reading..." : "Prefill"}
					</button>
				</div>
				{error && <p className="text-sm text-accent2">{error}</p>}
			</section>

			{repos.length > 0 && (
				<section className="card space-y-3 p-5">
					<h3 className="font-semibold text-zinc-100">
						Which repositories should stay off the site?
					</h3>
					<p className="text-sm text-zinc-400">
						{repos.length} public repositories. Ticking one adds it to the ignore list;
						everything else appears automatically, and so will anything you push later.
					</p>
					<div className="scroll-thin max-h-72 space-y-1 overflow-y-auto pr-1">
						{repos.map((repo) => (
							<label
								key={repo.id}
								className="flex cursor-pointer items-start gap-3 rounded-lg px-2 py-1.5 hover:bg-white/5"
							>
								<input
									type="checkbox"
									className="mt-1 h-4 w-4 accent-accent2"
									checked={hidden.has(repo.name)}
									onChange={() => toggleRepo(repo.name)}
								/>
								<span className="min-w-0">
									<span className="block truncate text-sm text-zinc-200">
										{repo.name}
										{repo.fork && <span className="ml-2 text-xs text-zinc-600">fork</span>}
									</span>
									{repo.description && (
										<span className="block truncate text-xs text-zinc-500">
											{repo.description}
										</span>
									)}
								</span>
							</label>
						))}
					</div>
				</section>
			)}

			<section className="card space-y-3 p-5">
				<h3 className="font-semibold text-zinc-100">Already have a settings.json?</h3>
				<p className="text-sm leading-relaxed text-zinc-400">
					Load it and carry on editing. This is also how you come back later: download
					the file, keep it, and upload it again next time rather than starting over.
				</p>
				<input
					type="file"
					accept="application/json,.json"
					className="field cursor-pointer text-sm file:mr-3 file:rounded file:border-0 file:bg-accent/20 file:px-3 file:py-1 file:text-accent"
					onChange={(e) => upload(e.target.files?.[0])}
				/>
			</section>
		</div>
	)
}
