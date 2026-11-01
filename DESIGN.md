---
name: 2 Founders
description: Two developers on contract; one coral thread runs through everything they shipped.
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
typography:
  display:
    fontFamily: "Inter Tight, Inter, system-ui, sans-serif"
    fontSize: "clamp(3rem, 10.6vw, 12.5rem)"
    fontWeight: 800
    lineHeight: 0.9
    letterSpacing: "-0.04em"
  giant:
    fontFamily: "Inter Tight, Inter, system-ui, sans-serif"
    fontSize: "clamp(2.6rem, calc(100cqi / (var(--n) * 0.64)), 15rem)"
    fontWeight: 800
    lineHeight: 0.86
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
  title:
    fontFamily: "Inter Tight, Inter, system-ui, sans-serif"
    fontSize: "clamp(1.45rem, 2.4vw, 2rem)"
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: "-0.025em"
  pitch:
    fontFamily: "Inter Tight, Inter, system-ui, sans-serif"
    fontSize: "clamp(1.3rem, 2vw, 1.65rem)"
    fontWeight: 600
    lineHeight: 1.28
    letterSpacing: "-0.015em"
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
  pill: "999px"
spacing:
  gutter: "clamp(1rem, 4vw, 3rem)"
  gutter-phone: "1.5rem"
  max: "1280px"
  header: "68px"
  header-phone: "60px"
  column-gap: "clamp(1.5rem, 3vw, 3rem)"
  chapter-gap: "clamp(2rem, 5vw, 5rem)"
  chapter-block: "clamp(5rem, 11vw, 9rem)"
  section-block: "clamp(6rem, 12vw, 10rem)"
components:
  button-lime:
    backgroundColor: "{colors.lime}"
    textColor: "{colors.ink}"
    typography: "{typography.button}"
    rounded: "{rounded.pill}"
    padding: "0.95rem 1.45rem"
  button-lime-hover:
    backgroundColor: "{colors.lime-hover}"
  button-ink:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.cream}"
    typography: "{typography.button}"
    rounded: "{rounded.pill}"
    padding: "0.95rem 1.45rem"
  button-ink-hover:
    backgroundColor: "{colors.ink-hover}"
  button-small:
    rounded: "{rounded.pill}"
    padding: "0.7rem 1.1rem"
  logo:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.cream}"
    rounded: "{rounded.logo}"
    padding: "0.55rem 0.8rem 0.6rem"
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

A cream sheet of paper and full-bleed ink fields, set in poster-scale Inter Tight, with one 2px coral line drawn down the whole page as the visitor scrolls. The thread enters at the top-left of the hero, crosses in front of and behind the headline letters, curls once around the last word, then runs through every shipped project in turn, down the gutter between copy and drawing, until it lands under the contact heading. Everything else stays quiet so the line can lead: no cards, no shadows, no imagery beyond hairline line drawings that ink themselves in when their chapter arrives.

Density is editorial and low. Each project is a chapter with a giant uppercase title fitted to the container width, a short pitch, a two-row facts ledger, one action, and one drawing. Chapters alternate cream and ink so the scroll reads as a rhythm of pages. Small "studio is open" details (a pinging lime status dot, a live IST clock in mono, a full-width wordmark at the foot) make the two-person team feel present without naming anyone.

The palette is the owner's pinned incumbent theme and is committed: cream, ink, coral, lime, self-hosted Inter / Inter Tight / JetBrains Mono.

**Key Characteristics:**
- One continuous coral thread with a ringed tip, drawn to scroll position.
- Poster-scale uppercase Inter Tight 800 with tight negative tracking.
- Hairline (1.3px) ink line drawings with mono labels, inked in on view.
- Cream and ink fields alternate full-bleed; no cards, no shadows.
- Lime is rare and means "live, available, act here".

## Colors

A warm paper-and-ink pair carrying two loud accents, each with a single job.

