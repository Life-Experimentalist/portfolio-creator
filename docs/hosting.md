# Where to put it

The portfolio builds to a folder of static files. Every host below can serve
that, so the choice is not about capability — it is about what annoys you least
on the day something breaks.

Short version: **use GitHub Pages** unless you have a specific reason not to.
The workflow is already in the repository, the source and the site live in the
same place, and there is no third party to lose access to. Reach for Cloudflare
when you want the edge network or headers you control; reach for Netlify or
Vercel when you want previews on every pull request.

---

## GitHub Pages

The default, and what the publish step sets up for you.

**Good**

- Already wired up. `.github/workflows/deploy.yml` builds and deploys on every
  push to `main`; nothing else to sign up for.
- The site and its source are the same repository, so there is exactly one
  place to look when something is wrong.
- Free custom domains with automatic HTTPS.
- Naming the repository `yourname.github.io` puts the site at the root of your
  github.io address instead of in a subfolder.

**Bad**

- Public repositories only, unless you pay for GitHub Pro.
- Build minutes come out of your Actions quota. Generous, but not infinite.
- No control over response headers, so no custom caching, no CSP, no
  redirects beyond the SPA 404 trick.
- A soft ~1 GB site limit and a ~10 builds/hour rate limit. Neither will
  trouble a portfolio.

**Custom domain:** add a `CNAME` file with your domain, point a `CNAME` record
at `yourname.github.io`, tick "Enforce HTTPS" once the certificate issues.

---

## Cloudflare Pages

**Good**

- Fast almost everywhere, without thinking about regions.
- Unlimited bandwidth, and 500 builds a month on the free plan.
- Preview deployments for every branch.
- `_headers` and `_redirects` files give you real control over caching and
  routing — the thing Pages cannot do.
- If your domain is already on Cloudflare, DNS is one click.

**Bad**

- Another account, another dashboard, another place to check.
- Build settings are configured in their UI rather than in your repository, so
  the deploy config is not in version control with everything else.
- Cloudflare has been steering new work toward Workers; Pages is stable but no
  longer the thing they are excited about.

**Settings:** build command `npm run build`, output directory `dist`,
`SITE_URL` set to your final address.

---

## Cloudflare Workers (static assets)

The same network, with a Worker in front of the files.

**Good**

- Everything Pages gives you, plus the ability to run code on the request —
  redirects, geolocation, an API route, a headers policy that varies by path.
- This is where a real "Sign in with GitHub" button would live. A browser
  cannot complete an OAuth exchange with github.com on its own (the token
  endpoint sends no CORS headers), but a Worker doing the swap server-side can,
  and it is about thirty lines.

**Bad**

- More moving parts than a portfolio needs. You now have a `wrangler.toml`, a
  deploy step and a runtime that can have bugs.
- CPU time limits per request, which matter not at all for static files and
  quite a lot the moment you start doing real work in the Worker.

Worth it if you want the OAuth flow or a custom API. Otherwise it is Pages with
extra homework.

---

## Netlify

**Good**

- The nicest first-run experience of any of them: connect the repository and it
  guesses the build correctly.
- Deploy previews on pull requests, with a comment on the PR.
- Redirects, headers, forms and serverless functions, all configured from a
  `netlify.toml` that lives in your repository.
- Instant rollback to any previous deploy.

**Bad**

- 100 GB bandwidth and 300 build minutes a month on the free tier. Fine for a
  portfolio; the overage pricing has surprised people running something
  larger.
- Their free tier has been trimmed more than once.

---

## Vercel

**Good**

- Fast builds, good analytics, previews on every push.
- Excellent custom-domain handling.

**Bad**

- The free plan is for non-commercial use. A portfolio advertising your
  freelance availability is a grey area that is entirely their call to make,
  not yours.
- Vercel is built around Next.js. A plain Vite build works fine, but you are
  not the customer the product is designed for.

---

## Render

**Good**

- Free static sites, unlimited bandwidth, a genuinely simple dashboard.
- Good if you are already running a backend there and want one bill.

**Bad**

- Slower builds than the others.
- A smaller CDN footprint, so noticeably slower from some parts of the world.
- Static hosting is a side product; their attention is on services and
  databases.

---

## Choosing, quickly

| You want | Use |
|---|---|
| The fewest decisions | GitHub Pages |
| Custom headers, caching, redirects | Cloudflare Pages |
| An OAuth callback or an API route | Cloudflare Workers |
| Previews on every pull request | Netlify |
| A backend already running somewhere | Render |
| A `.dev` domain and nothing unusual | any of them |

Your `settings.json` is identical on all of them. Moving hosts later means
re-pointing DNS and changing `seo.canonical` — not rebuilding anything.

---

## One thing to get right wherever you land

`seo.canonical` must be the address the site actually answers on. The build
writes absolute URLs into `sitemap.xml`, `llms.txt` and `/api/*.json` from that
value, so if it is wrong, every machine-readable copy of your portfolio points
somewhere that does not exist — which is the exact opposite of the point.
