# Visual Style: Soft Minimal SaaS (Made Printing)

The project's single visual language. Every dashboard page, card, chart and control is drawn in this style — there is no second theme to choose from. It supersedes any conflicting instruction in the older rule docs; where this file and another disagree, this one wins.

Read alongside [design-system.md](./design-system.md) (the anti-slop principles this style implements) and [layout-structure.md](./layout-structure.md) (the shell it lives in).

## 1. What The Style Is

Low-contrast cool canvas, hairline borders, large consistent radii, near-flat elevation, tinted icon chips, one saturated accent for action plus a muted categorical palette for data, and generous whitespace. Hierarchy comes from **spacing and type scale**, not from colour or shadow.

Explicitly **not**:

- **Neumorphism** — no inset/outset double shadows, no embossed controls.
- **Glassmorphism as the default** — `Card variant="glass"` stays reserved for surfaces over a gradient or image. Over the flat canvas it reads as a smudge.
- **Bento** — no deliberately mismatched tile sizes standing in for hierarchy.
- **Material** — no stepped elevation ladder, no ripple, no heavy filled colour blocks.
- **Framed app shell** — no rounded outer frame with a margin around the whole app. The shell stays full-bleed (see [layout-structure.md](./layout-structure.md)).

## 2. Surfaces & Elevation

Two levels of surface. There is no third.

| Level   | Use                        | Treatment                                                    |
| ------- | -------------------------- | ------------------------------------------------------------ |
| Canvas  | Page background            | `bg-canvas`. Never bordered, never a card.                   |
| Surface | Every card, panel, popover | `Card` — hairline border, barely-there shadow, `rounded-xl`. |

- **Nesting is allowed, once, and only downward in weight.** An item row inside a card (an activity list, a selected-item chip list) uses `Card variant="outline"` — border only, no shadow. A `default` card inside a `default` card is a rule violation: two stacked shadows muddy the canvas.
- **The elevation ladder is a two-rung ladder.** `elevated` (borderless, shadow carries it) is for surfaces that must read as _above_ the page — KPI tiles, floating panels. `default` is everything else. Do not mix all five variants on one screen.
- **Popovers, dropdowns and dialogs sit at `elevated`.** They float; they get the only pronounced shadow on screen.
- **Card `default` shadow must stay near-flat.** The border carries the separation, the shadow only grounds it. If a card reads as "lifted" while sitting still, the shadow is too strong.

## 3. Radius

| Element                                          | Radius                        |
| ------------------------------------------------ | ----------------------------- |
| Card, panel, dialog, chart container             | `rounded-xl`                  |
| Button, input, select, badge-as-rectangle        | `rounded-md`                  |
| Icon chip, avatar, pill badge, segmented control | `rounded-lg` / `rounded-full` |

One radius per role, applied everywhere. A card at `rounded-2xl` beside a card at `rounded-xl` is the fastest way to make a screen look assembled from templates.

## 4. Colour

Colour is declared in two layers, and **components only ever touch the second one.**

**Palette** — `brand-*`, `accent-*`, `slate-*`, the semantic hues. A palette step names a colour: `brand-700` is `#005466` in every theme, forever.

**Semantic roles** — `surface`, `ink`, `line`, `brand-solid`. A role names a job, and its value changes per theme. Both layers live in [layout.css](../../src/routes/layout.css).

Write `bg-surface`, never `bg-white dark:bg-slate-900`. Two reasons, and the second is the one that matters:

1. A third theme becomes a block of CSS instead of a pass over every file.
2. **Pairs drift, and ours already had.** Before this layer existed, `border-slate-200` had three different dark answers across the codebase — `white/10` (13 places), `slate-700` (5), `slate-800` (3) — and `slate-400`/`slate-500` had swapped roles between components. Nobody chose that; it is what happens when the same decision is re-made in 49 files. A role settles it once.

### The roles

Roles follow a suffix grammar, so a name can be guessed rather than looked up:

- **`surface*`** fills — `canvas` (page), `surface` (card), `surface-raised` (dialogs, dropdowns), `surface-overlay` (blurred floating panels), `surface-muted` (row hover), `surface-subtle` (zebra fills), `surface-glass` (the reserved glass variant), `surface-inverse` (+`-hover`, for the inverted `secondary` button), `overlay` (the modal scrim).
- **`line*`** borders — `line` (default hairline), `line-strong` (inputs), `line-subtle` (dividers), `line-hover`.
- **`ink*`** text — `ink` (headings), `ink-muted` (body), `ink-subtle` (secondary, table headers), `ink-faint` (placeholders), `ink-disabled`, `ink-inverse` (on a filled brand), `ink-on-inverse` (on `surface-inverse`).
- **`focus-ring`** — every focus ring, no exceptions.

