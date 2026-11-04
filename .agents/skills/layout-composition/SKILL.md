---
name: layout-composition
description: Composition and reading-flow principles for slicing any page — white space as a deliberate, deterministic layout tool rather than incidental leftover space; F-Pattern and Z-Pattern reading flows and when each applies; Gestalt's Law of Continuity (alignment consistency, and when a well-known convention like a centered form header legitimately overrides it); Symmetry versus Asymmetry for balancing a layout's visual weight; and the Rule of Thirds for compositional placement versus when a functional UI correctly favors dead-center predictability instead. Use when placing a page's macro sections, choosing text/element alignment, deciding whether a layout should mirror itself or intentionally not, or judging where the eye should land first on a new page.
---

# Layout Composition

Five ways to reason about where things sit on a page and why the eye moves the way it does. All five are illustrated with a real audit of this app's login page — a full-bleed photo hero next to a form card — including one case where the "textbook correct" answer was overruled by a stronger, already-covered principle (Jakob's Law), and one real bug the whitespace principle caught.

## White Space Must Be Deterministic, Not Incidental

Negative space comes in two scales: **micro** (padding inside a control, line-height, the gap between a label and its input — mostly already covered by the density tokens in `linear-style-slicing` and `visual-hierarchy-scale`) and **macro** (the gap between whole sections of a page). This section is about macro space specifically: a gap that only _looks_ correct in one screenshot, because it depends on something outside the layout's own flow, is not actually designed — it is incidental.

**The concrete bug this caught**: `LoginHeroPanel.svelte`'s copyright line used to be `position: fixed; bottom: 6; left: 6` — anchored to the _viewport_, completely decoupled from the hero content's own flow above it. In a tall viewport the gap looked fine; on a shorter one (a smaller laptop, browser chrome eating into the viewport, a different zoom level) that fixed footer had no relationship to how tall the content above it actually was, so the "whitespace" between them could shrink to nothing or the footer could sit awkwardly close to the stats card. Fixed twice, in two stages:

1. First pass: `fixed bottom-6 left-6` → `mt-auto pt-6`, keeping the footer inside `LoginHeroPanel`'s own flex column so the gap became relative to that column's content instead of the viewport.
2. Second pass (once the copyright was recognized as page-level content, not hero-panel decoration — see the F/Z-Pattern section below for why that reclassification mattered): moved out of `LoginHeroPanel` entirely into a real `<footer>` element in `LoginPage.svelte`, as a sibling of the centered content row inside a `flex min-h-screen flex-col` `<main>`. The gap from the content above (`pt-4`) is now a fixed, deterministic value regardless of viewport height, and the footer is no longer tied to whichever component happens to render above it.

**Rule**: if a gap's size depends on `position: fixed`, a `min-h-screen` centering trick, or "how tall the content next to it happens to be in the one screenshot you looked at," it is not designed whitespace — it is a coincidence. Every macro gap should trace to an explicit value (a density token, a fixed padding, `mt-auto` inside the _same_ flex container as the element it is spacing from) that holds regardless of viewport size or sibling content length.

## F-Pattern And Z-Pattern: Match The Flow To The Content Density

Eye-tracking gives two dominant scan shapes:

- **F-Pattern**: dense, content-heavy pages (a dashboard, a list, an article). The eye scans a full horizontal line near the top, a shorter horizontal scan below it, then drifts down the left edge scanning starts-of-lines rather than reading fully. Consequence: put the most important word first in every line/heading, and keep the highest-value content on the left edge.
- **Z-Pattern**: sparse, low-content pages (a landing page, a hero, a login screen). The eye moves top-left → top-right → diagonally to bottom-left → bottom-right. Consequence: put the logo top-left, a secondary action top-right, and the primary action at the path's end.

