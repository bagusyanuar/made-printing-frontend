---
name: ux-heuristics-slicing
description: Interaction-psychology rules for slicing any page — Fitts's Law (target size/hit-area), Proximity and other Gestalt principles (visual grouping), Hick's Law and the Von Restorff effect (one dominant action per view), and Jakob's Law (do not invent new patterns for common tasks). Complements linear-style-slicing (visual language — radius, spacing, motion) with why a layout reads as usable, not just on-brand. Use when placing interactive elements, grouping a section, deciding how many primary actions a view gets, or slicing any control a user has seen elsewhere (search, filter, confirm-delete, language switch, pagination).
---

# UX Heuristics For Slicing

`linear-style-slicing` answers "does this look like the design system." This skill answers "does this behave like something a user already knows how to use." Both apply to the same slice — a card can be pixel-perfect on radius/spacing and still fail if its click targets are too small or its grouping is ambiguous.

Every rule below is grounded in this repo's own components and a real regression this codebase already shipped and fixed — not abstract UX theory.

## Fitts's Law: Target Size And Distance

Bigger, closer targets get hit faster and more accurately. Two concrete failure modes already found in this codebase:

1. **A link or icon-only control with zero padding has a hit-area equal to its text/icon bounds only.** `LoginForm.svelte`'s "Lupa Password?" link originally had no padding at all — clickable area was the literal text glyphs. Fixed by adding invisible padding via a negative-margin offset so the visual position never moves:

   ```svelte
   <a class="-m-1.5 rounded p-1.5 text-xs ...">Lupa Password?</a>
   ```

   Use this `-m-{n} p-{n}` pairing on any bare text link or icon-only trigger that would otherwise hit-test against nothing but its glyphs.

2. **Not every gap can be closed this way — library-owned internals are out of reach.** `PasswordField`'s built-in show/hide toggle (`node_modules/dystopia-linear-lib/dist/components/password-field/PasswordField.svelte`) renders a bare `<button>` around a `size-4` icon with no padding and no exposed `classes` key for it. This is a real, currently-unfixed gap — do not silently accept it as fine, and do not attempt to fork the component to fix it. Flag it when reviewing a page that uses `PasswordField`, the same way a missing `@source` directive gets flagged rather than silently shipped.

**Minimum target size** — read off the library's own `Button.variants.js`, not guessed: `size="sm"` is `h-8` (32px), the default `size="md"` is `h-10` (40px), `size="lg"` is `h-12` (48px). The icon-button recipe in `linear-style-slicing` (`size-8` click box around a `size-4` icon) is this app's floor for any icon-only control — never build a custom icon trigger smaller than that, regardless of how small the icon itself looks in a mockup.

**Distance between destructive and primary actions**: when a footer row has both a cancel/destructive action and the primary action, don't give them equal visual weight sitting flush together — `AreaFormModal.svelte`'s footer (`Batal` as `variant="ghost"`, save action as the only `variant="default"`, `gap-cozy justify-end`) is the pattern to copy: the receded ghost button is safe to place close to the primary because it doesn't compete for the eye or the cursor.

## Proximity And Gestalt: Grouping Is Spacing, Not Just Color

The density tokens documented in `linear-style-slicing` (`gap-tight` 6px → `gap-cozy` 8px → `gap-loose` 12px → `p-surface` 24px) are the literal proximity dial for this app. Two elements that belong together get the smaller token; a boundary between unrelated groups gets the larger token, a `Separator`, or a `border-t`.

**The exact mistake to never repeat**: `Card`'s own contract already builds in one gap between `CardHeader` and `CardContent` — `CardHeader` is `p-surface` (24px on every side, including bottom) and `CardContent` is `p-surface pt-0` (top padding removed because it expects `CardHeader`'s bottom padding to be the only gap). `LoginPage.svelte` once added `pb-0` to `CardHeader` on top of that, zeroing both sides of the seam — the header's description text ended up almost touching the first form label, reading as one group instead of two. **Before adding a `pt-0`/`pb-0`/`mb-0` override near a `Card` subcomponent boundary, read that subcomponent's own base classes first** (`node_modules/dystopia-linear-lib/dist/components/card/*.svelte`) — one side already assumes the other provides the gap.

