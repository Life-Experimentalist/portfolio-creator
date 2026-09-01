/**
 * What this tool builds on, and who wrote it.
 *
 * TEMPLATE names the portfolio repository a generated site is created from.
 * CREDIT is the project attribution, which is required by that repository's
 * NOTICE under Apache License 2.0 section 4(d) and travels with anything built
 * from it. It is deliberately about the *project*, not about whoever is
 * filling in the form - their name goes in settings.json like every other
 * answer, and this file never mentions them.
 */

export const TEMPLATE = Object.freeze({
	owner: "VKrishna04",
	repo: "VKrishna04.github.io",
	url: "https://github.com/VKrishna04/VKrishna04.github.io",
	demo: "https://vkrishna04.me",
})

export const CREDIT = Object.freeze({
	author: "Krishna GSVV",
	github: "https://github.com/VKrishna04",
	repository: "https://github.com/Life-Experimentalist/portfolio-creator",
	license: "Apache-2.0",
	credit: "Designed & built by Krishna GSVV",
})

/**
 * Sister projects a portfolio can switch on. Each is optional, each is a
 * couple of fields in the form, and each is somebody else's server doing work
 * this site would otherwise have to do itself.
 */
export const INTEGRATIONS = [
	{
		name: "CodeLedger",
		enabledPath: "codeLedger.enabled",
		url: "https://github.com/Life-Experimentalist/CodeLedger",
		blurb:
			"Pulls your DSA practice numbers from LeetCode, Codeforces, CodeChef and friends into a /stats page - solved counts, streaks, activity over time.",
	},
	{
		name: "CounterAPI",
		enabledPath: "counterAPI.enabled",
		url: "https://counterapi.dev",
		blurb:
			"A visitor counter for the footer. Free, no account, and it does not follow anyone around the internet.",
	},
]
