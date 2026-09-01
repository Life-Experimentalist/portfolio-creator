/**
 * Repeating sections — jobs, projects, skill groups, social profiles.
 *
 * Rows carry keys the form does not ask about (a brand colour, a
 * `showInAbout` flag, whatever a future schema adds). Editing a row spreads
 * over the existing object rather than replacing it, so those keys survive a
 * round trip through the form instead of quietly disappearing.
 */

import { useState } from "react"

const blankRow = (item) =>
	Object.fromEntries(
		item.map((sub) => [
			sub.key,
			sub.type === "boolean" ? false : sub.type === "tags" ? [] : "",
		])
	)

const SubField = ({ sub, value, onChange }) => {
	switch (sub.type) {
		case "boolean":
			return (
				<label className="flex items-center gap-2 py-1.5">
					<input
						type="checkbox"
						className="h-4 w-4 accent-accent"
						checked={value === true}
						onChange={(e) => onChange(e.target.checked)}
					/>
					<span className="text-xs text-zinc-300">{sub.label}</span>
				</label>
			)
		case "select":
			return (
				<select className="field" value={value ?? ""} onChange={(e) => onChange(e.target.value)}>
					<option value="">-- {sub.label} --</option>
					{sub.options.map((option) => (
						<option key={option} value={option}>
							{option}
						</option>
					))}
				</select>
			)
		case "textarea":
			return (
				<textarea
					className="field min-h-[4.5rem]"
					value={value ?? ""}
					placeholder={sub.placeholder || sub.label}
					onChange={(e) => onChange(e.target.value)}
				/>
			)
		case "tags":
			return (
				<textarea
					className="field min-h-[4.5rem] font-mono text-xs"
					value={(value || []).join("\n")}
					placeholder={sub.placeholder || `${sub.label} - one per line`}
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
		case "nameTags":
			return (
				<textarea
					className="field min-h-[4.5rem] font-mono text-xs"
					value={(value || [])
						.map((row) => (typeof row === "string" ? row : row?.name || ""))
						.join("\n")}
					placeholder={sub.placeholder || `${sub.label} - one per line`}
					onChange={(e) => {
						const names = e.target.value
							.split("\n")
							.map((line) => line.trim())
							.filter(Boolean)
						const rows = value || []
						onChange(
							names.map(
								(name) =>
									rows.find((row) => typeof row === "object" && row?.name === name) || {
										name,
									}
							)
						)
					}}
				/>
			)
		default:
			return (
				<input
					className="field"
					value={value ?? ""}
					placeholder={sub.placeholder || sub.label}
					onChange={(e) => onChange(e.target.value)}
				/>
			)
	}
}

export default function ListEditor({ field, value, onChange }) {
	const [open, setOpen] = useState(null)
	const rows = value

	const replace = (index, row) =>
		onChange(rows.map((existing, i) => (i === index ? row : existing)))

	const move = (index, by) => {
		const target = index + by
		if (target < 0 || target >= rows.length) return
		const next = [...rows]
		;[next[index], next[target]] = [next[target], next[index]]
		onChange(next)
		setOpen(target)
	}

	const title = (row, index) =>
		row?.name || row?.title || row?.text || row?.label || row?.role || row?.category ||
		row?.question || row?.degree || `Item ${index + 1}`

	return (
		<div className="space-y-2">
			{rows.length === 0 && (
				<p className="rounded-lg border border-dashed border-edge px-3 py-4 text-center text-xs text-zinc-600">
					Nothing here yet.
				</p>
			)}

			{rows.map((row, index) => (
				<div key={index} className="overflow-hidden rounded-lg border border-edge bg-black/20">
					<div className="flex items-center gap-1 px-3 py-2">
						<button
							type="button"
							className="flex-1 truncate text-left text-sm text-zinc-200 hover:text-white"
							onClick={() => setOpen(open === index ? null : index)}
						>
							<span className="mr-2 text-zinc-600">{open === index ? "-" : "+"}</span>
							{title(row, index)}
						</button>
						<button
							type="button"
							className="btn-ghost px-2 py-1 text-xs"
							onClick={() => move(index, -1)}
							disabled={index === 0}
							title="Move up"
						>
							↑
						</button>
						<button
							type="button"
							className="btn-ghost px-2 py-1 text-xs"
							onClick={() => move(index, 1)}
							disabled={index === rows.length - 1}
							title="Move down"
						>
							↓
						</button>
						<button
							type="button"
							className="btn-ghost px-2 py-1 text-xs text-accent2 hover:bg-accent2/10"
							onClick={() => {
								onChange(rows.filter((_, i) => i !== index))
								setOpen(null)
							}}
							title="Remove"
						>
							×
						</button>
					</div>

					{open === index && (
						<div className="grid gap-3 border-t border-edge px-3 py-3 sm:grid-cols-2">
							{field.item.map((sub) => (
								<div
									key={sub.key}
									className={
										sub.type === "textarea" || sub.type === "tags" || sub.type === "nameTags"
											? "sm:col-span-2 space-y-1"
											: "space-y-1"
									}
								>
									{sub.type !== "boolean" && (
										<label className="text-xs text-zinc-400">{sub.label}</label>
									)}
									<SubField
										sub={sub}
										value={row?.[sub.key]}
										onChange={(next) => replace(index, { ...row, [sub.key]: next })}
									/>
								</div>
							))}
						</div>
					)}
				</div>
			))}

			<button
				type="button"
				className="btn btn-ghost w-full text-sm"
				onClick={() => {
					onChange([...rows, blankRow(field.item)])
					setOpen(rows.length)
				}}
			>
				+ Add {field.label.toLowerCase()}
			</button>
		</div>
	)
}
