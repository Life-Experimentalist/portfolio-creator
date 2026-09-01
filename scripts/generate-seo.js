#!/usr/bin/env node
/**
 * generate-seo.js — writes the crawlable files into dist/ after vite build.
 *
 * A single-page app has one URL worth indexing, so this is short by design:
 * robots.txt, a sitemap with that one URL in it, and humans.txt. The last one
 * carries the project credit, the same way the portfolio this tool builds
 * does, because a deployed copy should say what it was made from without
 * anyone having to go and look at the repository.
 *
 * SITE_URL overrides the address for a fork or a custom domain.
 */

import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DIST = path.join(__dirname, "..", "dist")

if (!fs.existsSync(DIST)) {
	console.error("✗ dist/ does not exist — run vite build first")
	process.exit(1)
}

const SITE = (
	process.env.SITE_URL || "https://life-experimentalist.github.io/portfolio-creator/"
).replace(/\/?$/, "/")

const CREDIT = {
	author: "Krishna GSVV",
	github: "https://github.com/VKrishna04",
	repository: "https://github.com/Life-Experimentalist/portfolio-creator",
	template: "https://github.com/VKrishna04/VKrishna04.github.io",
	license: "Apache-2.0",
	credit: "Designed & built by Krishna GSVV",
}

const today = new Date().toISOString().slice(0, 10)

fs.writeFileSync(
	path.join(DIST, "robots.txt"),
	`# ${CREDIT.credit} — ${CREDIT.repository}
User-agent: *
Allow: /

Sitemap: ${SITE}sitemap.xml
`
)

fs.writeFileSync(
	path.join(DIST, "sitemap.xml"),
	`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
\t<url>
\t\t<loc>${SITE}</loc>
\t\t<lastmod>${today}</lastmod>
\t\t<changefreq>weekly</changefreq>
\t\t<priority>1.0</priority>
\t</url>
</urlset>
`
)

fs.writeFileSync(
	path.join(DIST, "humans.txt"),
	`/* BUILT WITH */
${CREDIT.credit}
Author: ${CREDIT.github}
Source: ${CREDIT.repository}
Template: ${CREDIT.template}
License: ${CREDIT.license}
`
)

// The web app manifest is written here rather than kept in public/ because
// start_url and scope have to carry the base path, and that is only known once
// the build has been told where the site is being served from.
const BASE = (process.env.BASE_PATH || "/").replace(/\/?$/, "/")

fs.writeFileSync(
	path.join(DIST, "manifest.webmanifest"),
	JSON.stringify(
		{
			name: "Portfolio Creator",
			short_name: "Portfolio",
			description: "Fill in a form, get a portfolio.",
			id: "portfolio-creator",
			start_url: BASE,
			scope: BASE,
			display: "standalone",
			background_color: "#07070b",
			theme_color: "#07070b",
			icons: [
				{ src: "icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
				{ src: "icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
				{ src: "icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
			],
		},
		null,
		"\t"
	) + "\n"
)

// Apache 2.0 section 4(d) asks that the NOTICE travel with the work. A
// deployed copy is a redistribution, so it travels with that too.
fs.copyFileSync(path.join(__dirname, "..", "NOTICE"), path.join(DIST, "NOTICE.txt"))

// The credit is in the HTML too, and a build that has lost it is a build worth
// stopping. This is not obfuscation — it is a check that a refactor did not
// quietly drop the one thing the licence asks for.
const html = fs.readFileSync(path.join(DIST, "index.html"), "utf8")
const missing = [
	['<meta name="generator">', 'name="generator"'],
	['<meta name="attribution">', 'name="attribution"'],
	[`the author's name`, CREDIT.author],
].filter(([, needle]) => !html.includes(needle))

if (missing.length) {
	console.error("✗ dist/index.html is missing its attribution:")
	for (const [what] of missing) console.error(`  ${what}`)
	process.exit(1)
}

console.log(`✓ robots.txt, sitemap.xml, humans.txt, manifest.webmanifest, NOTICE.txt written for ${SITE}`)
console.log("✓ attribution present in dist/index.html")
