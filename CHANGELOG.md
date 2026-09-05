# Changelog

All notable changes to this project are documented in this file.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and
the project follows [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

Releases are tagged `vX.Y.Z` from `main`.

---

## [1.2.0] - 2026-09-06

### ✨ Features

#### Per-section URLs

The form now asks whether the long pages should give each section its own
address, updated as the reader scrolls, so a section can be linked to directly.
Off by default, and it does not change how scrolling behaves.

#### The schema copy is now a command

`npm run sync:schema` copies the portfolio's JSON Schema into `public/`, and
`npm run derive:starter` regenerates the starter from a real `settings.json`.

The README's claim has always been that the form is checked against the same
schema the portfolio builds from, with no second set of rules to drift out of
sync. That was only true for as long as somebody kept copying the files across
by hand, and three drifts had got in. Copying is now a script that reports what
it changed, so the claim is checkable rather than aspirational.

### 🐛 Fixes

Three places where this form disagreed with the portfolio about a file the
portfolio would happily build:

- `navigation.schema.json` was missing entirely, and the root schema did not
  `$ref` it. A `navigation` block went through completely unchecked.
- The technology-name pattern was `^[a-zA-Z0-9._-]+$`, which rejects `C++`,
  `Node.js` with a space either side, and every two-word technology. The
  portfolio's own pattern allows them.
- The projects section was missing the `Computer Vision` category and the
  `tier`, `order` and `packages` fields, so a curated project list written for
  the portfolio failed validation here.

### 📦 Also

- The blank starter now ships `projects.useGitHubDescription: true`. A brand-new
  portfolio has no `.portfolio/project.json` anywhere to read a description out
  of, so the GitHub one is all there is to show.
- `.portfolio/project.json`, so this project describes itself the same way the
  others do.

---

## [1.1.0] - 2026-09-01

### ✨ Features

#### Offline support

The form now works with the network gone, including across a reload — no
browser error page. There is no backend, so once the page and the bundle are
stored there is nothing left for it to need: you can fill the whole thing in on
a train.

- A service worker is generated at build time by `scripts/generate-sw.js` and
  precaches the page, the bundle, the stylesheet and the icons.
- Everything is scoped to `BASE_PATH`. The app is served from
  `/portfolio-creator/`, and a worker registered at the root would be out of
  scope and would quietly control nothing.
- `api.github.com` is never intercepted. It is the one thing that genuinely
  needs a network, and it is left to fail the way the app already handles.
- The cache name carries the package version and a hash of the built files, so
  a new build throws the old cache away.

#### Installable

- A web app manifest, written by `scripts/generate-seo.js` so that `start_url`
  and `scope` carry the base path, plus 192px and 512px icons derived from the
  existing favicon.

---

## [1.0.0] - 2026-09-01

First release.

- A guided form that writes one `settings.json`, validated against the same
  split JSON Schema the portfolio itself uses, so anything the form accepts
  will build.
- Three ways to publish: download the file, let a pasted fine-grained token
  create the repository and turn on Pages, or take the file to another host.
  Hosting notes for GitHub Pages, Cloudflare Pages, Cloudflare Workers,
  Netlify, Vercel and Render are in [docs/hosting.md](docs/hosting.md).
- A starter `settings.json` derived from a real portfolio with the owner
  stripped out — `scripts/derive-starter.js` fails if a single trace survives.
- SEO surfaces written after the build, and a post-build check that stops a
  build which has lost the attribution the licence asks for.
