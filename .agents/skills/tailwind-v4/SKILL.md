---
name: tailwind-v4
description: Tailwind CSS v4 in this repo — config lives in layout.css (no tailwind.config.js), the semantic colour roles that replace raw palette classes, v4 arbitrary-value and important-modifier syntax, and the eight eslint-plugin-tailwindcss rules that decide whether the editor shows a warning. Use when writing or editing any class attribute, a cva variants file, or layout.css itself.
---

# Tailwind v4

Installed: `tailwindcss 4.3.3`, `eslint-plugin-tailwindcss 4.2.0`, `prettier-plugin-tailwindcss 0.8.1`, `tailwind-merge 3.6.0`.

**There is no `tailwind.config.js`.** All configuration lives in [`src/routes/layout.css`](../../../src/routes/layout.css), and both tools are pointed at it:

```js
// eslint.config.js
settings: {
	tailwindcss: {
		cssConfigPath: './src/routes/layout.css';
	}
}

// prettier.config.js
tailwindStylesheet: './src/routes/layout.css';
```

A token that is not in that file does not exist. Adding one is a CSS edit, not a config edit.

## The Directives In `layout.css`

| Directive                  | Used for                                                   |
| -------------------------- | ---------------------------------------------------------- |
| `@import 'tailwindcss'`    | Replaces v3's `@tailwind base/components/utilities`        |
| `@plugin '…'`              | Loads a plugin — here `@tailwindcss/typography`            |
| `@source not '…'`          | Excludes files from the class scan                         |
| `@custom-variant dark (…)` | Class-based dark mode instead of the media default         |
| `@theme { … }`             | Design tokens; emitted only when a utility references them |
| `@theme static { … }`      | Tokens emitted **always**, referenced or not               |

Two of these carry decisions worth knowing:

```css
@source not '../../*_template.html';
```

The client mockups at the repo root are design references. Tailwind scans every non-ignored file by default, so without this their classes compile into the production bundle as utilities nothing renders.

```css
@theme static {
	--color-chart-1: …;
}
```

`static` is deliberate. v4 only emits theme variables a generated utility actually references. Charts take their colours through JS (ApexCharts), never a class — without `static` the `--color-chart-*` variables would be missing from `:root` and `getComputedStyle` would return an empty string at runtime.

## Colour Comes From Roles

Never write a raw palette class or a hex literal. `#00272f` is `brand-950`, and it already has a role name for every job it does.

**Surfaces** — `canvas` (page ground), `surface`, `surface-subtle`, `surface-muted`, `surface-raised`, `surface-overlay`, `surface-glass`, `surface-inverse`, `surface-inverse-hover`

**Text** — `ink`, `ink-muted`, `ink-subtle`, `ink-faint`, `ink-disabled`, `ink-inverse`, `ink-on-inverse`

**Borders** — `line`, `line-subtle`, `line-strong`, `line-hover`

**Brand** — `brand-solid`, `brand-solid-hover`, `brand-fg`, `brand-fg-hover`, `brand-surface`, `brand-surface-hover`, `brand-ink`, `brand-line`, `brand-line-hover`, `brand-line-subtle`

**Status** — `danger-*`, `success-*`, `warning-*`, `info-*`, each with `solid`, `solid-hover`, `fg`, `ink`, `surface`, `line`, `line-subtle`

**Other** — `sidebar`, `sidebar-active`, `sidebar-hover`, `overlay`, `focus-ring`, `chart-1` … `chart-6`

Roles already carry their dark-mode value, so a role needs **no `dark:` pair**:

```svelte
<div class="bg-surface text-ink border border-line">        <!-- yes -->
<div class="bg-white text-slate-900 dark:bg-slate-900">     <!-- no -->
```

Opacity uses the slash modifier on a role or palette step — `bg-brand-500/10`. Inside `layout.css` the same thing is `--alpha(var(--color-brand-500) / 10%)`, used 23 times there.

## v4 Syntax That Differs From v3

**Important modifier moved to the end.** `!` as a prefix is deprecated:

```
font-bold!     ✅ v4
!font-bold     ❌ v3 — warns via `important-modifier-suffix`, autofixable
```

**CSS variables in arbitrary values use parentheses, not brackets:**

```
bg-(--my-var)   ✅ v4
bg-[--my-var]   ❌ v3
```

**Negative arbitrary values put the sign inside.** This one is counterintuitive — the lint rule wants the opposite of the plain-utility convention:

```
z-[-1]     ✅          -z-1     ✅ (plain utility keeps the prefix)
-z-[1]     ❌ warns via `enforces-negative-arbitrary-values`
```

