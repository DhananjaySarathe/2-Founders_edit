---
version: 1
slug: "index-html"
primary_target: "index.html"
related_targets: []
---

## Scope

Homepage (`index.html`), the whole site. Visitor mode: Persuade (a founder decides whether to hire this team and sends a brief).

Audience and action: founders and small teams looking to hire developers on contract or by the project. Within seconds they must see that this team ships real products (not service categories), then open the work, then start a project (email hello@2founders.space or the enquiry form). Proof: six shipped projects with live links (one private client project shown by description only). No numbers, testimonials or logos.

Constraints: keep the incumbent palette (cream #faf8f4, ink #141414, coral #e8552c, lime #c9f24b) and the self-hosted Inter / Inter Tight / JetBrains Mono. Founders never named. Static HTML/CSS/JS on Vercel.

Pinned references (owner): dakshgajjar.com for the scroll-drawn thread and giant type, neutomni.com for the small availability details (open-for-projects status, local time, full-width wordmark).

## Direction contract

THESIS: A hire-us page that proves it in the first screen: real screens of six shipped products fanned under the offer, then a pinned carousel where scrolling walks through each product (brief, what we built, live link). One coral thread draws itself down the page and dives under the work. Refuses the services-grid agency page and the abstract portfolio of categories.

OWN-WORLD: Cream paper ground alternating with full-bleed ink fields; ink display type in Inter Tight 800 at poster scale; a 2px coral thread with a ringed tip; browser-framed real screenshots of each product (the private client build shows its hairline line drawing instead); lime only for live/available states, the primary action on ink, and one marker block behind "WE SHIP" in the headline (owner chose it on 2026-11-01; it carries over the incumbent page's lime highlight).

STORY: Two developers for hire. Here are six products they shipped, five of them live. This is what you can hire them for and how it works. Start a project.

FIRST VIEWPORT: Header (wordmark, Work / Services / How it works / Contact, lime-dot "Open for projects" + IST clock, "Start a project"). Headline "We ship what you'd hire a team for." over two lines at ~84% width with the lime block on "WE SHIP"; the thread enters top-left, crosses in front of "SHIP", curls after "FOR." and drops through the gap between offer and buttons. Row: the hire-us offer left, "Start a project" (ink) and "See what we've shipped" right; one line of true counts below. Lower third: the deck, browser-framed screenshots of the six products fanned in an arc, one in front with its name and status, rotating every few seconds.

FORM: Pinned by the owner (Daksh thread + Neutomni details) inside the established 2 Founders world; the roll ran and the owner's pin outranks it. seed:fb443d67f6087081

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Signature interaction and motion

The deck rotates the front product every 3.4s (paused on hover, focus, off-screen and under reduced motion); clicking a side card brings it forward, clicking the front card opens it in the carousel. Shipped work: on screens wider than 960px (motion welcome) the ink stage pins and vertical scroll moves the track one product per stop, with a counter, prev/next, a coral progress bar and named rail buttons; below that, or with reduced motion, it is a native swipe carousel with snap points. The thread runs underneath the work stage.

The thread: one SVG path through anchor points in each section, stroke drawn to the scroll position with a ringed tip riding its end; front-layer crossings over the hero letters; forks into three branches at the capabilities statement. The private build's line drawing and the services fork ink in as they arrive. Reduced motion: thread fully drawn, no scrub.

## Phones

The header keeps the wordmark and "Start a project"; the open-for-projects status and IST clock move to the footer because three items do not fit at 390px. The thread keeps to an inset right rail; the hero markers that weave through type (data-wide) are skipped. The work carousel is a swipe rail where a neighbouring slide shows only its screen.

## Unresolved

WhatsApp and booking links (none yet). Social preview image still shows the old page.
