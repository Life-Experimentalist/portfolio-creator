import js from "@eslint/js"
import globals from "globals"
import reactHooks from "eslint-plugin-react-hooks"
import reactRefresh from "eslint-plugin-react-refresh"

export default [
	// sw-template.js carries __PLACEHOLDER__ tokens that generate-sw.js fills in
	// at build time, so it cannot parse as a normal module until then.
	{ ignores: ["dist", "node_modules", "scripts/sw-template.js"] },
	{
		files: ["**/*.{js,jsx}"],
		languageOptions: {
			ecmaVersion: 2022,
			globals: { ...globals.browser, ...globals.node },
			parserOptions: {
				ecmaFeatures: { jsx: true },
				sourceType: "module",
			},
		},
		plugins: {
			"react-hooks": reactHooks,
			"react-refresh": reactRefresh,
		},
		rules: {
			...js.configs.recommended.rules,
			...reactHooks.configs.recommended.rules,
			"react-refresh/only-export-components": [
				"warn",
				{ allowConstantExport: true },
			],
			"no-unused-vars": ["error", { varsIgnorePattern: "^[A-Z_]" }],
		},
	},
]