**Common Region**: a border or background is what tells a user "these controls are one unit," not proximity alone. A two-option toggle (e.g., a locale switch) reads as one control when wrapped in a shared container (`inline-flex ... rounded-md bg-surface-subtle p-0.5`) — two buttons merely sitting near each other with a gap read as two independent, competing choices instead.

**Similarity**: sibling elements of the same semantic role must share the same component, variant, and size. Two fields in the same form section never mix a `default` and `ghost` `TextField` variant, and two buttons meant to be perceived as alternatives (like a segmented toggle) never mix `outline` and `ghost` between them — pick one variant for the inactive state and use it for every inactive option.

## Hick's Law And The Von Restorff Effect: One Dominant Action

More visually-equal choices means slower, less confident decisions. This is already partly encoded in `linear-style-slicing`'s "Color Discipline: Fill Is Opt-In, Not Ambient" section — cross-check that before writing this section from scratch.

**Rule of thumb**: at most one `variant="default"` (filled) `Button` per view or per logical section (a card, a modal, a toolbar row). Every other action in that same region is `outline`, `ghost`, or `secondary` — if a second action needs emphasis, that is a sign that region has two competing goals, not that it needs a second filled button.

**Concrete fix already made**: the login card's language toggle used to be a `ButtonGroup` of two `outline` buttons — two equal-weight bordered boxes glued together, competing for attention as if they were both primary choices. Replaced with a ghost-button-in-pill pattern (`bg-surface-subtle` container, `ghost` for inactive, `default` for the active option) so the whole control reads as one secondary unit, not two competing ones.

**Progressive disclosure**: a rarely-used or secondary action does not get its own always-visible button next to the primary action — it goes in a `Dropdown` or `Popover` (both in the catalogue). Adding buttons to reduce clicks increases the number of simultaneous choices, which is the exact cost Hick's Law describes; a menu trades one extra click for a flat decision space everywhere else.

## Jakob's Law: Do Not Invent New Patterns For Common Tasks

Users bring expectations from every other product they have used. Before building a bespoke interaction for something common — search, filter, confirm-delete, pagination, a language switch — check whether this codebase or `dystopia-linear-lib`'s catalogue already has the conventional shape (see the `dystopia-linear-lib` skill's Catalogue table). `AreaPage.svelte`'s filter/refresh-button pattern is this app's own established convention for a data-list toolbar — copy it for the next page that needs the same job rather than reinventing the row.

**A control that looks interactive must behave like one.** This app currently ships a counter-example worth learning from rather than repeating: the login page's ID/EN toggle visually presents as a working language switch (pressed/unpressed states, hover, focus ring) but does not change any text on the page. A user who has used any other bilingual product expects a click there to do something — shipping the visual affordance without the behavior breaks that expectation just as surely as a broken link. **When a control cannot be wired to real behavior yet, either leave it out of the slice entirely, or mark it as disabled/"coming soon" rather than giving it a fully-interactive, ultimately-inert appearance.**

## Check

- [ ] No bare text link or icon-only trigger with a hit-area smaller than its glyphs/icon — pad it (`-m-{n} p-{n}` if position must not shift)
- [ ] No custom icon-only control smaller than the `size-8` icon-button recipe
- [ ] Checked the relevant `Card`/library subcomponent's own base classes before adding a `pt-0`/`pb-0`/margin override near a section boundary
- [ ] A group meant to read as one control (toggle, segmented switch) is wrapped in a shared container, not just spaced buttons
- [ ] Sibling elements of the same role share the same component/variant/size
- [ ] At most one filled (`variant="default"`) `Button` per view/section
- [ ] A secondary/rare action is inside a `Dropdown`/`Popover`, not an extra always-visible button
- [ ] Before building a new pattern for a common task, checked this app's existing pages and the library catalogue first
- [ ] No control gives a fully-interactive appearance (hover/focus/pressed states) without real behavior behind it
