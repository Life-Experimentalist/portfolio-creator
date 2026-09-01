/**
 * Reading and writing a settings object by dotted path, plus the export
 * formats. Everything the form does to the config goes through here, so the
 * form definition can stay a flat list of paths.
 */

/** Reads `a.b.c` out of an object, or undefined. */
export const get = (obj, dotted) =>
	dotted.split(".").reduce((node, key) => (node == null ? undefined : node[key]), obj)

/**
 * Returns a copy of `obj` with `a.b.c` set to `value`. Copies only the nodes
 * along the path, so React sees a new object for exactly the branch that moved.
 */
export const set = (obj, dotted, value) => {
	const [head, ...rest] = dotted.split(".")
	if (!rest.length) return { ...obj, [head]: value }
	const child = obj?.[head]
	return {
		...obj,
		[head]: set(child && typeof child === "object" ? child : {}, rest.join("."), value),
	}
}

/** Triggers a browser download of `text` as `filename`. */
export const download = (filename, text, type = "application/json") => {
	const url = URL.createObjectURL(new Blob([text], { type }))
	const link = document.createElement("a")
	link.href = url
	link.download = filename
	document.body.appendChild(link)
	link.click()
	link.remove()
	URL.revokeObjectURL(url)
}

/** The file the portfolio actually reads, tab-indented like the original. */
export const toSettingsJson = (settings) =>
	JSON.stringify(settings, null, "\t") + "\n"

/**
 * How far through the form someone is: the share of tracked paths that hold a
 * non-empty value. Used for the progress bar, not for validation — the schema
 * decides whether the file is correct.
 */
export const completion = (settings, paths) => {
	if (!paths.length) return 0
	const filled = paths.filter((path) => {
		const value = get(settings, path)
		if (Array.isArray(value)) return value.length > 0
		if (typeof value === "string") return value.trim() !== ""
		return value !== undefined && value !== null && value !== ""
	})
	return Math.round((filled.length / paths.length) * 100)
}
