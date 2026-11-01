---
name: 2 Founders
description: Two developers on contract; one coral thread runs past the real screens of everything they shipped.
colors:
  cream: "#faf8f4"
  ink: "#141414"
  ink-hover: "#2a2a28"
  muted: "#55524c"
  line: "#e2ddd2"
  coral: "#e8552c"
  coral-ink: "#b83e18"
  lime: "#c9f24b"
  lime-hover: "#b9e534"
  lime-ink: "#3d5200"
  on-ink-muted: "#bcb7ac"
  on-ink-line: "rgba(250, 248, 244, 0.16)"
  field: "#1e1e1c"
  frame-screen: "#ffffff"
  frame-chrome: "#f1eee7"
  frame-dot: "#d8d3c8"
  frame-edge: "rgba(20, 20, 20, 0.14)"
typography:
  display:
    fontFamily: "Inter Tight, Inter, system-ui, sans-serif"
    fontSize: "clamp(2.8rem, 8.1vw, 9.5rem)"
    fontWeight: 800
    lineHeight: 0.9
    letterSpacing: "-0.04em"
  headline-l:
    fontFamily: "Inter Tight, Inter, system-ui, sans-serif"
    fontSize: "clamp(2.8rem, 7.6vw, 7rem)"
    fontWeight: 800
    lineHeight: 0.92
    letterSpacing: "-0.04em"
  headline-m:
    fontFamily: "Inter Tight, Inter, system-ui, sans-serif"
    fontSize: "clamp(2.3rem, 5.4vw, 5rem)"
    fontWeight: 800
    lineHeight: 0.98
    letterSpacing: "-0.04em"
  product-name:
    fontFamily: "Inter Tight, Inter, system-ui, sans-serif"
    fontSize: "clamp(2.2rem, 4.2vw, 4.2rem)"
    fontWeight: 800
    lineHeight: 0.95
    letterSpacing: "-0.04em"
  headline-s:
    fontFamily: "Inter Tight, Inter, system-ui, sans-serif"
    fontSize: "clamp(1.6rem, 2.8vw, 2.3rem)"
    fontWeight: 800
    letterSpacing: "-0.03em"
  title:
    fontFamily: "Inter Tight, Inter, system-ui, sans-serif"
    fontSize: "clamp(1.45rem, 2.4vw, 2rem)"
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: "-0.025em"
  title-s:
    fontFamily: "Inter Tight, Inter, system-ui, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 700
    letterSpacing: "-0.02em"
  lede:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "clamp(1.05rem, 1.4vw, 1.2rem)"
    fontWeight: 400
    lineHeight: 1.6
  body:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "17px"
    fontWeight: 400
    lineHeight: 1.6
  button:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 600
    lineHeight: 1
  label-mono:
    fontFamily: "JetBrains Mono, ui-monospace, monospace"
    fontSize: "0.82rem"
    fontWeight: 500
    fontFeature: "tnum"
  url-mono:
    fontFamily: "JetBrains Mono, ui-monospace, monospace"
    fontSize: "11.5px"
    fontWeight: 500
  wordmark:
    fontFamily: "Inter Tight, Inter, system-ui, sans-serif"
    fontSize: "17.4vw"
    fontWeight: 800
    lineHeight: 0.8
    letterSpacing: "-0.05em"
rounded:
  focus: "4px"
  logo: "10px"
  field: "14px"
  frame: "14px"
  pill: "999px"
  round: "50%"
spacing:
  gutter: "clamp(1rem, 4vw, 3rem)"
  gutter-phone: "1.5rem"
  max: "1280px"
  header: "68px"
  header-phone: "60px"
  column-gap: "clamp(1.5rem, 3vw, 3rem)"
  section-block: "clamp(6rem, 12vw, 10rem)"
  stage-top: "clamp(5rem, 9vw, 7rem)"
  track-gap: "clamp(1.5rem, 4vw, 4rem)"
  deck-card: "clamp(250px, 26vw, 400px)"
  deck-step: "clamp(130px, 16vw, 250px)"
