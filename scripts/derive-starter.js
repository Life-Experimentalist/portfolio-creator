#!/usr/bin/env node
/**
 * derive-starter.js — produces src/data/starter.json from a real portfolio's
 * settings.json.
 *
 * The starter keeps the whole structure and every styling, layout and
 * animation default, and contains nothing about the person it came from.
 * Hand-writing one drifts out of date the moment the schema gains a field, so
 * it is derived instead.
 *
 * Two rules do the work:
 *
 *   1. A key that carries a human being is emptied.
 *   2. A key that cannot legally be empty — the schema wants a URI, a
 *      hostname, a pattern, fifty characters — is DELETED rather than blanked.
 *      Ajv finds those; the loop below deletes and re-validates until it
 *      settles.
 *
 * What is left over is a starter whose only remaining complaints are "this
 * required field is missing" for the exact fields the wizard asks about. That
 * is the correct state for a blank form: unfinished, not broken, and with no
 * invented placeholder standing in for someone's name.
 *
 * Usage: node scripts/derive-starter.js ../VKrishna04.github.io/public/settings.json
 */

import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"
import Ajv from "ajv"
import addFormats from "ajv-formats"
import { ALL_PATHS } from "../src/data/steps.js"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const PUBLIC = path.join(__dirname, "..", "public")

// Keys whose value is about the site's owner rather than how the site looks.
const PERSONAL = new Set([
	"name", "author", "title", "description", "descriptions", "bio", "summary",
	"greeting", "text", "altText", "label", "heading", "subheading", "tagline",
	"username", "devUsername", "githubUsername", "userAgent", "apiUrl",
	"canonical", "customDomain", "customUrl", "customImageUrl", "url", "href",
	"image", "email", "phone", "location", "city", "country", "creator",
	"siteName", "jobTitle", "worksFor", "resumeUrl", "pdfUrl", "namespace",
	"keywords", "typewriterStrings", "sameAs", "knowsAbout", "pageDescriptions",
	"message", "timeframe", "workingHours", "timeZone", "calendly",
	"collaborationInterests", "officialName", "filename", "profileImage",
	"by", "baseUrl", "repoOwner", "pagesUrl", "handle", "avatarUrl",
])

// Objects whose every value is about the owner. Emptied wholesale, unlike
// `home.location`, where only some of the keys are.
const PERSONAL_OBJECTS = new Set(["pageDescriptions", "overrides"])

// Arrays that hold the owner's actual content. Emptied entirely — the app adds
// entries back through the form.
const CONTENT_ARRAYS = new Set([
	"skills", "stats", "items", "buttons", "paragraphs", "staticProjects",
	"experiences", "education", "awards", "certifications", "publications",
	"projects", "links", "socialLinks", "achievements", "methods", "faq",
	"languages", "interests", "featuredProjects", "categories", "ignore",
	"personalProjects", "actions", "quickLinks", "platforms", "highlights",
	"volunteerExperience",
])

const emptyLike = (value) => {
	if (Array.isArray(value)) return []
	if (value === null) return null
	switch (typeof value) {
		case "string":
			return ""
		case "number":
			return 0
		case "boolean":
			return value
		default:
			return {}
	}
}

// Subtrees kept verbatim. The navbar's links are the site's own structure -
// "Home", "About", "Projects" - not anything about its owner, and blanking
// them would leave a portfolio with six unnamed tabs.
const PRESERVE = new Set(["navbar.navigation"])

const strip = (node, key, at = "") => {
	if (Array.isArray(node)) {
		if (CONTENT_ARRAYS.has(key)) return []
		// Array items share their array's path; an index carries no meaning here.
		return node.map((item) => strip(item, key, at))
	}
	if (node && typeof node === "object") {
		const out = {}
		for (const [k, v] of Object.entries(node)) {
			const here = at ? `${at}.${k}` : k
			// `note` fields are the schema's own inline documentation, and
			// enum-valued keys like `type` decide behaviour rather than identity.
			if (k === "note" || k.endsWith("Note") || k === "$schema") {
				out[k] = v
				continue
			}
			if (PRESERVE.has(here)) {
				out[k] = v
				continue
			}
			// A name in CONTENT_ARRAYS only means "content" where the value really
			// is an array; `projects` is also the name of a whole settings section.
			if (CONTENT_ARRAYS.has(k) && Array.isArray(v)) {
				out[k] = []
				continue
			}
			if (PERSONAL_OBJECTS.has(k)) {
				out[k] = {}
				continue
			}
			// Scalars and arrays alike: an owner's keyword list is as personal as
			// their name. Objects are recursed into, because most of them mix the
			// two (`home.location` is a city plus a show/hide flag).
			if (PERSONAL.has(k) && (Array.isArray(v) || typeof v !== "object" || v === null)) {
				out[k] = emptyLike(v)
				continue
			}
			out[k] = strip(v, k, here)
		}
		return out
	}
	return node
}