**What the login page actually is, and why forcing a single Z-flow onto it would be wrong**: it is not one continuous diagonal scan — it is two independent vertical stacks side by side (the marketing hero, read top-to-bottom on the left; the functional card, read top-to-bottom on the right). Each column is internally a small F-pattern (heading → subheading → body, all left-edge-anchored in the hero; eyebrow → title → fields, all sharing the card's own left edge in the form). The reason this is correct rather than a missed Z-pattern: the white card's contrast against the dark photo already does the job a Z-pattern's diagonal is _for_ — pulling the eye to the one thing that matters (Von Restorff Effect, `ux-heuristics-slicing`) — without needing a manufactured diagonal path to get there. Do not add a top-right element (a nav link, a secondary CTA) purely to "complete the Z" — that quadrant being empty is fine when nothing there needs to compete with the card for attention.

**This is also why the copyright footer belongs to the page, not to one column**: content that is genuinely page-level (legal text, a global footer) should not live inside whichever component happens to render in that visual position — it should be structured as a sibling of the content columns, both for the whitespace reason above and because its reading role (page-wide footnote) is different from either column's role (marketing copy vs. functional form).

## Law of Continuity: Alignment Consistency, Overridable By A Stronger Convention

Gestalt's Continuity: the eye follows a smooth line/edge more easily than a broken one — elements sharing an alignment edge read as connected and are easy to scan in sequence; a alignment jump makes the eye "trip."

**A genuine, accepted break already in this page**: the login `Card`'s header (`CardHeader`, `items-center text-center` — eyebrow, title, description all centered) sits directly above the form body (`CardContent` → `LoginForm`, everything left-aligned). Read strictly, this is a continuity violation — the eye centers for the header, then has to jump back to the left edge to start reading form labels. **It is kept this way on purpose**: a centered heading over a left-aligned field stack is close to a universal convention for login/signup forms (Jakob's Law, `ux-heuristics-slicing`), and an established convention a user already has muscle memory for beats textbook Gestalt purity here. The lesson is not "never break continuity" — it is **know which principle is doing the work in a given spot, and do not "fix" an intentional break that a stronger principle already justifies.**

**Where continuity should not be broken without a reason as strong as that one**: within a single reading unit — the hero panel's heading/subheading/paragraph, the stat grid's four columns, the form's own label-to-input pairs — every sibling element shares the same left edge or the same center axis as its neighbors. An arbitrary few-pixel misalignment between two elements that are supposed to read as one group (not a deliberate convention override) is a bug, not a style choice.

## Symmetry And Asymmetry: Balance Is Not The Same As Mirroring

**Symmetry** mirrors weight left-right or top-bottom — reads as stable, formal, sometimes static. **Asymmetry** balances _unequal_ elements against each other (a large, quiet block against a small, loud one) — reads as more dynamic, and is how most modern product UIs (including the reference `linear-demo` shell: a narrow sidebar against a large content panel) are actually built.

**The login page's asymmetry is a correct example, not a gap to fix**: the hero panel (large, `flex-1`, photographic, low-contrast white-on-photo text) is balanced against the compact `Card` (fixed `lg:w-80 xl:w-100`, small, but maximum contrast — solid white on a dark backdrop). Neither side needs to match the other's size, because contrast is doing the weight-balancing job size would otherwise have to do. **Rule**: before assuming two areas of a layout need matching width/size to feel balanced, check whether a contrast or color difference is already carrying that weight — forcing them to matching sizes in that case would just waste the hero panel's available space without making the composition read as more "finished."

## Rule Of Thirds: A Compositional Guide, Not A Requirement For Functional UI

Divide the canvas into a 3×3 grid; place the important subject on a gridline or intersection rather than dead-center, for a more dynamic composition. This comes from photography/film and applies most directly to imagery and largely-static marketing compositions.

**Checked against the login page rather than assumed**: the `Card` sits horizontally in roughly the right third of the viewport (a thirds-consistent placement) but is vertically dead-center (`main`'s `items-center` on the content row) rather than on an upper/lower thirds line. **This is the correct call, not a miss**: a login form is a functional target, not a photograph — dead-center vertical placement is the most predictable, fastest-to-locate position regardless of viewport height, and that predictability is worth more here than the mild compositional dynamism a thirds-based placement would add. The hero headline ("UBH OPEX"), by contrast, starts close to the upper horizontal thirds line — appropriate there because it is closer to a marketing composition than a functional target.

**Rule**: reach for rule-of-thirds placement for imagery, marketing/hero compositions, or anything largely decorative. For a functional, interactive target (a form, a primary button, a search bar) favor the most predictable/reachable position — usually centered on its axis or pinned to a conventional edge — over a thirds-based placement chosen purely for visual interest.

## Check

- [ ] Every macro gap traces to an explicit value (density token, fixed padding, `mt-auto` within the same flex container) — none depend on `position: fixed`, a `min-h-screen` centering side-effect, or a sibling's incidental content length
- [ ] Content that is genuinely page-level (footer, legal text, global nav) is structured as a sibling of the page's content columns, not nested inside whichever component happens to render in that visual spot
- [ ] Chose F-pattern-friendly (left-anchored, dense) or Z-pattern-friendly (sparse, diagonal-anchored) structure based on the actual content density of the page, not by default
- [ ] Every sibling group meant to read as one unit shares a consistent alignment edge — any deliberate break is justified by a named, stronger convention (cite it), not left as an unexplained inconsistency
- [ ] Before forcing two unequal-sized areas to match width/size for "balance," checked whether contrast/color is already carrying that balance (asymmetry may already be correct)
- [ ] Rule-of-thirds placement is reserved for imagery/marketing composition; a functional interactive target uses the most predictable position for its context instead