### Primary
- **Thread Coral** (#e8552c): the thread, the fork branches, the "hot" stroke inside drawings, the follow-cue arrow, focus outlines and the text caret. It is a line colour first; its only filled shape is the 3.5px dot inside the thread's tip.
- **Deep Coral** (#b83e18): coral used as text on cream (the proof lines under each capability, highlighted labels in cream-chapter drawings), where Thread Coral would be too light to read.

### Secondary
- **Signal Lime** (#c9f24b): live and available states (status dot, selected enquiry chip), the action pill on ink fields, the submit button, the email underline, text selection, the underscore in the logo, and the single marker block behind "A TEAM".
- **Pressed Lime** (#b9e534): lime pill hover.
- **Lime Ink** (#3d5200): the outline and ping ring of the status dot, so the lime dot holds its edge on cream.

### Neutral
- **Paper Cream** (#faf8f4): page ground, header ground, text on ink fields, the fill inside the thread-tip ring.
- **Press Ink** (#141414): body text and display type on cream; the ground of alternate chapters, the contact section, ink pills and the logo block.
- **Raised Ink** (#2a2a28): ink pill hover.
- **Pencil Grey** (#55524c): secondary text on cream (offer, ledes, chapter copy, fact labels, copyright).
- **Rule Beige** (#e2ddd2): hairline rules on cream (facts ledger, scrolled header edge).
- **Ash** (#bcb7ac): secondary text on ink.
- **Ink Hairline** (rgba(250, 248, 244, 0.16)): rules and chip/field borders on ink.
- **Well** (#1e1e1c): enquiry field ground on ink.

### Named Rules
**The One Thread Rule.** Coral draws exactly one continuous path per page (plus the fork branches it splits into). It is never a section background, a button fill or a decorative swash elsewhere.

**The Lime Means Live Rule.** Lime marks something that is live, available, selected, or the action to take on an ink field. The marker block behind "A TEAM" is the one carried-over highlight; it is not a reusable heading treatment.

## Typography

**Display Font:** Inter Tight (with Inter, system-ui)
**Body Font:** Inter (with system-ui)
**Label/Mono Font:** JetBrains Mono (with ui-monospace)

**Character:** Inter Tight at 800 with -0.04em tracking does the shouting at poster scale; Inter at 17px does the explaining in plain sentences; JetBrains Mono is reserved for machine-ish details (the IST clock, labels inside drawings).

### Hierarchy
- **Display** (800, clamp(3rem, 10.6vw, 12.5rem), 0.9, uppercase): the hero headline only, three lines filling roughly 85% of the width. On phones clamp(2.6rem, 14.2vw, 5rem) at 0.92.
- **Giant** (800, fitted to the container by character count `--n`, 0.86, uppercase, no wrap): one per project chapter, the project's name.
- **Headline L** (800, clamp(2.8rem, 7.6vw, 7rem), 0.92): the contact question.
- **Headline M** (800, clamp(2.3rem, 5.4vw, 5rem), 0.98): section statements, capped near 13em.
- **Title** (700, clamp(1.45rem, 2.4vw, 2rem), 1.1): column heads in the three-up lists; the capability fork uses a smaller step (clamp(1.3rem, 2vw, 1.6rem), 1.15).
- **Pitch** (Inter Tight 600, clamp(1.3rem, 2vw, 1.65rem), 1.28): the opening sentence of each chapter, max 30ch; the closing promise uses a larger step (clamp(1.4rem, 2.6vw, 2.2rem)).
- **Body** (Inter 400, 17px, 1.6; 16px on phones): copy at 36-58ch.
- **Lede** (Inter 400, clamp(1.05rem, 1.4vw, 1.2rem)): first paragraph under a headline, in muted grey.
- **Label Mono** (JetBrains Mono 500, 0.82rem, tabular figures): clock and status time. Drawing labels are mono 500 at 14px in drawing units, raised to 19.5px on phones so they render at 11px or more.
- **Wordmark** (800, 17.4vw, 0.8, uppercase): the footer "2 Founders", edge to edge, once.

### Named Rules
**The Poster Case Rule.** Uppercase belongs to the hero, the chapter giants and the wordmark. Section statements, titles and copy stay in sentence case.

**The Mono Is Machinery Rule.** JetBrains Mono appears only where a machine would print: times and labels inside drawings. It is never a heading or a label above one.

## Layout

A single centred column (max 1280px) inside a fluid gutter (clamp(1rem, 4vw, 3rem); 1.5rem on phones), with full-bleed bands for ink chapters and contact. The header is fixed at 68px (60px on phones), cream, gaining a beige hairline once scrolled.

The hero fills the viewport: headline at top, offer and "Follow the thread" cue pinned to the bottom row. Each project chapter is a giant title over a 5:7 grid (copy left, drawing right) with a fluid gap; the thread runs down the middle of that gap. Three-up lists (capabilities, ways to work) use equal columns with top rules instead of boxes. Contact is a 6:5 split, copy and form.

Vertical rhythm is generous and fluid: chapters pad clamp(5rem, 11vw, 9rem); major sections clamp(6rem, 12vw, 10rem).

Responsive: at 960px and below grids collapse to one column and the header nav hides. At 640px and below three-up lists stack, the facts ledger stacks label over value, the header keeps only logo and "Start a project" (status and clock live in the footer), drawings bleed to the left page edge, and the thread moves to a right-margin rail.

## Elevation & Depth

Flat. There are no box shadows anywhere. Depth comes from two things only: the alternation of cream and ink fields, and the thread's three layers (a back path under the type, the type itself, and a front path masked to small circles at each crossing point so the line passes in front of the letters there).

### Named Rules
**The Paper Rule.** Surfaces never lift. Hover is a 2px translate on pills, a colour shift on borders, or an underline; never a shadow.

## Shapes

Pills (999px) for every action and choice; softly rounded wells (14px) for form fields; a 10px block for the logo; 4px on focus outlines. Containers have no radius and no border: lists are separated by top rules (1px in the capability fork, 2px ink in the ways list) and ledgers by hairlines. Line drawings use rounded caps and joins with small corner radii on screens and keys (3-12px in drawing units).

## Components

### Buttons
Confident, pill-shaped, lifted only by motion.
- **Shape:** full pill (999px), Inter 600 at 1rem, 0.95rem by 1.45rem; header variant 0.7rem by 1.1rem at 0.92rem.
- **Lime:** the action on ink fields and the enquiry submit (full width there).
- **Ink:** the action on cream fields, including the header's "Start a project".
- **Hover / Focus:** rise 2px over 0.2s on the house ease, background deepens (Pressed Lime / Raised Ink), the trailing arrow nudges up-right 2px; focus is a 3px coral outline offset 4px.
- **Text link:** Inter 600, underlined at 1px with 0.22em offset, beside the pill for a secondary destination.

### Chips
- **Style:** enquiry choices as pills with an Ink Hairline border, 0.6rem by 1rem, on the ink contact field.
- **State:** hover brightens the border to Ash; selected fills lime with ink text; keyboard focus draws the coral outline on the pill.

### Inputs / Fields
- **Style:** Well ground, Ink Hairline border, 14px radius, 0.9rem by 1rem.
- **Focus:** border turns lime, no outline glow.
- **Error:** border and message switch to a light coral-orange for legibility on ink; the message sits under the field.

### Navigation
Logo block left (ink, 10px radius, lime underscore), three plain text links that underline on hover, then the status line (pinging lime dot, "Open for projects", mono IST clock) and the ink pill. The footer repeats the status line and links above the full-width wordmark.

### Project Chapter
Giant title, then copy (pitch, one or two paragraphs, a two-row facts ledger, one pill plus optional text link) beside a hairline drawing. Ink chapters invert text to cream and Ash and swap ledger rules to Ink Hairline.

### The Thread (signature)
One SVG path, 2.2px coral, round caps, built through every `[data-tp]` marker in document order with a centripetal Catmull-Rom spline (no overshoot where markers are uneven). Markers are positioned by CSS, so the path follows the layout at every width and is rebuilt on resize and font load. `data-loop` adds a cursive curl around a marker (radius as a fraction of the parent font size, kept inside the page); `data-front` lets the thread pass in front of the type there. The tip is a 9px cream ring with a coral stroke and a 3.5px coral dot, riding the end of the drawn length. The drawn length tracks the point where the path reaches 72% down the viewport, eased in at 0.16 per frame after a 1.6s exponential intro. At the capability statement a separate three-branch coral fork inks in beneath it. Under 640px loops and front crossings are skipped and the thread holds an inset right rail, swooping in only to the giant titles. With reduced motion the thread is drawn in full and does not scrub.

### Line Drawings (signature)
One per project: an inline SVG diagram of what the product does, 1.3px ink (cream on ink fields) strokes with round caps, coral reserved for the one "hot" element or path, dashed strokes for implied links, mono labels. On arrival each stroke inks in over 1.3s with a 45ms stagger and labels fade in after 0.4s; with reduced motion they render complete.

## Do's and Don'ts

### Do:
- **Do** route new sections through the thread by adding `[data-tp]` markers in the gutter or margin, so the single coral path keeps running.
- **Do** keep coral as a line (2.2px thread, hot strokes) and use Deep Coral (#b83e18) when coral must be read as text on cream.
- **Do** give each new shipped project a chapter: giant uppercase name, pitch, facts ledger, one action, one hairline drawing; alternate cream and ink.
- **Do** use the lime pill on ink fields and the ink pill on cream fields.
- **Do** separate list items with top rules, not boxes.
- **Do** honour reduced motion: thread fully drawn, drawings complete, no pings or nudges.

### Don't:
- **Don't** add a second coral line, coral fills or coral backgrounds.
- **Don't** use lime as decoration; it signals live, selected or "act here". Don't repeat the "A TEAM" marker block on other headings.
- **Don't** add drop shadows, cards or bordered panels.
- **Don't** use photography or stock imagery for project chapters; the drawing is the image.
- **Don't** set headings in JetBrains Mono, or put small labels above headings.