**The shadow, radius and blur scales shifted by one step.** Verified in `node_modules/tailwindcss/theme.css`: v4 defines `--shadow-2xs`, `--shadow-xs`, `--shadow-sm`, and `--radius-xs`, `--radius-sm`. A v3 `shadow-sm` is a v4 `shadow-xs`; a v3 bare `shadow` is a v4 `shadow-sm`. Copying class strings out of a v3 snippet silently changes the visual weight.

**Spacing is derived from one number:** `--spacing: 0.25rem`. That is why `p-[8px]` gets flagged — the linter now resolves the unit and knows `p-2` exists.

## The Eight Lint Rules

`tailwind.configs.recommended` is enabled in `eslint.config.js`. These are the exact severities:

| Rule                                 | Severity  | Wants                                                            |
| ------------------------------------ | --------- | ---------------------------------------------------------------- |
| `no-contradicting-classname`         | **error** | No `p-2 p-4` on one element                                      |
| `classnames-order`                   | warn      | Canonical class order                                            |
| `no-custom-classname`                | warn      | Every class resolvable from `layout.css`                         |
| `enforces-shorthand`                 | warn      | `size-4` over `w-4 h-4`; `truncate` over the three-class version |
| `important-modifier-suffix`          | warn      | `block!`, not `!block`                                           |
| `enforces-negative-arbitrary-values` | warn      | `z-[-1]`, not `-z-[1]`                                           |
| `no-unnecessary-arbitrary-value`     | warn      | `m-2` when `m-[8px]` means the same                              |
| `no-arbitrary-value`                 | **off**   | Arbitrary values are allowed when justified                      |

`no-custom-classname` is the one that fires on a genuinely new utility. The fix is to declare it in `layout.css` — as a `@theme` token or a `@utility` — not to silence the rule.

## Why The Editor Shows 42 Warnings

Every current `classnames-order` warning sits in a `*.variants.ts` file:

```
10  combobox.variants.ts     6  card.variants.ts       3  label.variants.ts
10  datepicker.variants.ts   6  textfield.variants.ts  2  typography.variants.ts
 5  button.variants.ts
```

Cause: `prettier-plugin-tailwindcss` sorts classes in `class` attributes, but it only sorts inside a function call when that function is named in `tailwindFunctions`. `prettier.config.js` does not set it, so prettier never sorts the strings inside `cva()` — while eslint keeps checking them. The two tools disagree permanently and `npm run format` cannot close the gap.

Verified fix — one line in `prettier.config.js`:

```js
tailwindFunctions: ['cva', 'cn'],
```

Confirmed by running prettier on `button.variants.ts` with and without the option: without it the string is untouched, with it `ring-offset-canvas` moves into sorted position. After adding it, run `npm run format` once and the 42 warnings clear.

Until that lands, do not hand-reorder classes inside a `cva()` to chase the warning — prettier will not preserve your order and the next editor may re-sort differently.

## Conditional Classes

Use `cn()` from `$lib/utils` — `clsx` plus `tailwind-merge`. It resolves conflicts so a later class actually wins, which raw string concatenation cannot do:

```ts
const classes = $derived(cn(cardVariants({ variant, padding, interactive }), className));
```

Component variants belong in a `cva()` inside `<name>.variants.ts`, never assembled inline. See the `cva-tailwind` guidance for the variant API itself.

## No `@apply`

If a long class list repeats, extract a Svelte component — do not move the classes into a CSS file behind `@apply`. Avoid Svelte `<style>` blocks except for third-party overrides or an animation utilities cannot express.

## Known Drift — Do Not Copy

**440 hex literals** in class attributes (`text-[#00272f]`, `bg-[#005466]`, `border-[#cbd5e1]`) and **286 arbitrary font sizes** (`text-[13px]`, `text-[11px]`, `text-[12.5px]`) across 23 files — 22 in `dashboard/`, plus `auth/presentation/pages/LoginPage.svelte`.

These are template slices made before the role layer existed. Every one of those hexes has a role. New markup uses roles and theme steps; migrate a file's colours only when you are already editing it for another reason.

Also note `npm run lint` currently fails on formatting alone — `prettier --check src` reports 60 unformatted files at HEAD. That is pre-existing, not something you introduced.

## Check

```sh
npm run format   # prettier --write, sorts classes
npm run lint     # prettier --check + eslint
```

Before finishing:

- [ ] Colours are roles, never a hex literal or a raw `slate-*`/`white` pair
- [ ] No `dark:` pair on a role — it already carries its dark value
- [ ] `!` at the end of the class, variables in `(--var)` parentheses
- [ ] Arbitrary value only where no token fits; not `p-[8px]`
- [ ] Conditional classes through `cn()`, variants through `cva()`
- [ ] New utility declared in `layout.css`, not silenced in eslint
