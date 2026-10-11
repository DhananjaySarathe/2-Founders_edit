# 2 Founders — agentic workflows & AI automation

The 2 Founders marketing site is a static HTML/CSS/JavaScript site with a small Vercel Edge Function for country detection. It introduces two ways to work with the studio: custom automation builds and focused, one-off, recurring, or usage-based services.

The original cream, lime, coral, typography, floating labels, crossed marquees, scroll effects, and video library are retained. A fixed headline states the AI automation offer; the original rotating animation lives in a supporting accent. The first screen shows the two engagement routes and an illustrative business workflow. Shipped-work links, substantial capability cards, contrasting service sections, Liquid Signal, and the creator engine explain what the studio delivers.

The second design pass draws on [200 primary website reviews](docs/research/README.md). Research covers offers, calls to action, section order, buying models, and evidence; it does not claim visual inspection or measured conversion gains.

## Local development

Requires Node.js 20.11+ (the development server uses `import.meta.dirname`).

```sh
npm ci
npm run dev
```

Open `http://127.0.0.1:8000`. Use `PORT=3000 npm run dev` for another port.

```sh
npm run check
npm test
```

The browser smoke check needs Chromium. It uses `/usr/bin/chromium` when available; otherwise set `CHROMIUM_PATH` to your installed Chromium/Chrome executable. `TEST_BASE_URL` can point the checks at another local server. Test output is saved in the ignored `test-results/` directory. External YouTube requests are intercepted in the smoke test, so it verifies embed wiring rather than third-party playback.

## Deployment

Deploy the repository as a static site on Vercel with **Framework Preset: Other**, no build command, and the project root as the output directory. `vercel.json` specifies these settings, clean URLs, and media caching. The `/api/geo` Edge Function reads the country from Vercel's request header and returns a non-cached response. No app backend, API keys, or environment variables are needed for the marketing site.

The local `scripts/serve.mjs` server is a development/test tool; Vercel serves the site directly. The CSS, JavaScript, local fonts, sample MP4, and product illustration ship as static assets. Optional YouTube thumbnails and click-to-load embeds come from YouTube. Native video controls and direct YouTube links remain available.

## Editing content and contact details

- `index.html`: copy, sections, Liquid Signal link, FAQ, enquiry options, metadata.
- `styles.css`: shared theme, responsive layouts, motion, and accessibility styles.
- `product.css`: the scoped Liquid Signal product illustration.
- `landing.css`: the automation-first hero, capability cards, section hierarchy, and responsive proof placement, using the shared theme variables.
- `app.js`: `CONFIG` contact/video settings, workflow walkthroughs, region selection, and email brief preparation.
- `media/fonts/`: locally hosted Latin variable fonts and their OFL licenses.
- `media/social-preview.png`: 1200 × 630 link preview.

The enquiry form prepares a `mailto:` email to `beyondthebuildofficial@gmail.com`; it does not submit or store visitor details. A copy-brief fallback appears after preparation. Reply through the visitor's email app. The direct email link also works without JavaScript.

The workflow board explains steps; it does not execute automation jobs. The default enquiry-to-action workflow and broader custom-build cards are explicitly examples. Liquid Signal's sample interface/data are labeled. Existing videos show the studio's editing work. The creator engine and focused services are described separately from the Chrome extension. Capability links can prepare a starter brief when the visitor has not already written one.

## Personalization and languages

Existing campaign parameters continue to work:

- `?c=CompanyName` (or `?company=CompanyName`) adds a safe text-only company badge and page title.
- `?r=in` shows the two Hindi Shorts; `?r=global` shows the English long-form example.
- Without an explicit region, the browser timezone sets an initial language and `/api/geo` can refine it.
- Visitors can change the video language beside the examples. A delayed geo response cannot replace a manual choice.

## Production URL

The canonical URL and Open Graph URLs in `index.html` point to `https://2founders.space/`. Update them if you deploy under a different domain.
