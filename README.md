# 2 Founders — two developers on contract

The 2 Founders site is a static HTML/CSS/JavaScript page with a small Vercel Edge Function. It presents the team as two developers who take products, AI workflows and tools from brief to launch on contract, and shows six projects they shipped.

## The page

One scroll, held together by a coral **thread** that draws itself as you read. It enters at the top, weaves in front of and behind the hero headline, forks into the three kinds of work, then runs through each project's giant name and down the gap between its story and its line drawing, ending at the email address.

1. **Hero:** "We ship what you'd hire a team for." with the open-for-projects status and India time in the header.
2. **Brief:** what the team does, forking into products and web apps, AI editors/agents/workflows, and desktop apps and extensions.
3. **Work:** Framecast, the AI video editor (private client work, no link), ExpenseWaale, StockTax Pro, Liquid Signal, and the n8n assistant agent. Each chapter has a one-line pitch, two facts, a live link where one exists, and an authored line drawing that inks in on view.
4. **How we work:** fixed-scope project, contract, or AI workflow tune-up, and the promise that scope, price and timeline are agreed first.
5. **Contact:** an enquiry form that prepares an email to hello@2founders.space in the visitor's own mail app. Nothing is submitted or stored.
6. **Footer:** status, links and the full-width wordmark.

Reduced motion shows the whole thread and every drawing at once. Without JavaScript the content is fully readable and the form falls back to a plain `mailto:` action.

## Editing

- `index.html`: all copy, project chapters, line drawings (inline SVG) and thread markers.
- `styles.css`: theme tokens (cream `#faf8f4`, ink `#141414`, coral `#e8552c`, lime `#c9f24b`), layout, responsive rules.
- `app.js`: the thread engine, drawing ink-in, IST clock, `?c=` personalisation and the enquiry email.
- `PRODUCT.md` and `.impeccable/`: product facts and design-direction notes used by the Impeccable design skill.

### Moving the thread

The thread is one SVG path through every `<i class="tp" data-tp>` marker, in document order. Each marker is positioned with `--x` / `--y` (percentages of its parent), so the path follows the layout at every width. Add `data-loop="0.3"` to draw a loop around a marker (radius = factor × the parent's font size) and `data-front` to let the thread pass in front of the type there. On phones loops and front crossings are skipped and the thread keeps to the right margin.

## Personalisation

`?c=CompanyName` (or `?company=`) changes the page title, the closing question ("What should we build for CompanyName?") and the email subject. Text only.

## Claims

The page names no founders and repeats no user counts, ratings, accuracy or savings figures from the project sites. The AI video editor is described from the owner's account and has no link. Line drawings are illustrations, not screenshots.

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
