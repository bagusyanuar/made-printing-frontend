---
name: visual-hierarchy-scale
description: Visual hierarchy as an outcome, and the three measurement tools that build it in this app — an 8-point/4-point spacing grid via the named density tokens, a restrained type scale grounded in Weber's Law (why a scale must be multiplicative, not a random pixel value), and when the golden ratio genuinely applies versus when it is solving a problem this token-driven design system does not have. Use when picking a spacing value, choosing between two font sizes, sizing a custom control, or judging whether a composition's proportions feel arbitrary.
---

# Visual Hierarchy And Scale

Visual hierarchy is not a rule on its own — it is what falls out of using a consistent spacing grid and a restrained type scale correctly. This skill gives the two measurable tools (grid, scale) plus one that is usually a distraction (golden ratio) for a component-driven, token-based system like this one.

## Visual Hierarchy: The Outcome, Not A Separate Rule

Hierarchy is order — the biggest/boldest/most saturated thing gets seen first, then the next tier, then the next. In this app that order already comes from two things documented elsewhere, cross-referenced here rather than restated:

- The `Typography` variant scale (`h1` → `h2` → `h3` → `h4` → `body` → `small`, see the `dystopia-linear-lib` skill's variant table) — pick the variant for the semantic level, not a font-size utility for the visual weight wanted.
- `linear-style-slicing`'s "Typography: text-sm Is The Floor, Weight Carries Hierarchy" — hierarchy comes from `font-medium` vs `font-semibold`, never `font-bold`, and size jumps are used sparingly.

A CTA button does not need to be the largest text on a view to read as the primary action — a filled (`variant="default"`) background already carries that signal. Reaching for a bigger font size on a button that is already visually filled is a redundant hierarchy signal, not a stronger one.

## The Spacing Grid: Named Density Tokens, Not Raw Multiples

This app does not literally run a strict 8-point grid — check before assuming: the density scale in `linear-style-slicing` (`gap-tight` 6px, `gap-cozy`/`spacing-control-y` 8px, `gap-loose`/`spacing-compact` 12px, `spacing-surface` 24px) mixes 4px-grid values (6, 12) with 8px-grid values (8, 24). The actual house rule is **use the named token for the density it represents**, never a raw arbitrary utility that happens to equal the same pixel value.

**The concrete mistake this caught**: `LoginForm.svelte` used `gap-1.5` (a raw Tailwind utility, 6px) in two field-wrapper `div`s, when `gap-tight` is the exact same 6px value as a named token. Same render, worse maintainability — a future density-scale change (e.g. `gap-tight` moving to 4px for a denser theme) would silently miss every raw `gap-1.5` still scattered in feature code. Fixed by switching both to `gap-tight`.

**The second concrete mistake**: a segmented-toggle control (`LoginPage.svelte`'s locale switch) was built with `h-7 px-2.5` on its buttons and `p-0.5 gap-0.5` on its container — four numbers that trace to no scale at all, not `Button`'s own `size` variants (`sm` is `h-8`, not `h-7`) and not this app's density tokens. Fixed by dropping the custom height override (let `size="sm"` own it) and switching the container to `p-1`/`gap-tight`. **Before hand-writing a spacing or sizing number, check two things first: does a `Button`/component `size` variant already give this value, and does a named density token already equal this value** — a custom number is a signal you have invented a value nothing else in the system uses, not that you have found the right value.

Icon sizes (`size-4`/`size-5`/`size-6`/`size-7`/`size-8`/`size-10`/`size-12`) are their own documented scale in `linear-style-slicing`'s "Icon Sizing" section and are not expected to land on an 8px grid either — that section already gives the rule (`size-4` default, `size-8`+ for avatar-scale); this skill's grid rule is about spacing/dimensions outside that already-covered case.

## Modular Scale And Weber's Law: Why Type Sizes Cannot Be Arbitrary

Weber's Law: a difference is only perceived as meaningful if it is large enough relative to the starting size (the "just noticeable difference," roughly proportional, not a fixed pixel amount). This is why a type scale is multiplicative in spirit (each step some ratio bigger than the last), not additive (`+2px` every step) — a `+2px` step is highly noticeable at 12px but invisible at 48px.

**Read this app's actual scale before assuming it follows one exact ratio** — it does not. `Typography.variants.js` gives `text-2xl`(24) → `text-xl`(20) → `text-lg`(18) → `text-base`(16) → `text-sm`(14) → `text-xs`(12), a step-to-step ratio wobbling between 1.11 and 1.2 rather than one constant number. This is Tailwind's own hand-tuned default scale, not a derived modular scale (e.g. a strict 1.25 or 1.333 ratio) — accurate to call it "restrained and roughly multiplicative," not "a perfect/major-third/golden modular scale."

**The rule that matters in practice**: pick a size from the existing six `Typography` steps. Introducing a new arbitrary value between two existing steps (`text-[13px]` to sit between `text-xs` 12 and `text-sm` 14) very likely falls below the perceptible difference threshold from at least one neighbor — it will not read as an intentional new tier, it will read as an inconsistency or a bug. If a genuinely new size feels necessary, that is a sign to reconsider which of the six existing tiers the content actually belongs to, not a reason to add a seventh pixel value.

**When two tiers are close on purpose**, compensate with a second signal instead of relying on size alone. The login card's eyebrow label (`text-xs`, 12px) sits close to the body copy (`text-sm`, 14px, only a 14% jump — near the low end of what most people notice) but stays legible as a distinct tier because it also carries letter-spacing, an uppercase transform, and a lower-emphasis color — three signals compensating for one weak one, not one signal doing all the work.

## Golden Ratio: Know When It Does Not Apply

The golden ratio (1:1.618) is a proportion sometimes used for a genuinely proportion-critical, largely static composition — a poster, a hero split in a marketing page, a print layout. It is rarely a literal target in a component-driven, responsive, token-based system like this one, because:

- This app's containers resize with the viewport (`flex-1` panels, responsive breakpoint widths) — a ratio computed against one viewport width is wrong at the next breakpoint, so enforcing 1.618 anywhere fluid means fighting the responsive layout, not supporting it.
- Every dimension that matters here already comes from a token (spacing, sizing, radius) or a component default (`Button` size, `Card` width) — introducing a golden-ratio calculation on top would be a second, competing sizing system.

**Checked and confirmed absent from this app on purpose, not by oversight**: the login page's hero-panel-to-card split is `flex-1` (fluid) against a fixed card width (`lg:w-80 xl:w-100`) — not a fixed ratio, which is the correct call for a responsive two-column layout. Do not "fix" a fluid split by forcing it into 1.618; that trades responsiveness for a number with no functional benefit here.

**When golden ratio is worth reaching for in this app**: a genuinely static, proportion-critical piece of artwork or one-off marketing composition (not a reusable component, not anything that resizes) where a deliberate, pleasing aspect ratio is the entire point — closer to how the client's own `*_template.html` mockups were likely composed than to how a `Card`-based form gets built.

## Check

- [ ] Every spacing/gap value either matches a named density token (`gap-tight`/`cozy`/`loose`, `p-compact`/`surface`, `px-control-x`/`py-control-y`) or a component's own `size` variant — no raw utility chosen because it happens to equal the same pixel value as one of those
- [ ] A custom control's height/padding was checked against the relevant component's `size` variants before hand-writing a number
- [ ] Every font size is one of the six `Typography` variants — no arbitrary `text-[Npx]` invented to sit between two existing steps
- [ ] Two hierarchy tiers that sit close in size lean on a second signal (weight, color, tracking, case) rather than size alone
- [ ] No golden-ratio (or other fixed-ratio) calculation imposed on a fluid/responsive container — reserved for genuinely static, proportion-critical compositions only