components:
  button-ink:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.cream}"
    typography: "{typography.button}"
    rounded: "{rounded.pill}"
    padding: "0.95rem 1.45rem"
  button-ink-hover:
    backgroundColor: "{colors.ink-hover}"
  button-line:
    textColor: "{colors.ink}"
    typography: "{typography.button}"
    rounded: "{rounded.pill}"
    padding: "0.95rem 1.45rem"
  button-line-hover:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.cream}"
  button-lime:
    backgroundColor: "{colors.lime}"
    textColor: "{colors.ink}"
    typography: "{typography.button}"
    rounded: "{rounded.pill}"
    padding: "0.95rem 1.45rem"
  button-lime-hover:
    backgroundColor: "{colors.lime-hover}"
  button-small:
    rounded: "{rounded.pill}"
    padding: "0.7rem 1.1rem"
  button-round:
    textColor: "{colors.cream}"
    rounded: "{rounded.round}"
    size: "48px"
  button-round-hover:
    backgroundColor: "{colors.lime}"
    textColor: "{colors.ink}"
  logo:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.cream}"
    rounded: "{rounded.logo}"
    padding: "0.55rem 0.8rem 0.6rem"
  status-chip:
    textColor: "{colors.cream}"
    rounded: "{rounded.pill}"
    padding: "0.35rem 0.8rem"
  frame:
    backgroundColor: "{colors.frame-screen}"
    rounded: "{rounded.frame}"
  frame-bar:
    backgroundColor: "{colors.frame-chrome}"
    textColor: "{colors.muted}"
    typography: "{typography.url-mono}"
    height: "30px"
    padding: "0 12px"
  choice-chip:
    textColor: "{colors.cream}"
    rounded: "{rounded.pill}"
    padding: "0.6rem 1rem"
  choice-chip-selected:
    backgroundColor: "{colors.lime}"
    textColor: "{colors.ink}"
  field:
    backgroundColor: "{colors.field}"
    textColor: "{colors.cream}"
    rounded: "{rounded.field}"
    padding: "0.9rem 1rem"
---

# Design System: 2 Founders

## Overview

**Creative North Star: "The Thread Through the Work"**

A cream sheet of paper and two full-bleed ink fields, set in poster-scale Inter Tight, with one 2px coral line drawn down the whole page as the visitor scrolls. The thread enters at the top-left of the hero, passes in front of "SHIP", curls once after "FOR.", drops between the offer and its buttons, and dives under the work stage before running on through the services fork and the hiring steps to the contact heading. The work itself is shown, not diagrammed: real screenshots of each shipped product sit inside quiet browser frames, the only objects on the page that lift off the paper. A private client build keeps its hairline line drawing in the same frame, so the absence of a screenshot reads as discretion rather than a gap.

Density is low and the page moves in two gestures. In the hero, a fan of six framed screens rotates one product to the front at a time. In the ink work stage, scrolling walks through the products one per stop, each a screenshot beside its name, status, brief and what was built. Everything after that is plain lists separated by rules, never boxed. Small "studio is open" details (a pinging lime status dot, a live IST clock in mono, a full-width wordmark at the foot) make the two-person team feel present without naming anyone.

The palette is the owner's pinned incumbent theme and is committed: cream, ink, coral, lime, self-hosted Inter / Inter Tight / JetBrains Mono.

**Key Characteristics:**
- One continuous coral thread with a ringed tip, drawn to scroll position.
- Poster-scale uppercase Inter Tight 800 with tight negative tracking in the hero; sentence case elsewhere.
- Real product screenshots in browser frames; the frame is the only lifted surface.
- Cream paper with two full-bleed ink fields (work stage, contact); lists use rules, not cards.
- Lime is rare and means "live, available, act here".

## Colors

A warm paper-and-ink pair carrying two loud accents, each with a single job, plus a neutral browser-chrome set that belongs to the screenshot frame only.

