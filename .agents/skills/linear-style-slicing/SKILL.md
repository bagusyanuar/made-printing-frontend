---
name: linear-style-slicing
description: The density, restraint, and motion rules that give dystopia-linear-lib its "linear-style" look — measured directly from the package's shipped classes, not from linear.app itself. Use when choosing a radius, shadow, spacing value, icon size, font weight, or transition duration while slicing any page, whether or not the markup uses a dystopia-linear-lib component yet.
---

# Linear-Style Slicing

"Linear-style" here means one specific, checkable thing: the visual language `dystopia-linear-lib` already commits to in its own shipped code. Its `index.css` says so directly —

```css
/* Density scale — prep for the Linear-style migration tracked in
   docs/component-roadmap.md. */
```

Every rule below was measured with `grep` across the package's 82 compiled `.svelte` components, not recalled from browsing linear.app (a logged-in product this environment cannot reach). Where a number appears, it is a count from the actual shipped source, so it can be re-verified the same way:

```sh
grep -rohE 'rounded-[a-z0-9]+' node_modules/dystopia-linear-lib/dist/components/**/*.svelte | sort | uniq -c | sort -rn
```

## Radius: `md` For Controls, `lg` For Containers, `full` For Circles

Measured distribution: `rounded-md` 23 uses, `rounded-lg` 11, `rounded-full` 6, `rounded-sm` 1.

