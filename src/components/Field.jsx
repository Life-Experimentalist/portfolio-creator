/**
 * One question, rendered from its entry in steps.js.
 *
 * Nothing here knows what `home.name` means. The field says it is a text box
 * at a dotted path, and this decides what that looks like — which is what lets
 * the form grow by editing a data file rather than by editing components.
 */

import { get } from "../lib/settings.js"
import { previewDerived } from "../lib/derive.js"
import ListEditor from "./ListEditor.jsx"

/** Array-of-strings edited as one per line. */
const TagsInput = ({ value, onChange, placeholder }) => (
	<textarea
		className="field min-h-[7rem] font-mono text-sm"
		value={(value || []).join("\n")}
		placeholder={placeholder}
		onChange={(e) =>
			onChange(
				e.target.value
					.split("\n")
					.map((line) => line.trim())
					.filter(Boolean)
			)
		}
	/>
)

/**
 * The same, for the places the schema wants `[{name}]` rather than `[string]`.
 * Existing entries keep whatever other keys they already carry (an icon, a
 * colour), so editing the list of skills does not throw away their styling.
 */
const NameTagsInput = ({ value, onChange, placeholder }) => {
	const rows = value || []
	return (
		<textarea
			className="field min-h-[7rem] font-mono text-sm"
			value={rows.map((row) => (typeof row === "string" ? row : row?.name || "")).join("\n")}
			placeholder={placeholder}
			onChange={(e) => {
				const names = e.target.value
					.split("\n")
					.map((line) => line.trim())
					.filter(Boolean)
				onChange(
					names.map((name) => {
						const existing = rows.find(
							(row) => typeof row === "object" && row?.name === name
						)
						return existing || { name }
					})
				)
			}}
		/>
	)
}

export default function Field({ field, settings, onChange }) {
	// A field can hide behind another answer — there is no point asking for a
	// custom image URL when the profile picture comes from GitHub.
	if (field.showIf) {
		const [path, expected] = field.showIf
		if (get(settings, path) !== expected) return null
	}

	const value = get(settings, field.path)
	const setValue = (next) => onChange(field.path, next)

	const label = (
		<div className="flex items-baseline justify-between gap-3">
			<label className="text-sm font-medium text-zinc-200">
				{field.label}
				{field.required && <span className="ml-1 text-accent2">*</span>}
			</label>
			<code className="shrink-0 text-[11px] text-zinc-600">{field.path}</code>
		</div>
	)

	const help = field.help && (
		<p className="text-xs leading-relaxed text-zinc-500">{field.help}</p>
	)

	if (field.derived) {
		return (
			<div className="space-y-1.5">
				{label}
				<input
					className="field cursor-not-allowed bg-black/40 text-zinc-500"
					value={previewDerived(settings, field)}
					readOnly
					tabIndex={-1}
				/>
				<p className="text-xs leading-relaxed text-zinc-500">
					{field.help || "Worked out from your other answers."}
				</p>
			</div>
		)
	}

	let control
	switch (field.type) {
		case "boolean":
			return (
				<div className="space-y-1.5">
					<label className="flex cursor-pointer items-center gap-3">
						<input
							type="checkbox"
							className="h-4 w-4 accent-accent"
							checked={value === true}
							onChange={(e) => setValue(e.target.checked)}
						/>
						<span className="text-sm font-medium text-zinc-200">{field.label}</span>
						<code className="ml-auto text-[11px] text-zinc-600">{field.path}</code>
					</label>
					{help}
				</div>
			)

		case "select":
			control = (
				<select
					className="field"
					value={value ?? ""}
					onChange={(e) => setValue(e.target.value)}
				>
					<option value="">-- choose --</option>
					{field.options.map((option) => (
						<option key={option} value={option}>
							{option}
						</option>
					))}
				</select>
			)
			break

		case "textarea":
			control = (
				<textarea
					className="field min-h-[6rem]"
					value={value ?? ""}
					placeholder={field.placeholder}
					onChange={(e) => setValue(e.target.value)}
				/>
			)
			break

		case "number":
			control = (
				<input
					type="number"
					className="field"
					value={value ?? ""}
					placeholder={field.placeholder}
					onChange={(e) =>
						setValue(e.target.value === "" ? undefined : Number(e.target.value))
					}
				/>
			)
			break

		case "tags":
			control = (
				<TagsInput value={value} onChange={setValue} placeholder={field.placeholder} />
			)
			break

		case "nameTags":
			control = (
				<NameTagsInput value={value} onChange={setValue} placeholder={field.placeholder} />
			)
			break

		case "list":
			return (
				<div className="space-y-2">
					{label}
					{help}
					<ListEditor field={field} value={value || []} onChange={setValue} />
				</div>
			)

		default:
			control = (
				<input
					type={field.type === "email" ? "email" : field.type === "url" ? "url" : "text"}
					className="field"
					value={value ?? ""}
					placeholder={field.placeholder}
					onChange={(e) => setValue(e.target.value)}
				/>
			)
	}

	return (
		<div className="space-y-1.5">
			{label}
			{control}
			{help}
		</div>
	)
}