### Primary
- **Thread Coral** (#e8552c): the thread and its ringed tip, the services fork, the work rail's progress line and its current-project dot, the ring around each step numeral, the separators in the hero counts row, the edge of a hovered deck frame, focus outlines and the text caret. It marks a path, a position or a sequence; it is a line colour first.
- **Deep Coral** (#b83e18): coral as readable text on cream: the "Like ..." proof lines under each service and the step numerals.

### Secondary
- **Signal Lime** (#c9f24b): live and available states (status dot, the pip on a live product's status chip, selected enquiry chip), the action pill on ink, the hover fill of the round carousel buttons, the email underline, text selection, the underscore in the logo, and the single marker block behind "WE SHIP".
- **Pressed Lime** (#b9e534): lime pill hover.
- **Lime Ink** (#3d5200): outline and ping ring of the status dot, so the lime dot holds its edge on cream.

### Neutral
- **Paper Cream** (#faf8f4): page ground, header ground, text on ink, the private-build frame ground, the fill inside the thread-tip ring.
- **Press Ink** (#141414): body and display type on cream; the ground of the work stage and contact; ink pills, the outline pill's ring and the logo block.
- **Raised Ink** (#2a2a28): ink pill hover.
- **Pencil Grey** (#55524c): secondary text on cream (offer, ledes, list copy, deck captions, frame URL text, copyright).
- **Rule Beige** (#e2ddd2): hairline rules on cream (FAQ rows, scrolled header edge).
- **Ash** (#bcb7ac): secondary text on ink (subhead, counter, brief labels, rail names, product meta); the pip of a product that is not publicly live.
- **Ink Hairline** (rgba(250, 248, 244, 0.16)): rules, rail track, chip, status-chip, round-button and field borders on ink.
- **Well** (#1e1e1c): enquiry field ground on ink.
- **Frame Screen** (#ffffff), **Frame Chrome** (#f1eee7), **Frame Dot** (#d8d3c8), **Frame Edge** (rgba(20, 20, 20, 0.14)): the browser frame's screen, title bar, three window dots and 1px edge. They exist only inside the frame.

### Named Rules
**The One Thread Rule.** Coral draws exactly one continuous path per page (plus the fork branches it splits into). Elsewhere coral appears only as small marks of position or sequence: the rail progress line and its dot, step rings, count separators, a hovered frame edge. It is never a section background, a button fill or a decorative swash.

**The Lime Means Live Rule.** Lime marks something live, available or selected, or the action to take on an ink field. The block behind "WE SHIP" is the one highlight in the headline, chosen by the owner; it is not a reusable heading treatment.

## Typography

**Display Font:** Inter Tight (with Inter, system-ui)
**Body Font:** Inter (with system-ui)
**Label/Mono Font:** JetBrains Mono (with ui-monospace)

**Character:** Inter Tight at 800 with -0.04em tracking does the shouting; Inter at 17px does the explaining in plain sentences; JetBrains Mono prints what a machine would print.

### Hierarchy
- **Display** (800, clamp(2.8rem, 8.1vw, 9.5rem), 0.9, uppercase): the hero headline only, two lines. On phones clamp(2.5rem, 12.6vw, 5rem) at 0.92.
- **Headline L** (800, clamp(2.8rem, 7.6vw, 7rem), 0.92): the contact question.
- **Headline M** (800, clamp(2.3rem, 5.4vw, 5rem), 0.98): section statements (work, services, how it works), capped near 13em where a lede follows.
- **Product Name** (800, clamp(2.2rem, 4.2vw, 4.2rem), 0.95, sentence case): one per work slide.
- **Headline S** (800, clamp(1.6rem, 2.8vw, 2.3rem), -0.03em): the FAQ heading.
- **Title** (700, clamp(1.45rem, 2.4vw, 2rem), 1.1): heads of the three ways to hire; the services fork uses a smaller step (clamp(1.3rem, 2vw, 1.6rem), 1.15).
- **Title S** (700, 1.25rem): step heads. Deck captions use Inter Tight 700 at 1.1rem.
- **Lede** (Inter 400, clamp(1.05rem, 1.4vw, 1.2rem)): first paragraph under a headline and the hero offer (46ch), in muted grey.
- **Body** (Inter 400, 17px, 1.6; 16px on phones): copy at 36-64ch. Brief labels in slides are Inter at 0.85rem in Ash.
- **Label Mono** (JetBrains Mono 500, 0.82rem, tabular figures): the IST clock; the work counter uses 0.95rem. Frame URLs use **URL Mono** (500, 11.5px). Drawing labels are mono 500 at 15px in drawing units, 19.5px on phones.
- **Wordmark** (800, 17.4vw, 0.8, uppercase): the footer "2 Founders", edge to edge, once.

### Named Rules
**The Poster Case Rule.** Uppercase belongs to the hero headline and the wordmark. Section statements, product names, titles and copy stay in sentence case.

**The Mono Is Machinery Rule.** JetBrains Mono appears only where a machine would print: the clock, the slide counter, browser URL bars and labels inside drawings. It is never a heading or a label above one.

## Layout

A single centred column (max 1280px) inside a fluid gutter (clamp(1rem, 4vw, 3rem); 1.5rem on phones), with full-bleed bands for the work stage and contact. The header is fixed at 68px (60px on phones), cream, gaining a beige hairline once scrolled.

The hero is headline, then a row with the offer left and the two pills right, then the counts row, then the deck: a stage roughly 0.66 card-heights plus 150px tall where six frames (card width clamp(250px, 26vw, 400px)) fan from one centre. Positions -2 to 2 step sideways by clamp(130px, 16vw, 250px) and 1.85 steps, rotate 0, ±6 and ±12 degrees, drop 0, 22 and 70px and scale 1, 0.9 and 0.8; the sixth card waits hidden behind. The deck may overflow the page edges and is clipped, never scrolled.

The work stage is a header row (statement and subhead left; counter and round buttons right), a track of slides (each about 86% wide, max 1180px, a 7:5 grid of screenshot and info with the info's neighbour hidden), and a rail of six names under a 2px progress line. From 961px with motion welcome the section is 100svh plus 70svh per further product tall and the stage sticks for its whole length; slides fill the width less clamp(4rem, 9vw, 9rem) so the next one peeks in on the right. Otherwise the track is a native horizontal scroller with mandatory snap that bleeds to the right page edge.

Services is a statement over a three-way fork into three ruled columns. How it works is three ruled columns, four numbered steps, then an FAQ capped at 820px. Contact is a 6:5 split, copy and form. Major sections pad clamp(6rem, 12vw, 10rem).

Responsive: at 960px and below grids collapse to one column, the hero row stacks, the header status moves to the footer, steps go two-up and the rail hides. At 640px and below the nav hides, steps and lists stack, the fork lines hide, the deck tightens (card 62vw, step 21vw), slides take 88% and the thread moves to a right-margin rail.

## Elevation & Depth

Paper is flat; screens lift. Cream and ink fields, rules and pills never carry a shadow. The browser frame is the single exception, because it stands for a real screen laid on the page. Further depth comes from the thread's layers: a back path under the type, the type, and a front path masked to small circles where it crosses in front of letters. The work stage sits above both thread layers, so the thread runs underneath the work.

### Shadow Vocabulary
- **Frame on paper** (`box-shadow: 0 2px 4px rgba(20, 20, 20, 0.08), 0 24px 48px -18px rgba(20, 20, 20, 0.35)`): every browser frame on cream, including the hero deck.
- **Frame on ink** (`box-shadow: 0 30px 60px -24px rgba(0, 0, 0, 0.6)`): browser frames inside the work stage, with the edge lightened to rgba(250, 248, 244, 0.12).

### Named Rules
**The Only Screens Lift Rule.** A soft shadow belongs to a browser frame holding a product screen and to nothing else. Pills, chips, rows and sections respond to hover with a 2px rise, a fill or a colour shift, never a shadow. The outline pill's 1.5px inset ring is a border, not elevation.

## Shapes

Pills (999px) for every action, choice and status chip; full circles for the round carousel buttons, step rings and status dots; 14px corners for both form fields and browser frames; a 10px block for the logo; 4px on focus outlines. Containers have no radius and no border: lists are separated by top rules (1px ink in the services fork, 2px ink in the ways list, beige hairlines between FAQ rows, Ink Hairline above slide meta). The frame's title bar is 30px with three 9px dots. Line drawings use rounded caps and joins with small corner radii (3-8px in drawing units).

## Components

### Buttons
Confident, pill-shaped, lifted only by motion.
- **Shape:** full pill (999px), Inter 600 at 1rem, 0.95rem by 1.45rem, trailing 18px stroked arrow; header variant 0.7rem by 1.1rem at 0.92rem.
- **Ink:** the primary action on cream, including the header's and the hero's "Start a project".
- **Outline:** the secondary action on cream ("See what we've shipped"): transparent with a 1.5px ink ring; fills ink with cream text on hover.
- **Lime:** the action on ink (each live product's link) and the enquiry submit (full width there).
- **Hover / Focus:** rise 2px over 0.2s on the house ease, the trailing arrow nudges 2px along its direction; focus is a 3px coral outline offset 4px.
- **Round:** 48px circles with an Ink Hairline border and a 20px chevron for previous and next on the work stage; hover fills lime with ink chevron; disabled drops to 35% opacity.
- **Text link:** Inter 600, underlined at 1px with 0.22em offset, beside a pill for a secondary destination.

### Chips
- **Status chip:** a pill on ink with an Ink Hairline border, 0.35rem by 0.8rem at 0.88rem, led by an 8px pip: lime when the product is publicly live, Ash when it is private.
- **Choice chips:** enquiry choices as pills with an Ink Hairline border, 0.6rem by 1rem; hover brightens the border to Ash; selected fills lime with ink text; focus draws the coral outline on the pill.

### Inputs / Fields
- **Style:** Well ground, Ink Hairline border, 14px radius, 0.9rem by 1rem.
- **Focus:** border turns lime, no outline glow.
- **Error:** border and message switch to a light coral-orange for legibility on ink; the message sits under the field.

### Navigation
Logo block left (ink, 10px radius, lime underscore), four plain text links that underline on hover, then the status line (pinging lime dot, "Open for projects", mono IST clock) and the small ink pill. The footer repeats the status line and links above the full-width wordmark.

### Browser Frame (signature)
A white screen under a 30px Frame Chrome title bar with three Frame Dot circles and the product name and kind in URL Mono, inside a 14px-radius frame with a 1px Frame Edge and the paper shadow. The screen is 16:10, filled top-aligned with a real screenshot of the shipped product served at 800w and 1600w. A private build swaps the screenshot for its hairline drawing on a cream screen. Every screenshot ships with a provenance record of its origin beside it.

### Shipped Deck
Six frames fanned in an arc under the hero, front card captioned only (Inter Tight name plus muted status, fading in 0.35s after it arrives). Every 3.4s the next product rotates to the front over 0.9s; rotation pauses on hover, focus, off-screen and under reduced motion. Clicking a side card brings it forward; clicking the front card opens that product in the work stage. A hovered or focused frame takes a coral edge. Without JavaScript the deck is a plain sideways row, all captioned.

### Work Stage (signature)
The ink field that holds the work. Each slide pairs a framed screenshot with the product name, its status chip, a two-term "The brief" / "What we built" list, a meta line over an Ink Hairline rule, and one lime pill plus optional text link (or a private-build note). The counter (mono, current number in cream), round buttons, arrow keys and named rail buttons all move one product per stop; the rail's coral line fills by scaleX with progress and the current name gains a 7px coral dot. Slides that are not current hide their info so a peeking neighbour shows only its screen. Service proof links and deck cards open the stage at a specific product.

### The Thread (signature)
One SVG path, 2.2px coral, round caps, built through every `[data-tp]` marker in document order with a centripetal Catmull-Rom spline. Markers are positioned by CSS, so the path follows the layout at every width and is rebuilt on resize and font load. `data-loop` adds a cursive curl around a marker (radius as a fraction of the parent font size, kept inside the page); `data-front` lets the thread pass in front of the type there; `data-wide` markers are skipped on phones. The tip is a 9px cream ring with a coral stroke and a 3.5px coral dot. The drawn length tracks the point where the path reaches 72% down the viewport, eased in at 0.16 per frame after a 1.6s exponential intro. At the services statement a three-branch coral fork inks in beneath it. On phones loops and front crossings are skipped and the thread holds an inset right rail. With reduced motion the thread is drawn in full and does not scrub.

### Steps and FAQ
Steps are numbered by counter inside 2.5rem circles with a 1.5px coral ring and Deep Coral Inter Tight numerals, each over a Title S head and muted copy. The FAQ is native details/summary rows between beige hairlines; the marker is a drawn plus of two 14px by 2px ink bars whose vertical bar rotates flat into a minus when open, over 0.25s.

### Line Drawings
Hairline diagrams (1.4px strokes, round caps, coral reserved for the one hot element, mono labels) used where a screen cannot be shown. Strokes ink in over 1.3s with a 45ms stagger when 15% inside the viewport, labels fade in after 0.4s; with reduced motion they render complete.

## Do's and Don'ts

### Do:
- **Do** route new sections through the thread by adding `[data-tp]` markers in the gutter or margin, marking type-weaving markers `data-wide` so phones keep the margin rail.
- **Do** keep coral as a line or a small mark of position and sequence, and use Deep Coral (#b83e18) when coral must be read as text on cream.
- **Do** show each new shipped product as a real screenshot in the browser frame, with its origin recorded beside the file, and add it to both the deck and the work stage.
- **Do** use the hairline drawing in the frame when a build is private, and say plainly that the screens stay with the client.
- **Do** use the ink pill for the primary action and the outline pill for the secondary on cream; the lime pill on ink.
- **Do** separate list items with rules, not boxes.
- **Do** honour reduced motion: thread fully drawn, deck still, work stage as a native scroller, drawings complete, no pings.

### Don't:
- **Don't** add a second coral line, coral fills or coral backgrounds.
- **Don't** use lime as decoration; it signals live, selected or "act here". Don't repeat the "WE SHIP" marker block on other headings.
- **Don't** put a shadow on anything but a browser frame, and don't box copy into cards or bordered panels.
- **Don't** use stock photography, mockups or invented UI; every image is the product's own screen or its line drawing.
- **Don't** caption the side cards of the deck; only the front card speaks.
- **Don't** set headings in JetBrains Mono, or put small labels above headings.