| Element kind                                                                | Radius         | Real px (this project's theme) |
| --------------------------------------------------------------------------- | -------------- | ------------------------------ |
| Button, input, badge, chip — anything you click or type into                | `rounded-md`   | 6px                            |
| Card, dialog, popover, drawer panel — anything that contains other elements | `rounded-lg`   | 8px                            |
| Avatar, status dot, circular icon button                                    | `rounded-full` | —                              |

Never reach for `rounded-xl` or larger on a control — nothing in the package uses it. A bigger radius reads as a container, not a click target.

## Shadow: Almost None

Only `shadow-sm` appears anywhere in the package — 7 occurrences, always on an overlay-type surface (popover, dropdown content). **`shadow-md`, `shadow-lg`, `shadow-xl` appear zero times.** Elevation comes from a `border` plus a surface-tone step (`bg-surface` vs `bg-surface-subtle`), not from a shadow stack.

```
/* yes */  rounded-lg border border-border bg-surface
/* no  */  rounded-lg shadow-lg bg-white
```

A card that needs to separate from its background gets a border, not a heavier shadow. Reserve `shadow-sm` for genuinely floating content (a popover, a dropdown menu) — never a static card sitting in the page flow.

## Border Is The Default Separator

`border-border` is the overwhelming default — 29 occurrences against `border-primary` (7), `border-danger` (4) combined. The plain 1px `border` utility, un-widened, is what draws every default edge; a colored border only appears **inside a variant**, never as a base class:

```js
// Badge.variants.js — colour is opt-in, not ambient
default:   'bg-primary text-primary-foreground',
secondary: 'border border-border bg-surface-subtle text-foreground-soft',
outline:   'border border-border bg-transparent text-foreground-soft',
danger:    'bg-danger text-danger-foreground'
```

Same shape in `Button.variants.js`. The lesson: a neutral element's border is always `border-border`. A colored border shows up only on the specific variant that means something (danger, primary-outline) — never as the resting state of an ordinary container.

**Zero Dashed Borders (`border-dashed` appears 0 times in library source):**
Never reach for `border-dashed` or `border-dotted` on empty states, dropzones, or cards. It is an immediate sign of generic AI Slop. Real Linear-style components use solid hairline borders (`border border-border`) with calm `bg-surface-subtle` fills.

## Typography: `text-sm` Is The Floor, Weight Carries Hierarchy

Measured: `text-sm` 33 uses, `text-xs` 6, `text-lg` 3. `font-medium` 24 uses against `font-semibold` 3 and `font-normal` 1 — **zero uses of `font-bold`.**

- Default body/UI text is `text-sm` (14px). `text-xs` is for a badge, a helper caption, a compact label — not body copy.
- Hierarchy comes from `font-medium` vs the browser default, not from jumping font sizes. `font-semibold` is reserved for real emphasis (a card title) and used sparingly.
- **Never `font-bold`.** It does not appear once in 82 components. If something needs to stand out further than `font-semibold`, that is a sizing or color decision, not a weight one.

## Spacing: Density Tokens Where They Fit

`index.css` defines a density scale — `--spacing-control-x`, `--spacing-control-y`, `--spacing-compact`, `--spacing-surface`, `--spacing-tight`, `--spacing-cozy`, `--spacing-loose` — which generates utilities like `px-control-x` and `gap-tight`. These are **already wired into 46 of the package's 82 components** (confirmed: `Button.variants.js` uses `gap-tight` and `px-control-x`; `Badge.variants.js` uses `gap-tight`), not just declared and unused.

| Utility        | Value          | Use for                                       |
| -------------- | -------------- | --------------------------------------------- |
| `gap-tight`    | 0.375rem (6px) | Icon-to-label gap inside a control            |
| `gap-cozy`     | 0.5rem (8px)   | Default gap between sibling elements          |
| `gap-loose`    | 0.75rem (12px) | Looser stacks — form fields, list rows        |
| `px-control-x` | 1rem (16px)    | Button/input horizontal padding               |
| `py-control-y` | 0.5rem (8px)   | Button/input vertical padding                 |
| `p-compact`    | 0.75rem (12px) | Dense rows — list/menu items, popover content |
| `p-surface`    | 1.5rem (24px)  | Card/dialog surface padding                   |

When a new control or container needs padding or a gap and one of these names fits the job, use it over a raw `px-4`/`gap-2` — it is where the library's own components are converging, confirmed by adoption in the majority of them (46/82), not a theoretical dial nobody uses yet. The remaining 36 still use raw spacing utilities; that is pre-existing, not a pattern to copy into new code.

### Control Size: Match The Toolbar To The Table It Sits Above

`Button` and `TextField` both default to `size="md"` (`h-10`) when no `size` prop is passed — that reads noticeably bulkier than a `DataTable` row (`TableCell`/`TableHead` default to `py-2`, ~36px tall). A search field + primary-action row sitting directly above a dense table should drop to `size="sm"` (`h-8`) on **both** controls together — the font size doesn't change (`sm` and `md` are both `text-sm`, only `lg` bumps to `text-base`), so this is purely a height/padding tightening, not a typography change:

```svelte
<TextField size="sm" bind:value={search} ... />
<Button size="sm" onclick={handleAdd}>...</Button>
```

`DataTable` itself accepts a `classes` prop (`{ table?, header?, body?, row?, head?, cell? }`) for tightening row density without fighting the component's root `class` — e.g. `classes={{ head: 'py-1.5', cell: 'py-1.5' }}` to shrink the default `py-2` row padding by one step. Don't lower the cell/header text below `text-sm` to "make it denser" — see the Typography section above: `text-sm` is the floor, padding is the density knob.

## Icon Sizing

`size-4` (16px) dominates — 21 occurrences, the default for an icon next to text (a button's leading icon, a menu item). `size-3.5` (14px) shows up in genuinely tight contexts (inline badges). `size-8`/`size-10` appear only at avatar scale.

Default to `size-4` for any inline icon unless the surrounding control is explicitly compact (`size-3.5`) or the element is an avatar/large icon-only button (`size-8`+).

## Motion: Short, Linear Easing, Color Over Layout

Every transition in the package is `duration-150` (29 occurrences) or `duration-200` (4, only on the larger `Drawer` panel) — nothing slower except one `duration-300` outlier. `transition-colors` (25) dominates over `transition-transform` (5): most motion in this system is a hover/focus color change, not a layout shift.

Enter/exit animations (`Dialog`, `Toast`, `Drawer`) all use plain `ease-out` on the way in, `ease-in` on the way out — no spring, no bounce, no overshoot. Scale transforms move a small distance: `scale(0.96)` to `scale(1)`, never a dramatic pop.

```css
--animate-dialog-content-in: dialog-content-in 150ms ease-out forwards;
--animate-dialog-content-out: dialog-content-out 150ms ease-in forwards;
```

`@media (prefers-reduced-motion: reduce)` turns every one of these off (`animation: none`) — carry that same guard into any custom transition you add by hand.

Rule of thumb: **150ms, linear/ease easing, color or opacity — not a bespoke spring curve, not longer than 200ms even for a large panel.**

## Layout Shell: Floating Card, Not Edge-To-Edge

The package ships components, not an app shell — this pattern isn't measured from `dist/components`, it's observed from the reference build the sidebar/header composition is ported from (`svelte-dystopia-soft`'s `src/routes/demo/sidebar/+page.svelte`, mirrored in this repo's `src/routes/linear-demo/+page.svelte`). Treat it as the shell-level counterpart to the component-level rules above, sourced honestly as a reference build rather than a `grep` count.

Three surface tiers, each one step more "raised" than the last:

| Tier       | Class                                        | Role                                                                                                                                                                               |
| ---------- | -------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Canvas     | `bg-surface-subtle`, full `flex h-screen`    | The dimmest layer — what the sidebar and main panel float on                                                                                                                       |
| Sidebar    | `border-r-0 bg-transparent`                  | No border, no fill — separated from canvas by contrast alone, not a line                                                                                                           |
| Main panel | `rounded-xl border border-border bg-surface` | The single largest surface on the page — a `py-compact pr-compact` gap on its wrapper is what creates the floating effect (sidebar sits flush left, panel floats top/right/bottom) |

**`rounded-xl` is a third radius tier, above the `md`/`lg`/`full` scale measured earlier** — reserved for exactly one element per page: the whole-page shell frame. It does not appear in the package's own components (those only ever go up to `rounded-lg` for a container) because no single component _is_ a page frame; this tier only applies at the app-shell level, one per route.

Inside that shell:

- **Header height is shared** between the sidebar's own header and the main panel's header (`h-14` on both) — keeps the two chrome rows visually aligned even though they're separate elements.
- **The sidebar-collapse toggle lives in the main panel's header**, not inside the sidebar itself (see the `dystopia-linear-lib` skill's app-shell section) — it's a plain icon button bound to the same `collapsed` state passed into `<Sidebar bind:collapsed>`.
- **Breadcrumb replaces a page title**: `text-foreground-subtle` (parent/group) + `~icons/lucide/chevron-right` at `size-3.5 text-foreground-faint` + `font-medium text-foreground` (current page) — three steps of the same text hierarchy the Typography section below already uses, just applied to navigation instead of body copy.

## Icon-Button Recipe

Every icon-only button in the reference shell (collapse toggle, theme toggle, breadcrumb chevrons) reuses one exact class recipe rather than varying it per button:

```
inline-flex size-8 cursor-pointer items-center justify-center rounded-md
text-foreground-subtle transition-colors duration-150
hover:bg-surface-subtle hover:text-foreground-soft
focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none
```

`size-8` (32px) is the click-target size for an icon-only control — one step up from the `size-4` (16px) icon it contains. Reuse this recipe verbatim for any new icon-only button instead of composing hover/focus states from scratch each time.

## Color Discipline: Fill Is Opt-In, Not Ambient

From the variant files above: the base/neutral state of a component never carries a filled background. `bg-primary` and `bg-danger` appear only on the variant that specifically means "primary action" or "danger" — every other variant (`secondary`, `outline`, `ghost`) stays on `bg-surface-subtle`, `bg-transparent`, or no background utility at all.

Slicing rule: **don't reach for a colored fill to make an element "feel important."** Importance comes from the semantic variant it already is (a primary button is `variant="default"`, everything else stays neutral) — not from adding color to a neutral element that doesn't carry that meaning.

## Quick Reference

| Choosing…                                         | Do this                                        | Not this                                       |
| ------------------------------------------------- | ---------------------------------------------- | ---------------------------------------------- |
| A control's radius                                | `rounded-md`                                   | `rounded-xl`, `rounded-2xl`                    |
| A container's radius                              | `rounded-lg`                                   | `rounded-sm`                                   |
| The whole-page shell frame (one per page)         | `rounded-xl`                                   | `rounded-lg` (too small at that scale)         |
| An icon-only button                               | The icon-button recipe (`size-8`, see above)   | Ad-hoc hover/focus per button                  |
| Separating a card from the page                   | `border border-border`                         | `shadow-lg`                                    |
| Emphasis on a heading                             | `font-semibold`                                | `font-bold`                                    |
| Body/UI text size                                 | `text-sm`                                      | `text-base` as a default                       |
| Icon next to a label                              | `size-4`                                       | `size-5`/`size-6` by default                   |
| A hover/focus transition                          | `transition-colors duration-150`               | `duration-300`+, a spring/bounce easing        |
| Padding inside a button                           | `px-control-x py-control-y`                    | a raw `px-4 py-2` guess                        |
| Making an element look important                  | The correct semantic variant                   | An extra `bg-*` fill bolted onto a neutral one |
| A toolbar row (search/action) above a `DataTable` | `size="sm"` on every control in the row        | Default `size="md"` next to `py-2` table rows  |
| Tightening `DataTable` row height                 | `classes={{ head: 'py-1.5', cell: 'py-1.5' }}` | Shrinking cell `text-sm` to `text-xs`          |

## What This Skill Does Not Claim

This is not a description of `linear.app`'s actual product UI — that is a logged-in application this environment has no access to, and any specific claim about its pixel values would be unverifiable. This skill only documents what `dystopia-linear-lib` itself has already committed to in shipped code, which its own source comments describe as heading toward a "Linear-style migration." Treat it as this project's design system, not as a claim about a third-party product.

The density-scale adoption (46/82 components) and the legacy pages this project has not yet migrated onto `dystopia-linear-lib` (see the `dystopia-linear-lib` skill) are both still in progress — this document describes the direction, not a universally-finished state.

## Check

There is no lint rule for any of this — it is a judgement call at slicing time, not something `npm run lint` catches. Before finishing a slice:

- [ ] Radius: `md` on controls, `lg` on containers, `full` only on circles
- [ ] No `shadow-md` or heavier; a border does the separating
- [ ] No `font-bold`; hierarchy from `font-medium`/`font-semibold`
- [ ] Icons default to `size-4` unless the context is explicitly compact or avatar-scale
- [ ] Any new transition is `~150ms`, color/opacity, plain easing
- [ ] A neutral element has no fill color bolted on for emphasis