// Generic rather than personal, and worth keeping so a blank starter still
// behaves sensibly the moment it is opened.
const DEFAULTS = [
	["home.greeting", "Hi There! I'm"],
	["home.copyData.enabled", true],
	["home.copyData.format", "markdown"],
	["github.type", "user"],
	["github.userAgent", "Portfolio"],
	["seo.structuredData.type", "Person"],
	["seo.crawling.search", true],
	["seo.crawling.aiTraining", true],
	["seo.crawling.aiData", true],
	["navbar.logo.type", "text"],
	["about.heading", "About Me"],
	["projects.mode", "github"],
	["contact.timeFormat", "12-hour"],
	["resume.type", "none"],
]

const setPath = (obj, dotted, value) => {
	const parts = dotted.split(".")
	let node = obj
	for (const part of parts.slice(0, -1)) {
		if (!node[part] || typeof node[part] !== "object") node[part] = {}
		node = node[part]
	}
	node[parts.at(-1)] = value
}

// --- schema ----------------------------------------------------------------

// The root schema carries no $id, so each section part is registered twice:
// once under `schemas/settings/<file>` for the root's own $refs, once under
// the bare filename for the sibling-to-sibling $refs between sections.
const buildValidator = () => {
	const ajv = new Ajv({ allErrors: true, strict: false })
	addFormats(ajv)
	const dir = path.join(PUBLIC, "schemas", "settings")
	for (const file of fs.readdirSync(dir).filter((f) => f.endsWith(".json"))) {
		const part = JSON.parse(fs.readFileSync(path.join(dir, file), "utf8"))
		ajv.addSchema(part, `schemas/settings/${file}`)
		ajv.addSchema(part, file)
	}
	const root = JSON.parse(
		fs.readFileSync(path.join(PUBLIC, "settings.schema.json"), "utf8")
	)
	return ajv.compile(root)
}