**Brand and status families share one shape.** `brand`, `danger`, `warning`, `info` and `success` each carry the same suffixes, so a tinted container is assembled identically whichever it is:

| Suffix                    | Job                                                      |
| ------------------------- | -------------------------------------------------------- |
| `-surface`                | the tint a container sits on                             |
| `-line-subtle`            | that container's border                                  |
| `-ink`                    | text **on** the tint (near-black light, near-white dark) |
| `-fg`                     | the colour on a plain surface — icons, labels, links     |
| `-line`                   | a loud border, e.g. an input in an error state           |
| `-solid` / `-solid-hover` | a filled button                                          |

Brand adds `brand-fg-hover`, `brand-surface-hover` and `brand-line-hover` because it is the only family with interactive states of its own.

Two properties of the dark values are deliberate and worth knowing before adding a theme:

- **Tints invert rather than lighten.** On dark, `danger-surface` is `red-500/10`, not a lighter red — a pale tint on a dark canvas glows.
- **`solid` does not move.** A destructive button is the same red in both themes; shifting it would cost the meaning the colour carries.

[layout.css](../../src/routes/layout.css) is the source of truth for the values — 60 roles at the time of writing. Do not restate them elsewhere.

Reach for a palette step directly **only** when no role fits: a chart colour, a tinted icon chip whose hue carries category meaning, a permanently-dark surface like the sidebar, or a deliberately translucent one. If the same palette pair appears twice, that is a missing role — add it rather than repeating the pair.

- **Secondary accent:** A secondary identity accent punctuates — highlights, active indicators, one chart series — and never fills a primary button, where it would collide with semantic status indicators.
  - **Its scope is charts, tags, and badge indicators.** It has a palette scale but no arbitrary usage, so no component reaches for it without purpose.
  - **Widening it is a deliberate step, not an ad-hoc class.** Using a secondary accent in the UI means ensuring measured contrast in both light and dark mode.
  - **Never a button.** Accents on interactive buttons collide with standard primary or warning actions.
- **Tinted icon chips** carry category, not decoration: a `size-10 rounded-lg` chip, `bg-<hue>-50 dark:bg-<hue>-500/10`, icon at `text-<hue>-600 dark:text-<hue>-400`. This is one of the few places a raw palette pair is correct — the hue _is_ the information, so it cannot collapse into a role. Reserve hue meaning per context and keep it stable across the app.
- **Semantic hues are fixed**: `emerald` success, `amber` warning, `rose` danger, `sky` info. Never repurpose them for decoration.
- **Data needs its own palette.** A donut cannot be drawn in one accent. Define a categorical ramp once as theme tokens in [layout.css](../../src/routes/layout.css) and let every chart read from it — never hand-pick colours per chart:

  ```css
  @theme {
  	--color-chart-1: var(--color-brand-600);
  	--color-chart-2: var(--color-indigo-500);
  	--color-chart-3: var(--color-accent-400);
  	--color-chart-4: var(--color-rose-400);
  	--color-chart-5: var(--color-sky-400);
  	--color-chart-6: var(--color-violet-400);
  }
  ```

  Order is fixed: series 1 always takes `chart-1`. Two charts on the same page showing the same category must show it in the same colour.

- **No arbitrary hex — including the brand's own.** `bg-[#00272f]` is a violation now that `bg-brand-950` exists: a literal hex escapes the scale, so it cannot be themed, dark-mode-swapped, or audited. The same goes for `#005466` and `#003e4a`, which are `brand-700` and `brand-800`.

## 5. Spacing Rhythm

One rhythm, 24 / 32, matching `Card`'s own padding scale.

- Page shell padding lives on `<main>` (`p-6 lg:p-8`). **A page component never sets its own outer padding.**
- Page root is `flex flex-col gap-6` — the only vertical rhythm on the page.
- Grid gutters are `gap-6`. Card internal rhythm comes from `Card`'s `padding` context, not from hand-written classes.
- Inside a card: `gap-5` between blocks, `gap-3` between a label and its value, `gap-2` between an icon and its text.

