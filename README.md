# 2 Founders — agentic workflows & AI automation

The 2 Founders marketing site is a static HTML/CSS/JavaScript site with a small Vercel Edge Function for country detection. It introduces two ways to work with the studio: custom automation builds and focused, one-off, recurring, or usage-based services.

The original cream, lime, coral, typography, floating labels, crossed marquees, scroll effects, and video library are retained. The large centred hero reads “You build. We automate.” with a rotating first-line word that now fits its own width, so the line stays tight as the words change.

## The experience

The page is one guided story in six chapters. A new visitor can scroll it, jump between chapters, or take the 60-second tour.

1. **What we do.** The hero says who is behind the studio (two founders) and what they build. Floating task chips tick themselves off while you read. Below, the live workflow board plays like a short film once it is on screen. Each stage carries a small illustrated artifact (an enquiry arriving, details being extracted, an approval click, the finished task and draft). Visitors can switch between business admin, audience research, and creator-engine examples, or click a stage to take over.
2. **Your week.** Visitors tick the repeat work in their own week and set rough hours. A Monday–Friday grid fills in, the totals count up, and “Hand it off” shows the same hours as time handed back. “Turn this into a brief” writes their list into the enquiry form without replacing anything they already typed. Nothing leaves the page unless they send the email.
3. **Who we are.** The founders' story: their own YouTube channel, editing in-house, the creator engine and Liquid Signal, and now building for others. Its centre is the idea from their own pitch video: Speed (AI-powered workflow) + Taste (human judgment), “We combined both.” A scroll-linked path walks through how they got here, followed by four working principles.
4. **What we've built.** Liquid Signal's illustrative side-panel report builds itself as it scrolls into view. The creator engine shows its four steps beside the 48-second editing sample, with more channel videos in a drawer.
5. **Work with us.** The two buying routes, a scroll-driven process board (a playhead moves through brief → scope → build and test → handover while the status label updates), and the FAQ.
6. **Let's talk.** The enquiry form, with what happens after sending spelled out.

A chapter pill (desktop and tablet) shows where the visitor is and opens a jump menu. The tour narrates each chapter, scrolls to it, and starts that chapter's demo. It pauses as soon as the visitor scrolls or clicks a link, and closes with Escape. Reduced-motion preferences stop autoplay, the typewriter effect, and scroll-linked animation, and show finished states instead.

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

- `index.html`: copy, chapters, workflow artifacts (the default ones inline, the other two scenarios in `<template>` elements), the founders' story, FAQ, enquiry options, metadata.
- `styles.css`: shared theme, responsive layouts, motion, and accessibility styles.
- `product.css`: the scoped Liquid Signal product illustration and its play-on-view animation.
- `landing.css`: the centred hero, workflow/proof/service layout, the editing-samples drawer, and responsive spacing.
- `experience.css`: the guided experience: workflow artifacts, hero task chips, the week meter, the founders' story, the process board, the chapter guide, and the tour.
- `app.js`: `CONFIG` contact/video settings, workflow scenarios and autoplay, the week meter's tasks, the tour's six steps, region selection, and email brief preparation.
- `media/fonts/`: locally hosted Latin variable fonts and their OFL licenses.
- `media/social-preview.png`: 1200 × 630 link preview.

The enquiry form prepares a `mailto:` email to `beyondthebuildofficial@gmail.com`; it does not submit or store visitor details. A copy-brief fallback appears after preparation. Reply through the visitor's email app. The direct email link also works without JavaScript.

`CONFIG.whatsapp` (country code, no “+”) and `CONFIG.bookingUrl` are empty by default. Fill either one and a “Message on WhatsApp” or “Book a call” button appears beside the enquiry form. WhatsApp is listed first for visitors in India.

## What the page claims, and what it doesn't

- The workflow board explains steps; it does not execute automation jobs. The default enquiry-to-action workflow is labelled as an illustrative custom build, and its artifacts use sample text.
- Liquid Signal's interface and data are labelled illustrative. Its feature list (own or suggested questions with 2–6 answer choices; answer splits, plain-language summary, purchase intent, barriers, confidence; search, filter, CSV/JSON export) comes from earlier versions of this site.
- The founders' story uses only what this repository shows: the @2Founders channel (Hindi Shorts and English long-form, edited in-house), the editing approach stated in the 48-second pitch video (“AI-powered workflow + Human creativity. We combined both.”), the creator engine, and Liquid Signal. There are no client logos, testimonials, result figures, prices, or timelines.
- The week meter only multiplies the visitor's own numbers (48 working weeks, 40-hour weeks). It does not promise how many hours automation will save.

## Personalization and languages

Existing campaign parameters continue to work:

- `?c=CompanyName` (or `?company=CompanyName`) adds a safe text-only company badge, page title, closing question (“What should we automate for CompanyName?”), tour greeting, and email subject.
- `?r=in` shows the two Hindi Shorts; `?r=global` shows the English long-form example.
- Without an explicit region, the browser timezone sets an initial language and `/api/geo` can refine it.
- Visitors can change the video language beside the examples. A delayed geo response cannot replace a manual choice.

## Production URL

The canonical URL and Open Graph URLs in `index.html` point to `https://2founders.space/`. Update them if you deploy under a different domain.
