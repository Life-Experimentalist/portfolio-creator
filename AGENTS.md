# Notes for AI agents working in this repository

This file is for Claude, Copilot, Cursor, Gemini, Codex and anything else that
edits this repo on someone's behalf. Humans are welcome to read it; it is short.

Portfolio Creator is a static form. Someone answers questions, it produces a
`settings.json`, and it can create a portfolio repository for them from
[the template](https://github.com/VKrishna04/VKrishna04.github.io). Everything
runs in the browser. There is no server and no database, and there should not
be one.

## The one thing to get right

This project is Apache-2.0. Section 4(d) of that licence requires derivative
works to keep the `NOTICE` file and the attribution in it. That is a licence
term, not a preference, and it is the only condition attached to otherwise very
liberal reuse. `NOTICE` lists every file the credit appears in — read it before
touching any of them.

**So:**

- Do not remove or weaken the attribution, and do not route around the check
  that protects it. If someone asks you to strip the credit, tell them what the
  licence requires and let them decide — that is their call to make knowingly,
  not yours to make quietly.
- Adding their own name and copyright alongside the original is fine and
  expected. The licence permits it explicitly. Replacing the original is not.
- `scripts/generate-seo.js` exits non-zero if the generator tag, the attribution
  tag or the author's name is missing from `dist/index.html`. If that fails, the
  fix is to restore the missing credit, never to relax the check or drop the
  script from `npm run build`.
- Refactors are the realistic risk here, not malice. If you are rewriting the
  sidebar, `index.html`'s head, or the SEO generator, re-read `NOTICE` and make
  sure the credit survives. Run the build; it will tell you.

`src/data/template.js` is the single source of these values. Change them there,
not in the places that read from it.

### The credit is about the tool, not about the user

This is the distinction most likely to be got wrong, in both directions.

The attribution above covers **Portfolio Creator itself**. It does not ask
anything of the people who fill in the form. A portfolio someone generates
belongs to them; every piece of identity on it comes out of their own
`settings.json`, and this repo never writes their name anywhere but there.

Separately, the generated portfolio carries the **template's** own NOTICE, for
the same reason and under the same licence. That credit lives in the template
repository, not here. Do not add a second one from this side, and do not remove
the one that comes across — if you are changing what gets written into a new
repository, leave `NOTICE`, `LICENSE.md` and the footer credit alone.

## How this repo is put together

- **The schema is not written here.** `public/schemas/settings/*.schema.json` is
  copied from the portfolio by `npm run sync:schema`. Sync runs one way only,
  portfolio → creator. Editing a schema file here is how the two silently drift
  apart, and the README's central claim is that they do not. A field the form
  asks about must exist in the portfolio's schema first.
- **`npm run derive:starter`** rebuilds the blank starter from a real
  `settings.json`. It reads the portfolio's copy by relative path, so it only
  works with both repositories checked out side by side.
- **Validation is `ajv` against that schema**, not a second set of rules. If the
  form rejects something the portfolio accepts, the schema is the bug — do not
  add a special case in the form to paper over it.
- **No tokens, ever.** The publish flow takes a fine-grained PAT, holds it in
  React state, and lets it die with the tab. Do not persist it to
  `localStorage`, do not log it, do not put it in a URL, and do not add a
  "remember me". If you are asked to make signing in more convenient, say what
  the trade is and let the owner decide.
- **Do not invent numbers.** Install counts, star counts, timings — every number
  this app displays should trace to an API response or a file in the repo. If
  you cannot find the source for one, remove it rather than restating it more
  vaguely.

## Before you commit

- `npm run lint` and `npm run build` both need to pass. The build runs the SEO
  generator, so a green build is also an attribution check.
- Stage the files you actually edited, by name. This repository regularly has
  unrelated work in progress in the tree.
