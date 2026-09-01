/**
 * Validation, driven by the portfolio's own JSON Schema.
 *
 * The schema is split by section — public/settings.schema.json holds the
 * universal keys and $refs one file per section out of schemas/settings/. Ajv
 * resolves a relative $ref against the referring schema's id, and the root
 * declares no $id, so each part is registered under exactly the path the root
 * names it by, plus the bare filename a sibling part refers to it by. Get that
 * wrong and every section $ref dangles.
 *
 * Validating here rather than inventing a parallel set of rules is the point:
 * if the portfolio accepts it, the creator accepts it, and neither can drift.
 */

import Ajv from "ajv"
import addFormats from "ajv-formats"

import root from "../../public/settings.schema.json"

// Vite inlines every section schema at build time, so the app validates
// offline and there is no request to get wrong on a subpath deploy.
const parts = import.meta.glob("../../public/schemas/settings/*.schema.json", {
	eager: true,
	import: "default",
})

const ajv = new Ajv({ allErrors: true, strict: false })
addFormats(ajv)

for (const [filePath, part] of Object.entries(parts)) {
	const file = filePath.split("/").pop()
	const copy = { ...part }
	delete copy.$schema
	ajv.addSchema(copy, `schemas/settings/${file}`)
	ajv.addSchema(copy, file)
}

const rootCopy = { ...root }
delete rootCopy.$schema
const validate = ajv.compile(rootCopy)

/** Top-level section a JSON Pointer belongs to, for grouping errors by step. */
const sectionOf = (instancePath) => instancePath.split("/")[1] || "(root)"

/**
 * Ajv reports the branch as well as the leaf: a conditional that fails comes
 * back as both `must match "then" schema` and the actual missing field. Only
 * the second one tells anybody what to type, so the branch is hidden from the
 * list — never from the verdict, which stays whatever Ajv said.
 */
const WRAPPER = new Set(["if", "anyOf", "oneOf", "allOf", "not"])

/**
 * A human-readable line for one Ajv error. Ajv's own message is accurate but
 * ends mid-sentence ("must NOT have fewer than 50 characters"); the params
 * carry the rest.
 */
const describe = (error) => {
	const { keyword, params, message } = error
	if (keyword === "required") return `missing ${params.missingProperty}`
	if (keyword === "enum") return `must be one of: ${params.allowedValues.join(", ")}`
	if (keyword === "pattern") return `does not match ${params.pattern}`
	if (keyword === "additionalProperties")
		return `unexpected key "${params.additionalProperty}"`
	return message
}

/**
 * Validates a settings object.
 * @param {object} settings
 * @returns {{valid: boolean, errors: Array, bySection: Object}}
 */
export function validateSettings(settings) {
	const valid = validate(settings)
	const raw = validate.errors || []
	const useful = raw.filter((e) => !WRAPPER.has(e.keyword))
	// If hiding the branches would hide everything, show them: an error list
	// that says nothing next to a red badge is worse than an awkward message.
	const errors = (useful.length ? useful : raw).map((e) => ({
		path: e.instancePath || "(root)",
		section: sectionOf(e.instancePath || ""),
		message: describe(e),
	}))

	const bySection = {}
	for (const error of errors) {
		bySection[error.section] = bySection[error.section] || []
		bySection[error.section].push(error)
	}

	return { valid, errors, bySection }
}

/** Section names the root schema knows about, in schema order. */
export const SECTIONS = Object.keys(root.properties || {}).filter(
	(k) => !k.startsWith("$") && !k.startsWith("_")
)
