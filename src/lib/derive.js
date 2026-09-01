/**
 * Fields the app works out instead of asking about twice.
 *
 * The GitHub API URL is a function of the username and account type; the
 * Twitter card is the Open Graph card unless someone deliberately changes it.
 * Asking for these again is how a form gets long for no reason, and how two
 * answers to the same question end up disagreeing.
 *
 * Derivation runs on export, not on every keystroke, so a value a user has
 * typed by hand is never overwritten while they are still looking at it.
 */

import { DERIVATIONS, STEPS } from "../data/steps.js"
import { get, set } from "./settings.js"

/** Every field carrying a `derived` name, paired with its derivation. */
const DERIVED_FIELDS = STEPS.flatMap((step) =>
	step.fields
		.filter((field) => field.derived && DERIVATIONS[field.derived])
		.map((field) => ({ path: field.path, run: DERIVATIONS[field.derived] }))
)

/**
 * Returns a copy of `settings` with every derived field filled in.
 *
 * A derivation that returns undefined leaves the existing value alone, so a
 * hand-edited override survives; everything else is kept in step with the
 * field it follows.
 */
export const applyDerived = (settings) =>
	DERIVED_FIELDS.reduce((acc, { path, run }) => {
		const value = run(acc)
		return value === undefined ? acc : set(acc, path, value)
	}, settings)

/** The value a derived field would take right now, for showing it read-only. */
export const previewDerived = (settings, field) => {
	const run = DERIVATIONS[field.derived]
	return (run ? run(settings) : undefined) ?? get(settings, field.path) ?? ""
}
