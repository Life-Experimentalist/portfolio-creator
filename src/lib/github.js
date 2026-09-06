/**
 * GitHub, entirely from the browser.
 *
 * Every request in this file goes to api.github.com and nowhere else. There is
 * no server behind this app — it is a static bundle on GitHub Pages — so a
 * token typed into the publish step is held in a React state variable for the
 * length of the visit and sent only to GitHub. Nothing is stored, logged or
 * forwarded. That is worth knowing before typing one in, so the UI says it too.
 *
 * The read paths (profile, repos) are unauthenticated: 60 requests an hour per
 * IP, which is plenty for filling in a form once.
 */

const API = "https://api.github.com"

const request = async (path, { token, method = "GET", body } = {}) => {
	const response = await fetch(`${API}${path}`, {
		method,
		headers: {
			Accept: "application/vnd.github+json",
			"X-GitHub-Api-Version": "2022-11-28",
			...(token ? { Authorization: `Bearer ${token}` } : {}),
			...(body ? { "Content-Type": "application/json" } : {}),
		},
		...(body ? { body: JSON.stringify(body) } : {}),
	})

	if (response.status === 204) return null

	const payload = await response.json().catch(() => null)
	if (!response.ok) {
		const detail = payload?.message || response.statusText
		const errors = payload?.errors?.map((e) => e.message || e.field).filter(Boolean)
		throw new Error(errors?.length ? `${detail} (${errors.join("; ")})` : detail)
	}
	return payload
}

/** Public profile for a user or organisation. */
export const fetchProfile = (username) =>
	request(`/users/${encodeURIComponent(username)}`)

/**
 * Public repositories, newest activity first, with the forks and archived ones
 * left in — the form lets you pick, and hiding them here would be a decision
 * this module has no business making.
 */
export const fetchRepos = async (username, type = "user") => {
	const scope = type === "org" ? "orgs" : "users"
	const repos = await request(
		`/${scope}/${encodeURIComponent(username)}/repos?per_page=100&sort=updated`
	)
	return (repos || []).map((repo) => ({
		name: repo.name,
		fullName: repo.full_name,
		description: repo.description || "",
		language: repo.language || "",
		topics: repo.topics || [],
		stars: repo.stargazers_count,
		forks: repo.forks_count,
		archived: repo.archived,
		isFork: repo.fork,
		homepage: repo.homepage || "",
		htmlUrl: repo.html_url,
		updatedAt: repo.updated_at,
	}))
}

/** The account a token belongs to. Also the token's smoke test. */
export const whoami = (token) => request("/user", { token })

/** Scopes GitHub reports for a classic token, or null for fine-grained ones. */
export const tokenScopes = async (token) => {
	const response = await fetch(`${API}/user`, {
		headers: { Authorization: `Bearer ${token}`, Accept: "application/vnd.github+json" },
	})
	const header = response.headers.get("x-oauth-scopes")
	return header ? header.split(",").map((s) => s.trim()).filter(Boolean) : null
}

/**
 * Creates the new portfolio repository from the template.
 * @param {string} token
 * @param {{owner: string, name: string, description: string, private: boolean}} options
 */
export const createFromTemplate = (
	token,
	{ templateOwner, templateRepo, owner, name, description, isPrivate = false }
) =>
	request(`/repos/${templateOwner}/${templateRepo}/generate`, {
		token,
		method: "POST",
		body: {
			owner,
			name,
			description,
			private: isPrivate,
			include_all_branches: false,
		},
	})

/** Existing file sha, or null when the path is new. Needed to update in place. */
const shaOf = async (token, owner, repo, path) => {
	try {
		const file = await request(
			`/repos/${owner}/${repo}/contents/${path}`,
			{ token }
		)
		return file?.sha || null
	} catch {
		return null
	}
}

/** UTF-8 safe base64 — btoa alone mangles anything above U+00FF. */
const toBase64 = (text) => {
	const bytes = new TextEncoder().encode(text)
	let binary = ""
	for (const byte of bytes) binary += String.fromCharCode(byte)
	return btoa(binary)
}

/** Commits one file, creating or updating it. */
export const putFile = async (token, { owner, repo, path, content, message }) => {
	const sha = await shaOf(token, owner, repo, path)
	return request(`/repos/${owner}/${repo}/contents/${path}`, {
		token,
		method: "PUT",
		body: { message, content: toBase64(content), ...(sha ? { sha } : {}) },
	})
}

/**
 * What the template carries that describes the *template owner's* site rather
 * than yours. `/generate` copies a repository file for file, so without this a
 * new portfolio ships a sitemap, a robots.txt and a set of JSON endpoints that
 * all name someone else's domain — served from your URL until your first build
 * overwrites them. `npm run prepare-data` regenerates every one of these from
 * your own settings.json, so removing them costs you nothing.
 *
 * public/NOTICE.txt is deliberately not in this list. That one is the
 * Apache-2.0 attribution, and it is meant to travel with the code.
 */
export const INHERITED_SEO_FILES = [
	"public/robots.txt",
	"public/sitemap.xml",
	"public/llms.txt",
	"public/humans.txt",
	"public/api/portfolio.json",
	"public/api/projects.json",
	"public/api/about.json",
	"public/api/contact.json",
	"public/.well-known/ai-plugin.json",
]

/**
 * Deletes those files, in one commit.
 *
 * The contents API deletes a single file per call and each call is its own
 * commit, which would put nine near-identical commits at the top of a brand
 * new repository's history. The git data API can express the whole removal as
 * one tree instead: a tree entry with a null sha deletes that path.
 *
 * Returns the paths that were actually there and are now gone.
 */
export const removeInheritedSeo = async (token, { owner, repo }) => {
	const base = `/repos/${owner}/${repo}`
	const { default_branch: branch } = await request(base, { token })
	const head = await request(`${base}/git/ref/heads/${branch}`, { token })
	const commit = await request(`${base}/git/commits/${head.object.sha}`, { token })

	// Ask the tree what is actually present. Deleting a path the tree does not
	// have is an error, and the template will not always carry all nine.
	const tree = await request(`${base}/git/trees/${commit.tree.sha}?recursive=1`, {
		token,
	})
	const present = new Set((tree.tree || []).map((entry) => entry.path))
	const removing = INHERITED_SEO_FILES.filter((path) => present.has(path))
	if (removing.length === 0) return []

	const newTree = await request(`${base}/git/trees`, {
		token,
		method: "POST",
		body: {
			base_tree: commit.tree.sha,
			tree: removing.map((path) => ({
				path,
				mode: "100644",
				type: "blob",
				sha: null,
			})),
		},
	})

	const newCommit = await request(`${base}/git/commits`, {
		token,
		method: "POST",
		body: {
			message:
				"Remove the template owner's SEO files\n\n" +
				"robots.txt, sitemap.xml, llms.txt, humans.txt and the JSON endpoints " +
				"under public/api are generated from settings.json, and the copies the " +
				"template ships name the template owner's domain. The build regenerates " +
				"them from yours.",
			tree: newTree.sha,
			parents: [commit.sha],
		},
	})

	await request(`${base}/git/refs/heads/${branch}`, {
		token,
		method: "PATCH",
		body: { sha: newCommit.sha },
	})

	return removing
}

/**
 * Turns on GitHub Pages, building from the repository's Actions workflow.
 * Newly created repositories sometimes 404 here for a few seconds, so the
 * caller treats a failure as "do this one by hand" rather than as fatal.
 */
export const enablePages = (token, { owner, repo }) =>
	request(`/repos/${owner}/${repo}/pages`, {
		token,
		method: "POST",
		body: { build_type: "workflow" },
	})
