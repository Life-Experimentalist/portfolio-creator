/**
 * The form, as data.
 *
 * Every field names a dotted path into the settings object; nothing here knows
 * how to render itself. Adding a question to the form means adding an entry to
 * this file, and the schema decides whether the answer is acceptable.
 *
 * Field types:
 *   text | textarea | url | email | number | boolean | select
 *   tags      - array of strings, edited one per line
 *   nameTags  - array of {name}, for the places the schema wants objects
 *   list      - array of objects, each described by `item`
 */

export const STEPS = [
	{
		id: "github",
		title: "GitHub",
		blurb:
			"Where your projects come from. The portfolio reads this account's public repositories on every build, so new work shows up without you editing anything.",
		fields: [
			{
				path: "github.type",
				label: "Account type",
				type: "select",
				options: ["user", "org"],
				help: "Pick 'org' if your repositories live under an organisation.",
			},
			{
				path: "github.username",
				label: "Username or organisation",
				type: "text",
				placeholder: "octocat",
				required: true,
				help: "Used for the repository list, the avatar, and the API URL below.",
			},
			{
				path: "github.userAgent",
				label: "User agent",
				type: "text",
				placeholder: "Portfolio",
				help: "GitHub asks every caller to identify itself. Letters, numbers, dot, dash, underscore.",
			},
			{
				path: "github.apiUrl",
				label: "API URL",
				type: "text",
				derived: "githubApiUrl",
				help: "Built from the two fields above.",
			},
		],
	},

	{
		id: "home",
		title: "Home page",
		blurb:
			"The first screen. A greeting, your name, one paragraph, and the rotating line underneath.",
		fields: [
			{
				path: "home.greeting",
				label: "Greeting",
				type: "text",
				placeholder: "Hi There! I'm",
			},
			{
				path: "home.name",
				label: "Your name",
				type: "text",
				required: true,
				placeholder: "Ada Lovelace",
			},
			{
				path: "home.description",
				label: "One-paragraph introduction",
				type: "textarea",
				required: true,
				placeholder:
					"What you build, what you are good at, what you are looking for.",
				help: "At least 50 characters. This also becomes your meta description if you leave the SEO one blank.",
			},
			{
				path: "home.typewriterStrings",
				label: "Rotating lines",
				type: "tags",
				placeholder: "Full Stack Developer\nOpen Source Maintainer",
				help: "One per line. They cycle under your name.",
			},
			{ path: "home.location.show", label: "Show your location", type: "boolean" },
			{
				path: "home.location.text",
				label: "Location line",
				type: "text",
				placeholder: "Berlin, Germany - open to remote",
			},
			{ path: "home.location.city", label: "City", type: "text", placeholder: "Berlin" },
			{
				path: "home.location.country",
				label: "Country",
				type: "text",
				placeholder: "Germany",
			},
			{
				path: "home.profileImage.type",
				label: "Profile image source",
				type: "select",
				options: ["github", "custom", "display"],
				help: "'github' uses your avatar and needs nothing else.",
			},
			{
				path: "home.profileImage.customUrl",
				label: "Custom image URL",
				type: "url",
				showIf: ["home.profileImage.type", "custom"],
			},
			{
				path: "home.profileImage.altText",
				label: "Image alt text",
				type: "text",
				placeholder: "Ada Lovelace",
			},
			{
				path: "home.buttons",
				label: "Call-to-action buttons",
				type: "list",
				item: [
					{ key: "text", label: "Label", type: "text", placeholder: "About Me" },
					{ key: "link", label: "Link", type: "text", placeholder: "/about" },
					{
						key: "type",
						label: "Style",
						type: "select",
						options: ["solid", "outline", "ghost"],
					},
					{ key: "icon", label: "Icon", type: "text", placeholder: "FaUser" },
				],
			},
			{
				path: "home.copyData.enabled",
				label: "Show the copy-for-an-AI button",
				type: "boolean",
				help: "Puts a button on the home page that copies your whole portfolio as text, ready to paste into a chat.",
			},
			{
				path: "home.copyData.format",
				label: "Copy format",
				type: "select",
				options: ["markdown", "text", "json"],
				help: "Markdown reads best when someone pastes it and asks for a resume.",
			},
		],
	},

	{
		id: "about",
		title: "About",
		blurb:
			"The longer version: your story, what you are good at, and what you have done.",
		fields: [
			{ path: "about.heading", label: "Page heading", type: "text", placeholder: "About Me" },
			{
				path: "about.subheading",
				label: "Subheading",
				type: "text",
				placeholder: "The story behind the code",
			},
			{
				path: "about.title",
				label: "Opening line",
				type: "text",
				placeholder: "Mathematician, and the first programmer",
			},
			{
				path: "about.paragraphs",
				label: "Paragraphs",
				type: "tags",
				placeholder: "One paragraph per line.",
				help: "Each line becomes its own paragraph.",
			},
			{
				path: "about.skills",
				label: "Skill groups",
				type: "list",
				item: [
					{
						key: "category",
						label: "Group",
						type: "text",
						placeholder: "Programming Languages",
					},
					{ key: "icon", label: "Icon", type: "text", placeholder: "HiCodeBracket" },
					{
						key: "items",
						label: "Skills",
						type: "nameTags",
						placeholder: "Python\nTypeScript\nRust",
					},
				],
			},
			{
				path: "about.stats",
				label: "Numbers worth showing",
				type: "list",
				item: [
					{ key: "number", label: "Value", type: "text", placeholder: "25+" },
					{
						key: "label",
						label: "Label",
						type: "text",
						placeholder: "Open Source Projects",
					},
				],
			},
			{
				path: "about.image.altText",
				label: "About-page image alt text",
				type: "text",
				placeholder: "Ada Lovelace at a desk",
			},
			{ path: "about.achievements.show", label: "Show achievements", type: "boolean" },
			{
				path: "about.achievements.items",
				label: "Achievements",
				type: "list",
				item: [
					{
						key: "title",
						label: "Title",
						type: "text",
						placeholder: "Hackathon - 1st place",
					},
					{
						key: "subtitle",
						label: "Where and when",
						type: "text",
						placeholder: "Some Company - Berlin - Mar 2025",
					},
					{ key: "description", label: "What happened", type: "textarea" },
				],
			},
		],
	},

	{
		id: "projects",
		title: "Projects",
		blurb:
			"Repositories come from GitHub automatically. This step decides which ones, in what order, and whether you want to hand-write any.",
		fields: [
			{
				path: "projects.mode",
				label: "Source",
				type: "select",
				options: ["github", "static", "hybrid"],
				help: "'hybrid' shows your repositories plus anything you add by hand below.",
			},
			{
				path: "projects.devUsername",
				label: "Display username",
				type: "text",
				placeholder: "octocat",
			},
			{
				path: "projects.officialName",
				label: "Display name",
				type: "text",
				placeholder: "Ada Lovelace",
			},
			{
				path: "projects.useGitHubDescription",
				label: "Use each repository's own description",
				type: "boolean",
			},
			{ path: "projects.maxProjects", label: "Maximum shown", type: "number" },
			{
				path: "projects.sortBy",
				label: "Sort by",
				type: "select",
				options: ["updated", "created", "pushed", "stars", "name"],
			},
			{
				path: "projects.sortOrder",
				label: "Order",
				type: "select",
				options: ["desc", "asc"],
			},
			{ path: "projects.showForks", label: "Include forks", type: "boolean" },
			{
				path: "projects.ignore",
				label: "Repositories to hide",
				type: "tags",
				placeholder: "dotfiles\nscratch-notes",
				help: "One name per line. The repository picker fills this for you.",
			},
			{
				path: "projects.staticProjects",
				label: "Hand-written projects",
				type: "list",
				item: [
					{ key: "id", label: "ID", type: "text", placeholder: "1" },
					{ key: "name", label: "Name", type: "text" },
					{ key: "description", label: "Description", type: "textarea" },
					{ key: "technologies", label: "Technologies", type: "tags" },
					{ key: "category", label: "Category", type: "text", placeholder: "Web" },
					{
						key: "status",
						label: "Status",
						type: "select",
						options: ["completed", "in-progress", "planned", "archived"],
					},
					{ key: "featured", label: "Featured", type: "boolean" },
					{ key: "githubUrl", label: "Repository URL", type: "url" },
					{ key: "liveUrl", label: "Live URL", type: "url" },
				],
			},
		],
	},

	{
		id: "resume",
		title: "Resume",
		blurb:
			"Everything here is also published as machine-readable JSON, so an AI asked to write a resume from your URL has something real to read.",
		fields: [
			{
				path: "resume.type",
				label: "Resume file",
				type: "select",
				options: ["local", "external", "none"],
			},
			{ path: "resume.url", label: "URL or path", type: "text", placeholder: "/resume.pdf" },
			{
				path: "resume.filename",
				label: "Download filename",
				type: "text",
				placeholder: "Ada_Lovelace_Resume.pdf",
			},
			{
				path: "resume.experiences",
				label: "Experience",
				type: "list",
				item: [
					{ key: "title", label: "Role", type: "text", placeholder: "Software Engineer" },
					{ key: "company", label: "Company", type: "text" },
					{
						key: "period",
						label: "Period",
						type: "text",
						placeholder: "Jul 2024 - Present",
					},
					{ key: "location", label: "Location", type: "text" },
					{
						key: "description",
						label: "What you did",
						type: "tags",
						placeholder: "One bullet per line.",
					},
				],
			},
			{
				path: "resume.education",
				label: "Education",
				type: "list",
				item: [
					{
						key: "degree",
						label: "Degree",
						type: "text",
						placeholder: "Bachelor of Technology",
					},
					{ key: "field", label: "Field", type: "text", placeholder: "Computer Science" },
					{ key: "school", label: "Institution", type: "text" },
					{ key: "period", label: "Period", type: "text", placeholder: "2022 - 2026" },
					{ key: "gpa", label: "Grade", type: "text", placeholder: "8.55/10" },
					{ key: "achievements", label: "Highlights", type: "tags" },
				],
			},
			{
				path: "resume.volunteerExperience",
				label: "Volunteering",
				type: "list",
				item: [
					{ key: "role", label: "Role", type: "text", placeholder: "Class Advisor" },
					{ key: "organization", label: "Organisation", type: "text" },
					{ key: "period", label: "Period", type: "text", placeholder: "2022 - Present" },
					{ key: "description", label: "What you did", type: "tags" },
				],
			},
			{
				path: "resume.awards",
				label: "Awards",
				type: "list",
				item: [
					{ key: "name", label: "Award", type: "text" },
					{ key: "organization", label: "Awarded by", type: "text" },
					{ key: "date", label: "Date", type: "text", placeholder: "2025" },
					{ key: "description", label: "Description", type: "textarea" },
					{ key: "verificationUrl", label: "Proof link", type: "url" },
				],
			},
			{
				path: "resume.certifications",
				label: "Certifications",
				type: "list",
				item: [
					{ key: "name", label: "Certificate", type: "text" },
					{ key: "issuer", label: "Issuer", type: "text" },
					{ key: "date", label: "Date", type: "text" },
					{ key: "credentialUrl", label: "Credential URL", type: "url" },
				],
			},
			{
				path: "resume.publications",
				label: "Publications",
				type: "list",
				item: [
					{ key: "title", label: "Title", type: "text" },
					{ key: "publisher", label: "Publisher", type: "text" },
					{ key: "date", label: "Date", type: "text" },
					{ key: "url", label: "Link", type: "url" },
				],
			},
		],
	},

	{
		id: "social",
		title: "Social",
		blurb:
			"One row per profile. Each can appear on the home page, in the footer, on the contact page, or nowhere.",
		fields: [
			{
				path: "social.contact.email",
				label: "Email",
				type: "email",
				placeholder: "you@example.com",
			},
			{ path: "social.contact.phone", label: "Phone", type: "text" },
			{
				path: "social.contact.location",
				label: "Location",
				type: "text",
				placeholder: "Berlin, Germany",
			},
			{
				path: "social.platforms",
				label: "Profiles",
				type: "list",
				item: [
					{ key: "name", label: "Name", type: "text", placeholder: "GitHub" },
					{ key: "key", label: "Key", type: "text", placeholder: "github" },
					{
						key: "url",
						label: "URL",
						type: "url",
						placeholder: "https://github.com/octocat",
					},
					{ key: "icon", label: "Icon", type: "text", placeholder: "FaGithub" },
					{ key: "brandColor", label: "Colour", type: "text", placeholder: "#ffffff" },
					{ key: "enabled", label: "Enabled", type: "boolean" },
					{ key: "showInHome", label: "Home", type: "boolean" },
					{ key: "showInFooter", label: "Footer", type: "boolean" },
					{ key: "showInContact", label: "Contact", type: "boolean" },
				],
			},
		],
	},

	{
		id: "contact",
		title: "Contact",
		blurb:
			"What people see when they want to reach you, including whether you are currently available.",
		fields: [
			{ path: "contact.title", label: "Heading", type: "text", placeholder: "Let's Connect" },
			{ path: "contact.subtitle", label: "Subheading", type: "textarea" },
			{
				path: "contact.timeZone",
				label: "Time zone",
				type: "text",
				placeholder: "Europe/Berlin",
				help: "An IANA name. Drives the local-time indicator.",
			},
			{
				path: "contact.timeFormat",
				label: "Clock",
				type: "select",
				options: ["12-hour", "24-hour"],
			},
			{ path: "contact.status.show", label: "Show an availability badge", type: "boolean" },
			{ path: "contact.status.available", label: "Currently available", type: "boolean" },
			{
				path: "contact.status.message",
				label: "Availability message",
				type: "text",
				placeholder: "Open to internships and freelance work",
			},
			{
				path: "contact.responseInfo.timeframe",
				label: "Typical response time",
				type: "text",
				placeholder: "Within 24 hours",
			},
			{
				path: "contact.responseInfo.workingHours",
				label: "Working hours",
				type: "text",
				placeholder: "Mon-Fri, 09:00-18:00",
			},
			{
				path: "contact.collaborationInterests",
				label: "Open to",
				type: "tags",
				placeholder: "Open source\nHackathons\nFreelance",
			},
			{
				path: "contact.faq",
				label: "Questions people ask",
				type: "list",
				item: [
					{ key: "question", label: "Question", type: "text" },
					{ key: "answer", label: "Answer", type: "textarea" },
				],
			},
			{
				path: "contact.currentFocus.title",
				label: "What you are working on now",
				type: "text",
				placeholder: "Currently focused on",
			},
			{
				path: "contact.currentFocus.description",
				label: "Current focus, in a sentence",
				type: "textarea",
			},
			{
				path: "contact.quickActions.title",
				label: "Quick-actions heading",
				type: "text",
				placeholder: "Quick Actions",
			},
			{
				path: "contact.quickActions.actions",
				label: "Quick actions",
				type: "list",
				item: [
					{ key: "label", label: "Label", type: "text", placeholder: "Email me" },
					{ key: "url", label: "Link", type: "text", placeholder: "mailto:you@example.com" },
					{ key: "icon", label: "Icon", type: "text", placeholder: "FaEnvelope" },
				],
			},
			{
				path: "contact.calendly",
				label: "Calendly link",
				type: "url",
				placeholder: "https://calendly.com/you/30min",
			},
		],
	},

	{
		id: "seo",
		title: "SEO and AI",
		blurb:
			"How search engines and language models see the site. The portfolio publishes llms.txt, humans.txt and JSON endpoints from these answers - that is what makes 'give an AI my URL and ask for a resume' work.",
		fields: [
			{
				path: "seo.title",
				label: "Page title",
				type: "text",
				required: true,
				placeholder: "Ada Lovelace - Software Engineer",
			},
			{
				path: "seo.description",
				label: "Meta description",
				type: "textarea",
				required: true,
				help: "At least 50 characters. This is the line under your name in search results.",
			},
			{ path: "seo.author", label: "Author", type: "text", required: true },
			{
				path: "seo.keywords",
				label: "Keywords",
				type: "tags",
				placeholder: "software engineer\nopen source\npython",
			},
			{
				path: "seo.canonical",
				label: "Canonical URL",
				type: "url",
				required: true,
				placeholder: "https://ada.example/",
				help: "Where the site will actually live. Everything machine-readable is written as an absolute URL from this.",
			},
			{
				path: "seo.customDomain",
				label: "Custom domain",
				type: "text",
				placeholder: "ada.example",
				help: "Hostname only, no scheme. Leave blank if you are on a github.io address.",
			},
			{ path: "seo.openGraph.title", label: "Share-card title", type: "text" },
			{ path: "seo.openGraph.description", label: "Share-card description", type: "textarea" },
			{
				path: "seo.openGraph.image",
				label: "Share-card image URL",
				type: "url",
				placeholder: "https://ada.example/social.jpg",
			},
			{
				path: "seo.openGraph.siteName",
				label: "Site name",
				type: "text",
				placeholder: "Ada Lovelace Portfolio",
			},
			{
				path: "seo.twitter.creator",
				label: "X / Twitter handle",
				type: "text",
				placeholder: "@ada",
				help: "Must start with @. Leave blank if you have none.",
			},
			{
				path: "seo.twitter.title",
				label: "X / Twitter card title",
				type: "text",
				derived: "ogTitle",
				help: "Follows the share-card title unless you change it.",
			},
			{
				path: "seo.twitter.description",
				label: "X / Twitter card description",
				type: "textarea",
				derived: "ogDescription",
			},
			{
				path: "seo.twitter.image",
				label: "X / Twitter card image",
				type: "url",
				derived: "ogImage",
			},
			{
				path: "seo.structuredData.jobTitle",
				label: "Job title",
				type: "text",
				placeholder: "Software Engineer",
			},
			{
				path: "seo.structuredData.worksFor",
				label: "Works for",
				type: "text",
				placeholder: "Independent",
			},
			{ path: "seo.structuredData.knowsAbout", label: "Areas of expertise", type: "tags" },
			{
				path: "seo.structuredData.sameAs",
				label: "Profile URLs",
				type: "tags",
				placeholder: "https://github.com/ada\nhttps://linkedin.com/in/ada",
			},
			{
				path: "seo.crawling.search",
				label: "Allow search engines",
				type: "boolean",
				help: "Off writes Disallow: / into robots.txt.",
			},
			{
				path: "seo.crawling.aiTraining",
				label: "Allow AI crawlers",
				type: "boolean",
				help: "Off names GPTBot, ClaudeBot, PerplexityBot and the rest individually in robots.txt.",
			},
			{
				path: "seo.crawling.aiData",
				label: "Publish machine-readable data",
				type: "boolean",
				help: "Writes llms.txt and /api/*.json. This is what an AI reads when someone hands it your URL.",
			},
		],
	},

	{
		id: "look",
		title: "Look and footer",
		blurb: "The navbar, the footer, and the small pieces that make it yours.",
		fields: [
			{
				path: "navbar.logo.type",
				label: "Logo",
				type: "select",
				options: ["text", "image", "github"],
			},
			{
				path: "navbar.logo.text",
				label: "Logo text",
				type: "text",
				placeholder: "AL",
				showIf: ["navbar.logo.type", "text"],
			},
			{ path: "navbar.logo.name", label: "Name beside the logo", type: "text" },
			{ path: "navbar.logo.showName", label: "Show the name", type: "boolean" },
			{
				path: "navbar.logo.githubUsername",
				label: "GitHub avatar username",
				type: "text",
				showIf: ["navbar.logo.type", "github"],
			},
			{
				path: "navbar.logo.customImageUrl",
				label: "Logo image URL",
				type: "url",
				showIf: ["navbar.logo.type", "image"],
			},
			{
				path: "navigation.sectionAnchors.enabled",
				label: "Per-section URLs",
				type: "boolean",
				help: "Gives each section of the long pages — about, resume, contact — its own address, updated as the reader scrolls, so a section can be linked to directly. Scrolling itself is untouched: this does not snap the wheel to one section per gesture.",
			},
			{ path: "footer.copyright.name", label: "Copyright name", type: "text" },
			{ path: "footer.copyright.showYear", label: "Show the year", type: "boolean" },
			{ path: "footer.about.show", label: "Footer about block", type: "boolean" },
			{ path: "footer.about.title", label: "Footer about title", type: "text" },
			{ path: "footer.about.description", label: "Footer about text", type: "textarea" },
			{ path: "footer.stats.show", label: "Footer statistics", type: "boolean" },
			{ path: "counterAPI.enabled", label: "Visitor counter", type: "boolean" },
			{
				path: "counterAPI.namespace",
				label: "Counter namespace",
				type: "text",
				showIf: ["counterAPI.enabled", true],
			},
			{
				path: "codeLedger.enabled",
				label: "CodeLedger coding statistics",
				type: "boolean",
				help: "Pulls DSA practice statistics from LeetCode, Codeforces and friends into a /stats page.",
			},
			{
				path: "codeLedger.username",
				label: "CodeLedger username",
				type: "text",
				showIf: ["codeLedger.enabled", true],
			},
		],
	},
]

/** Every path the form asks the user about, for the completion percentage. */
export const TRACKED_PATHS = STEPS.flatMap((step) =>
	step.fields.filter((f) => !f.derived).map((f) => f.path)
)

/** Every path the form knows about at all, derived ones included. */
export const ALL_PATHS = STEPS.flatMap((step) => step.fields.map((f) => f.path))

/**
 * Fields the app fills in rather than asking twice. Keyed by the `derived`
 * name on the field; each takes the whole settings object and returns a value,
 * or undefined to leave whatever the user typed alone.
 */
export const DERIVATIONS = {
	githubApiUrl: (s) => {
		const kind = s?.github?.type === "org" ? "orgs" : "users"
		const user = s?.github?.username
		return user ? `https://api.github.com/${kind}/${user}/repos` : undefined
	},
	ogTitle: (s) => s?.seo?.openGraph?.title || s?.seo?.title || undefined,
	ogDescription: (s) =>
		s?.seo?.openGraph?.description || s?.seo?.description || undefined,
	ogImage: (s) => s?.seo?.openGraph?.image || undefined,
}
