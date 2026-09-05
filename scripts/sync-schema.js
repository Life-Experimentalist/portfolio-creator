#!/usr/bin/env node
/**
 * sync-schema.js — copies the portfolio's JSON Schema into this repository.
 *
 * The README's claim is that the form is checked against the same schema the
 * portfolio itself uses, so there is no second set of rules to drift out of
 * sync. That claim is only true if somebody keeps copying the files across,
 * and three drifts have already got through by hand: a missing
 * navigation.schema.json, a stricter technology-name pattern that rejected
 * "C++", and a projects section without tier, order or packages. Each one made
 * the creator reject a settings.json the portfolio accepts, or accept one it
 * does not.
 *
 * So the copy is a command rather than a habit. Run it whenever the portfolio's
 * schema moves, then `npm run derive:starter` and commit both.
 *
 * Usage: node scripts/sync-schema.js [path to the portfolio checkout]
 */

import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const HERE = path.join(__dirname, "..", "public")

const source = process.argv[2] || path.join(__dirname, "..", "..", "VKrishna04.github.io")
const from = path.join(source, "public")

if (!fs.existsSync(path.join(from, "settings.schema.json"))) {
	console.error(`✗ no settings.schema.json under ${from}`)
	console.error("  usage: node scripts/sync-schema.js <path to the portfolio checkout>")
	process.exit(1)
}

/*
 * The schema files in this repository are CRLF and the portfolio's are LF.
 * Rewriting the line endings would bury a real change under fourteen files of
 * whitespace, so each destination keeps whatever it already uses.
 */
const write = (dest, text) => {
	const existing = fs.existsSync(dest) ? fs.readFileSync(dest, "utf8") : ""
	const crlf = existing.includes("\r\n")
	const body = text.replace(/\r\n/g, "\n")
	const before = existing.replace(/\r\n/g, "\n")
	fs.writeFileSync(dest, crlf ? body.replace(/\n/g, "\r\n") : body)
	return before !== body
}

const changed = []

if (write(path.join(HERE, "settings.schema.json"), fs.readFileSync(path.join(from, "settings.schema.json"), "utf8"))) {
	changed.push("settings.schema.json")
}

const partsFrom = path.join(from, "schemas", "settings")
const partsHere = path.join(HERE, "schemas", "settings")
fs.mkdirSync(partsHere, { recursive: true })

const wanted = fs.readdirSync(partsFrom).filter((f) => f.endsWith(".schema.json"))
for (const file of wanted) {
	if (write(path.join(partsHere, file), fs.readFileSync(path.join(partsFrom, file), "utf8"))) {
		changed.push(`schemas/settings/${file}`)
	}
}

// A section deleted upstream would otherwise sit here forever, still $ref-able
// by nothing and still shipped in the bundle.
const stale = fs
	.readdirSync(partsHere)
	.filter((f) => f.endsWith(".schema.json") && !wanted.includes(f))
for (const file of stale) {
	fs.unlinkSync(path.join(partsHere, file))
	changed.push(`removed schemas/settings/${file}`)
}

console.log(`✓ synced ${wanted.length + 1} schema file(s) from ${path.relative(process.cwd(), from)}`)
if (!changed.length) {
	console.log("  already identical — nothing to commit")
} else {
	console.log(`  ${changed.length} changed:`)
	for (const file of changed) console.log(`    ${file}`)
	console.log("\n  Re-derive the starter and commit both:")
	console.log("    npm run derive:starter")
}
