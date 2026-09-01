#!/usr/bin/env node
/**
 * generate-sw.js — writes dist/sw.js after vite build and generate-seo.js.
 *
 * The form is one page with no backend, so once the HTML and the bundle are
 * stored there is nothing left for it to need. Filling the form in on a train
 * works; so does reloading the tab afterwards.
 *
 * The only network calls the app makes are to api.github.com, and the service
 * worker does not touch those — it leaves them to fail the way the app already
 * expects them to.
 *
 * BASE_PATH matters here. The app is served from /portfolio-creator/ on GitHub
 * Pages, and a worker registered at the root would be out of scope and quietly
 * do nothing.
 */

import crypto from "crypto"
import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(__dirname, "..")
const DIST = path.join(ROOT, "dist")

if (!fs.existsSync(DIST)) {
	console.error("✗ dist/ does not exist — run vite build first")
	process.exit(1)
}

const BASE = (process.env.BASE_PATH || "/").replace(/\/?$/, "/")
const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, "package.json"), "utf8"))

/** Shipped, but not needed to draw the page. */
const SKIP_EXACT = new Set([
	"desktop.ini",
	"robots.txt",
	"sitemap.xml",
	"humans.txt",
	"NOTICE.txt",
	"og.png",
	"settings.schema.json",
	"sw.js",
])

// The schemas under public/schemas/ are compiled into the bundle at build
// time; the copies in dist/ are there for anyone who wants to read them, not
// for the app, so they stay out of the install.
const SKIP_DIRS = ["schemas/"]

const walk = (dir, prefix = "") =>
	fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
		const rel = prefix + entry.name
		return entry.isDirectory() ? walk(path.join(dir, entry.name), `${rel}/`) : [rel]
	})

const keep = (rel) => {
	if (SKIP_EXACT.has(rel)) return false
	if (SKIP_DIRS.some((dir) => rel.startsWith(dir))) return false
	if (rel.endsWith(".html")) return true
	if (rel.startsWith("assets/")) return true
	if (rel === "manifest.webmanifest" || rel === "favicon.svg") return true
	return false
}

const files = walk(DIST).filter(keep).sort()

const urls = new Set(files.map((rel) => BASE + rel))
urls.add(BASE)
const precache = [...urls].sort()

const stamp = crypto
	.createHash("sha256")
	.update(files.map((rel) => rel + fs.statSync(path.join(DIST, rel)).size).join("\n"))
	.digest("hex")
	.slice(0, 8)

const template = fs.readFileSync(path.join(__dirname, "sw-template.js"), "utf8")
const sw = template
	.replace("__CACHE_VERSION__", `${pkg.version}-${stamp}`)
	.replace("__BASE__", BASE)
	.replace("__PRECACHE__", JSON.stringify(precache, null, "\t"))

fs.writeFileSync(path.join(DIST, "sw.js"), sw)

console.log(`✓ dist/sw.js written — ${precache.length} URLs precached, cache v${pkg.version}-${stamp}`)