## 6. Grid & Composition

Twelve-column thinking, symmetric or clean fractions. Approved splits:

| Row                       | Grid                                                             |
| ------------------------- | ---------------------------------------------------------------- |
| KPI row                   | `grid-cols-1 sm:grid-cols-2 xl:grid-cols-4`                      |
| Primary chart + companion | `grid-cols-1 lg:grid-cols-3` with `lg:col-span-2` on the primary |
| List + table              | `grid-cols-1 lg:grid-cols-3` with `lg:col-span-2` on the table   |
| Equal pair                | `grid-cols-1 lg:grid-cols-2`                                     |

A 2/3 + 1/3 split is a proportioned grid, not bento — it is allowed and encouraged. What stays banned is _arbitrary_ tile sizing where the sizes carry no meaning.

**Page recipe — empty canvas, card owns everything:**

```
<main>            padding lives here, set by the app layout
└─ div.flex.flex-col.gap-6
   ├─ <header>                  eyebrow · h1 · description | actions right
   ├─ <section aria-label>      KPI row      — Card variant="elevated"
   ├─ <section aria-label>      charts       — Card variant="default"
   └─ <section aria-label>      table        — Card padding="none"
```

- **The canvas never draws a box.** No border, background or padding at page level. If something needs a container, it is a `Card`.
- **One section, one card.** Toolbars and filters go in `CardHeader bordered`; pagination goes in `CardFooter bordered`; the table itself is `padding="none"` so it runs edge to edge. A hand-rolled `border-t` div around pagination is a violation — `CardFooter` exists.
- **Hierarchy is typographic.** Eyebrow `text-xs font-bold uppercase tracking-wide text-brand-fg`, title `text-2xl font-bold tracking-tight text-ink`, description `text-sm text-ink-subtle`. Do not add colour to create emphasis.

## 7. Navigation

- **The sidebar is wide and labelled**, not an icon rail: workspace/brand at top, grouped sections with uppercase group labels, icon + text per item, collapsible groups for nested routes, and a collapse toggle that reduces it to icons on demand. This is a deliberate reversal of the old icon-rail rule — explicit labels beat icon guessing in an app with this many master-data routes.
- **Active state**: filled `bg-brand-surface` with `text-brand-fg` and a medium weight. No left-border indicator bar.
- **The header stays thin** — page title left, then a right cluster of collaborators, notifications, search and profile. It carries context, never controls that belong to a page section.
- Mobile collapses the sidebar into a sheet. Grids collapse to `grid-cols-1`.

## 8. Motion

- `transition-all duration-300` on surfaces, `duration-200` on controls.
- Hover on interactive cards: `-translate-y-0.5` plus a slightly wider shadow. Buttons: `hover:-translate-y-0.5`, `active:scale-95`.
- Focus is always visible: `focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2`.
- Nothing bounces, nothing slides in on page load. The style is quiet.

## 9. Components The Style Requires

The style leans on primitives that must exist in `$lib/components/ui/` before a page reaches for raw markup. Missing ones are built as primitives, not copy-pasted into a feature:

| Primitive           | Needed for                                                   |
| ------------------- | ------------------------------------------------------------ |
| `badge`             | status pills — every table and list row                      |
| `avatar` (+ stack)  | header collaborators, user cells                             |
| `switch`            | settings toggles, dark mode                                  |
| `segmented-control` | Monthly / Quarterly / Yearly range switches                  |
| `icon-tile`         | the tinted icon chip in KPI tiles and list rows              |
| `chart`             | one ApexCharts wrapper owning theme, palette, fonts, tooltip |

`StatCard` and activity-list rows are **compositions** of the above plus `Card` — they live in the feature that uses them until a second feature needs them.

## 10. Quick Rejection List

A screen fails this style if any of these are true:

- A page component sets its own outer padding.
- Two `default` cards are nested.
- A raw `<table>`, `<input>` or inline `<svg>` appears where a primitive exists.
- An arbitrary hex colour appears in a class, or `teal-*` reappears anywhere.
- A chart picks its own colours instead of the `chart-*` tokens.
- A colour pair is written by hand (`bg-white dark:bg-slate-900`) where a role exists.
- `dark:` variants are missing on a surface that had to reach for a palette step.
- More than one accent hue competes for attention in the same view, or `accent` yellow is used on a button.