/** Ajv instancePath (`/seo/description`) as a dotted settings path. */
const dotted = (instancePath) =>
	instancePath.replace(/^\//, "").split("/").join(".")

/** The dotted path an error is really about, missing-property errors included. */
const errorPath = (err) =>
	err.keyword === "required"
		? [dotted(err.instancePath), err.params.missingProperty]
				.filter(Boolean)
				.join(".")
		: dotted(err.instancePath)

const deleteAt = (root, dottedPath) => {
	const parts = dottedPath.split(".")
	let node = root
	for (const part of parts.slice(0, -1)) {
		if (!node || typeof node !== "object") return false
		node = node[part]
	}
	if (!node || typeof node !== "object") return false
	const last = parts.at(-1)
	if (!(last in node)) return false
	delete node[last]
	return true
}

// Constraints an emptied value cannot satisfy. The key goes, rather than
// gaining an invented value.
const UNSATISFIABLE = new Set([
	"format", "pattern", "minLength", "minItems", "minimum", "enum", "type",
	"const", "formatMinimum", "exclusiveMinimum",
])

// --- identity sweep --------------------------------------------------------

// Naming every key that might carry a person is a list I can always get wrong,
// and getting it wrong ships someone else's name inside a blank template. So
// the list is only the first pass: this second one reads the identity straight
// out of the source portfolio and refuses to finish while any of it survives
// in the output, wherever it happens to be nested.

const identityTokens = (settings) => {
	const raw = [
		settings?.home?.name,
		settings?.seo?.author,
		settings?.github?.username,
		settings?.projects?.devUsername,
		settings?.projects?.officialName,
		settings?.social?.contact?.email,
		settings?.seo?.customDomain,
		settings?.seo?.twitter?.creator,
		settings?.codeLedger?.username,
	].filter((v) => typeof v === "string" && v.trim())

	try {
		const host = new URL(settings?.seo?.canonical || "").hostname
		if (host) raw.push(host, host.replace(/^www\./, ""))
	} catch {
		// no canonical, nothing to add
	}

	const tokens = new Set()
	for (const value of raw) {
		const v = value.trim().replace(/^@/, "")
		if (v.length >= 3) tokens.add(v.toLowerCase())
		// "Krishna GSVV" also has to catch "Krishna+GSVV" in a search URL.
		for (const part of v.split(/[\s@]+/)) {
			if (part.length >= 4) tokens.add(part.toLowerCase())
		}
	}
	return [...tokens]
}

/** Blank every string carrying a token; drop matching array entries whole. */
const scrubIdentity = (node, tokens, at, found) => {
	const hit = (str) => tokens.some((t) => str.toLowerCase().includes(t))

	if (typeof node === "string") {
		if (hit(node)) {
			found.push(`${at} = ${JSON.stringify(node.slice(0, 60))}`)
			return ""
		}
		return node
	}
	if (Array.isArray(node)) {
		return node
			.map((item, i) => scrubIdentity(item, tokens, `${at}[${i}]`, found))
			.filter((item) => item !== "" && item !== null)
	}
	if (node && typeof node === "object") {
		const out = {}
		for (const [k, v] of Object.entries(node)) {
			if (k === "note" || k.endsWith("Note") || k === "$schema") {
				out[k] = v
				continue
			}
			out[k] = scrubIdentity(v, tokens, at ? `${at}.${k}` : k, found)
		}
		return out
	}
	return node
}

// --- run -------------------------------------------------------------------

const source = process.argv[2]
if (!source) {
	console.error("usage: node scripts/derive-starter.js <path to settings.json>")
	process.exit(1)
}

const settings = JSON.parse(fs.readFileSync(source, "utf8"))
// Comment keys and the editor guides are the source portfolio's, not a starter's.
for (const key of Object.keys(settings)) {
	if (key.startsWith("//") || key.startsWith("_")) delete settings[key]
}

const tokens = identityTokens(settings)
const scrubbed = []
const starter = scrubIdentity(strip(settings, ""), tokens, "", scrubbed)
starter.$schema = "./settings.schema.json"
for (const [dot, value] of DEFAULTS) setPath(starter, dot, value)

if (scrubbed.length) {
	console.log(`  swept ${scrubbed.length} value(s) the key list had missed:`)
	for (const line of scrubbed.slice(0, 12)) console.log(`    ${line}`)
	if (scrubbed.length > 12) console.log(`    ...and ${scrubbed.length - 12} more`)
}

const validate = buildValidator()

// Delete-and-revalidate until it settles. Bounded, because each pass must
// delete at least one key to continue.
let pass = 0
for (; pass < 40; pass++) {
	validate(starter)
	const errors = validate.errors || []
	const removable = errors.filter((e) => UNSATISFIABLE.has(e.keyword))
	if (removable.length === 0) break
	let removed = 0
	for (const err of removable) {
		if (deleteAt(starter, errorPath(err))) removed++
	}
	if (removed === 0) break
}

validate(starter)
const residual = validate.errors || []
const tracked = new Set(ALL_PATHS)

// A residual error is expected only if it names a field the wizard asks about.
const WRAPPER = new Set(["if", "anyOf", "oneOf", "allOf", "not"])
const unexpected = residual.filter((e) => {
	if (WRAPPER.has(e.keyword)) return false
	const p = errorPath(e)
	return !tracked.has(p) && ![...tracked].some((t) => p.startsWith(`${t}.`))
})

const out = path.join(__dirname, "..", "src", "data", "starter.json")
fs.mkdirSync(path.dirname(out), { recursive: true })
fs.writeFileSync(out, JSON.stringify(starter, null, "\t") + "\n")

console.log(
	`✓ ${path.relative(process.cwd(), out)} (${JSON.stringify(starter).length} bytes, ${pass} prune passes)`
)
console.log(
	`  ${residual.length} residual error(s); every one should be a field the form asks for.`
)

if (unexpected.length) {
	console.error(
		`\n✗ ${unexpected.length} residual error(s) are NOT fields the form asks about:`
	)
	for (const e of unexpected.slice(0, 30)) {
		console.error(`  ${errorPath(e)} — ${e.keyword} ${e.message}`)
	}
	console.error(
		"\nEither add the path to src/data/steps.js, or teach strip() to handle it."
	)
	process.exit(1)
}

// Belt and braces: the file that is actually on disk, read back as text.
const written = fs.readFileSync(out, "utf8").toLowerCase()
const survivors = tokens.filter((t) => written.includes(t))
if (survivors.length) {
	console.error(
		`
✗ the starter still contains the source portfolio's identity: ${survivors.join(", ")}`
	)
	process.exit(1)
}
console.log(`✓ identity sweep clean (${tokens.length} tokens checked)`)

console.log("✓ STARTER OK — the only gaps are the ones the wizard fills in.")
