# 2 Founders — two developers on contract

The 2 Founders site is a static HTML/CSS/JavaScript page with a small Vercel Edge Function. It presents the team as two developers who take products, AI workflows and tools from brief to launch on contract, and shows six projects they shipped.

## The page

A hire-us page for a two-person development team. It proves the offer in the first screen and keeps a coral **thread** drawing itself down the page as you scroll.

1. **Hero:** "We ship what you'd hire a team for." (lime mark on "WE SHIP"). The offer, "Start a project" and "See what we've shipped", one line of true counts, and the **deck**: real screenshots of the six products fanned in browser frames, one in front with its name and status, rotating every few seconds. Click a side card to bring it forward, or the front card to open it below.
2. **Six products we've shipped:** an ink carousel, one product per stop: screenshot, status, the brief, what we built, and a live link. On screens 961px and wider it pins, and scrolling moves it sideways. On smaller screens, or with reduced motion, it's a swipe carousel. Counter, prev/next, a coral progress bar and named rail buttons work in both.
3. **What you can hire us for:** products and web apps, AI editors/agents/workflows, desktop apps and extensions. Each lane links to its examples in the carousel.
4. **How it works:** fixed-scope project, contract or AI workflow tune-up; four steps from brief to handover; a short FAQ.
5. **Contact:** an enquiry form that prepares an email to hello@2founders.space in the visitor's own mail app. Nothing is stored.
6. **Footer:** status, local time, links and the full-width wordmark.

Without JavaScript, the deck is a plain scrollable row, the carousel scrolls natively, and the form falls back to a `mailto:` action.

### Project screenshots

`media/work/<project>-800.webp` and `-1600.webp` are captured from each project's own live page, cropped to show product UI with no personal names and no usage, rating or savings figures. Each file's origin is recorded beside it in `<file>.webp.json` (read it with `impeccable embed-prompt <file> --read`). The AI video editor is private client work, so it shows a line drawing instead.

## Editing

- `index.html`: all copy, the hero deck, the work carousel slides, the private-build line drawing and thread markers.
- `styles.css`: theme tokens (cream `#faf8f4`, ink `#141414`, coral `#e8552c`, lime `#c9f24b`), layout, responsive rules.
- `app.js`: the thread engine, the hero deck, the work carousel (pinned or swipe), drawing ink-in, the IST clock, `?c=` personalisation and the enquiry email.
- `PRODUCT.md` and `.impeccable/`: product facts and design-direction notes used by the Impeccable design skill.

### Moving the thread

The thread is one SVG path through every `<i class="tp" data-tp>` marker, in document order. Each marker is positioned with `--x` / `--y` (percentages of its parent), so the path follows the layout at every width. Add `data-loop="0.3"` to draw a loop around a marker (radius = factor × the parent's font size) and `data-front` to let the thread pass in front of the type there. Markers with `data-wide` (the ones that weave through the hero type) are skipped on phones, where the thread keeps to the right margin. The work stage sits above the thread, so the thread runs underneath the carousel.

## Personalisation

`?c=CompanyName` (or `?company=`) changes the page title, the closing question ("What should we build for CompanyName?") and the email subject. Text only.

## Claims

The page names no founders and repeats no user counts, ratings, accuracy or savings figures from the project sites; the screenshots are cropped to keep it that way. The AI video editor is described from the owner's account and has no link. The hero counts (six shipped, three for clients, one open-source Mac app, 3+ years) are the owner's own facts.

## Local development

Requires Node.js 20.11+.

```sh
npm ci
npm run dev
```

Open `http://127.0.0.1:8000`.

```sh
npm run check
npm test
```

The smoke test needs Chromium or Chrome: it uses `/usr/bin/chromium` when available, otherwise set `CHROMIUM_PATH` (on macOS: `"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"`). It writes `desktop.png` and `mobile.png` to the ignored `test-results/` folder.

## Deployment

Static site on Vercel (Framework Preset: Other, no build command, project root as output). `vercel.json` sets clean URLs and media caching. `/api/geo` is a small Edge Function kept for the dev server and future use; the page no longer depends on it.
