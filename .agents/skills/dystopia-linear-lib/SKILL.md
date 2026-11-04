---
name: dystopia-linear-lib
description: Mandatory for any new slicing or feature work — use dystopia-linear-lib's 43 published Svelte components instead of src/lib/components/ui or a hand-built element, and render every piece of text content through its Typography component. Covers the exports map and import paths, the Props/child/classes composition pattern, the component catalogue mapped against the local primitives it replaces, the Typography variant table, and how layout.css now aliases this package's tokens as the single Tailwind entry point for every route.
---

# dystopia-linear-lib

The team is migrating off `src/lib/components/ui` onto `dystopia-linear-lib` — a Svelte 5 component package the team publishes to npm from a separate repo (`github.com/bagusyanuar/svelte-dystopia-soft`). It is already a dependency (`^1.1.0`).

## Mandatory For All New Slicing

These are requirements, not preferences — apply them to every new page/feature slice, not just when convenient:

1. **Every component pulls from `dystopia-linear-lib`, not `src/lib/components/ui`, and not hand-built markup a published component already covers.** Check the Catalogue below before writing bespoke markup for a button, card, badge, empty state, skeleton, separator, etc. — if it's in the 41, use it. Local `src/lib/components/ui` is legacy: touch it only for a file that isn't being sliced right now (see the `dystopia-linear-lib` migration status noted in the project's `CLAUDE.md`), never as the default for new work.
2. **Every piece of text content renders through `<Typography>`, not a raw `<h1>`/`<h2>`/`<p>`/`<span>`.** This covers page titles, section headings, descriptions, helper copy, empty-state messages, error messages — any standalone text node the page itself authors. Use the `as` prop to keep correct semantic HTML (`<Typography variant="h2" as="h1">` renders an `<h1>` styled like the library's h2 scale) rather than reaching for a bare tag to fix the semantics.
   - **Exception:** text that is itself a prop/child of another library component that already owns its own typography — a `<Button>`'s label, a `<Badge>`'s label, a `<TableHead>` cell string — doesn't need a nested `<Typography>`; the component's own variant CSS already is the typography treatment. Wrapping it again just double-applies text styling.

```svelte
<!-- yes -->
<Typography variant="h2" as="h1" class="text-primary">Master Area</Typography>
<Typography variant="muted" class="mt-1">Kelola daftar area kerja…</Typography>

<!-- no -->
<h1 class="text-foreground text-xl font-semibold">Master Area</h1>
<p class="text-foreground-subtle text-sm">Kelola daftar area kerja…</p>
```

### Typography Variant Reference

| Variant | Default tag | Classes                                                               | Use for                                                                                                          |
| ------- | ----------- | --------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `h1`    | `<h1>`      | `text-2xl leading-tight font-semibold tracking-tight text-foreground` | Rare — a full page's single top-level heading, if the page doesn't already get its title from a shell breadcrumb |
| `h2`    | `<h2>`      | `text-xl leading-tight font-semibold tracking-tight text-foreground`  | A page/section title (most `AreaPage`-style page headers land here)                                              |
| `h3`    | `<h3>`      | `text-lg leading-tight font-medium text-foreground`                   | A card/subsection title                                                                                          |
| `h4`    | `<h4>`      | `text-base leading-tight font-medium text-foreground`                 | A minor heading — e.g. an `EmptyState` title                                                                     |
| `body`  | `<p>`       | `text-sm text-foreground-muted`                                       | Default paragraph copy                                                                                           |
| `small` | `<small>`   | `text-xs leading-snug text-foreground-muted`                          | Captions, timestamps, fine print                                                                                 |
| `muted` | `<p>`       | `text-sm text-foreground-subtle`                                      | Secondary/description text under a heading                                                                       |

`as` accepts `'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span' | 'div' | 'label' | 'strong' | 'small'` — it only swaps the rendered element, never the variant's classes. Use `as="span"` when text needs to sit inside another element that forbids a block child (e.g. inside a library component's own `<p>`-wrapped snippet, like `EmptyState`'s `title`/`description`).

## ✅ Migration Done: `layout.css` Is Now The Single Entry Point

`src/routes/layout.css` (imported once, from the root `+layout.svelte`) now does `@import 'dystopia-linear-lib/index.css'` plus the matching `@source` directive, and carries every app-specific token override the library needs. `src/routes/(app)/app.shell.css` — the nested-layout entry point that used to hold this override work in isolation — has been deleted; `(app)/+layout.svelte` no longer imports it. Every route, including `(auth)/login`, now gets the library's `--color-primary`/`--color-foreground*`/`--color-border` tokens from the same place.

What's still true: this app's own role vocabulary (`bg-surface`, `text-ink`, `text-ink-muted`, `border-line`, `bg-brand-solid`, …) was **not** renamed to the library's (`text-foreground`, `border-border`, `bg-primary`, …) — both vocabularies coexist in `layout.css` on purpose (see "Alias, not rename" below), so existing markup across the app did not need to change.

`src/routes/linear-demo/linear-demo.css` remains its own separate, deliberately-isolated second import of the library (a re-theme prototype scoped to that one route) — untouched by this migration, still worth flagging if anyone extends it into real pages.

### Alias, Not Rename

The merge was done as an **alias layer**, not a repo-wide rename, because this app's `--color-ink-*`/`--color-line-*`/`--color-brand-*` vocabulary was already load-bearing across most features (not just the 37-file dashboard debt) by the time this migration landed. Concretely, in `layout.css`:

- `--color-surface` / `--color-surface-subtle` are the one pair of names both stylesheets declare. `layout.css`'s own `@theme static` (light) and `.dark {}` (dark) blocks for these are textually **after** the `@import`, so they win outright as the final Tailwind theme value — this fully bypasses the library's own `--surface` raw-var indirection for these two roles (see failure mode 1 and 4 below for why that indirection is exactly what NOT to reconcile through).
- The library's own **raw, un-namespaced** vars (`--primary`, `--primary-hover`, `--primary-foreground`, `--ring` — the ones its `@theme inline` block re-exports as `--color-primary` etc.) are overridden in a plain `:root {}` / `.dark {}` selector near the end of `layout.css`, pointed at this app's existing `--color-brand-700/800/500/400/950` and `--color-focus-ring` tokens. Everything else the library defines (`--foreground*`, `--border*`, `--danger`/`--warning`/`--success`) is untouched and used at the library's own default values — this app never had same-named roles for those, so there was nothing to reconcile.
- The Dialog slide-in override (previously in `app.shell.css`) is ported verbatim into `layout.css`.

### Failure Modes This Avoided (Historical Reference)

These were the concrete risks worked through to land the merge above — useful if a future token change reopens any of them:

1. **`surface` collides.** Both stylesheets declare `--color-surface` under `@theme`. If both are imported, whichever is declared last wins for every usage — silently, with no build warning.
2. **Dark mode never activates for library components.** The library's dark palette is gated on `[data-theme='dark']`, an attribute `layout.css`'s own `.dark`-class gate doesn't touch. `theme.store.svelte.ts` now sets **both** (`classList.toggle('dark', …)` and `dataset.theme = 'dark' | undefined`, on the same `<html>` element) — so the store itself is reconciled — but `layout.css` hasn't migrated to the library's tokens yet, so a library component rendered under it still doesn't have `--color-primary`/`--color-foreground*` to read regardless of which attribute is set.
3. **A utility class used only inside the library's compiled component internals silently never renders — no error, no warning.** Tailwind v4 does not scan `node_modules` by default; it only generates CSS for class strings it finds in files it scans. Any utility that appears **exclusively** inside `node_modules/dystopia-linear-lib/dist/components/**` — a `hover:`/`focus:`/`disabled:` state, a `data-[state=…]` variant, an unremarkable-looking `left-0`/`w-0.5`/`inset-y-1` on some internal decorative element — never gets generated unless that exact string also happens to appear somewhere in `src/`. The class still renders in the DOM; it just matches no CSS rule, so the element looks inert (no hover feedback, a missing active-state accent bar, etc.) with nothing in the build log to point at why. Confirmed by building and grepping the output CSS for `hover\:bg-surface-hover` — present as a `--color` token (from the `@import`) but with zero generated `.hover\:bg-surface-hover:hover{...}` rule until fixed.

   **Fix:** add a `@source` directive pointing at the library's compiled output, next to wherever `@import 'dystopia-linear-lib/index.css'` lives:

   ```css
   @source '../../../node_modules/dystopia-linear-lib/dist';
   ```

   (path is relative to the CSS file — count directories back to the project root, then into `node_modules`). Now present in `layout.css` itself (and still in `src/routes/linear-demo/linear-demo.css`, its own separate entry point). Don't assume a missing hover/focus/active visual is a library gap before checking whether this is the actual cause — it produced exactly that symptom on `SidebarItem`'s own built-in active-accent bar and hover state, neither of which needed any extra markup once this was fixed.

4. **Reconciling a colliding role by pointing it at the other stylesheet's same-named token creates a circular reference, silently.** The library's `@theme inline` block maps its own raw variable to the Tailwind name that collides — e.g. `--color-surface: var(--surface)` (see `node_modules/dystopia-linear-lib/dist/index.css`, or the source at `svelte-dystopia-soft`'s `src/lib/index.css`). Writing `:root { --surface: var(--color-surface); }` to reconcile the collision (matching layout.css's value) looks correct but is exactly backwards: `--color-surface` itself resolves to `var(--surface)` per the library's own rule, so the two definitions point at each other. Per the CSS spec a cycle makes **both** computed values invalid — `bg-surface` silently falls back to `transparent` everywhere, with no build error. This is easy to miss because a transparent panel over a near-white canvas looks almost identical to a correctly-white panel — it only becomes obviously wrong once something behind it (e.g. the canvas) is visibly a different colour, and then it reads as "no separation at all" rather than as a colour bug. **Fix:** reconcile by restating the _literal palette value_ layout.css itself derives the colliding role from (e.g. `--color-surface: #fff;` in `@theme static`, `--color-surface: var(--color-slate-900);` in `.dark {}`), never by referencing the colliding role's own name back — this app's `layout.css` already had exactly this shape for `--color-surface`/`--color-surface-subtle` before the library was even imported, which is precisely why declaring it _after_ the `@import` (so it wins outright, fully overriding the library's `@theme inline` mapping for these two roles) was the correct fix rather than writing any new reconciliation code.

5. **A translucent/alpha token used as the sole, outermost background paint shows whatever is behind the page instead of the intended colour.** Several of layout.css's dark-mode role values are deliberately translucent — e.g. `--color-surface-subtle: rgb(255 255 255 / 0.03)` in dark — because they are designed to be _layered on top of_ an already-opaque backdrop (a subtle highlight tint over a dark canvas). Using that same role as an element's only background, with nothing opaque painted behind it (e.g. the outermost wrapper `<div>` of an app shell), does not render "a slightly-lighter dark tone" — it renders 3% white over whatever the browser paints by default, which is unrelated to the design. This looks like "wrong colour" or "no contrast," not an obviously broken effect, so it is easy to mistake for a value-tuning problem. **Fix:** for an outermost/standalone background, use a role whose value is a solid, opaque colour in every theme (layout.css's own `--color-canvas` role is exactly this: `slate-50` light / `slate-950` dark, no alpha) — reserve `surface-subtle`/`surface-hover`-style tokens for elements that sit on top of another already-painted surface (a hover tint, a highlighted row inside a card).

6. **A palette step named in a source comment as an option (`"brand-400/500"`) is not itself a verified choice — check WCAG contrast before picking one.** layout.css's own brand-scale comment says dark mode "reaches for brand-400/500 instead" of the near-black light-mode step, without committing to either. Picking by eye is not reliable at this end of a palette: measured against this app's dark surface (`slate-900`), `brand-600` fails WCAG AA for text outright (3.77:1, needs 4.5:1), `brand-400` clears it with room to spare but reads washed out (8.52:1), and `brand-500` is the strongest step that still clears AA (5.92:1 text on `slate-900`, 5.23:1 for `brand-950` text on a `brand-500` fill) — the correct middle ground, not obviously so from the numbers' names alone. **Method:** compute contrast with the standard WCAG relative-luminance formula for every literal candidate against the literal background it will actually sit on, rather than assuming a "lighter numbered step must be fine because it looks light." See `layout.css`'s dark `--primary`/`--primary-hover` comment (near the end of the file) for the full worked numbers.

7. **A `layout.css`-defined utility class can lose to a same-specificity library utility on the same element, even inside the single merged `layout.css` entry point.** Before this migration, the documented cause was two separate compiled stylesheets and DOM injection order (`app.shell.css` loading after the root `layout.css`). That specific cause is gone now that both live in one entry point — but verifying against the actual built CSS (`npm run build`, then check byte offsets of the two selectors in the output chunk) shows the risk is not actually gone: `.text-brand-fg{...}` was emitted **before** `.text-foreground{...}` in the merged output, so `text-foreground` (the class `Typography`'s `h4` variant applies) still wins over a plain `text-brand-fg` on the same element. Tailwind v4's generated utility order is an internal implementation detail of its own class-generation pass, not simply "whichever file's `@theme`/rule came first" — do not assume merging entry points fixes an ordering problem without re-checking the built CSS. **Fix, unchanged:** append the Tailwind v4 important modifier as a **trailing** `!` on the overriding utility — `text-brand-fg!`, not `!text-brand-fg` (the ESLint Tailwind plugin flags the leading form and suggests the trailing one). `!important` beats a non-important rule outright regardless of generation order, sidestepping the question entirely. This is exactly why `(app)/+layout.svelte`'s page-title snippet already writes `text-brand-fg!` — keep doing that for any new case where an app role class must beat a library default on the same element.

8. **`Dialog`'s and `Drawer`'s default overlay uses `bg-foreground/40` — a text-color role, not a scrim role, and it self-inverts in dark mode.** `--foreground` is near-black in light mode (a correct dark scrim at 40% opacity) but near-white in dark mode (`oklch(98.4%…)`), so the "dimming" overlay actually _lightens_ the backdrop instead — it renders as a washed-out grey wash over the page rather than a dark scrim. This reads as a vague "contrast feels off in dark mode" complaint rather than an obvious bug, because the overlay still visibly renders — just the wrong direction. `layout.css` already defines the right role for this exact job: `--color-overlay` ("the scrim behind a modal"), a solid dark tint in _both_ themes (`slate-900/40%` light, `slate-950/60%` dark, never foreground-based). **Fix:** override `classes.overlay` on the `Dialog`/`Drawer` instance:

   ```svelte
   <Dialog bind:open classes={{ overlay: 'bg-overlay! backdrop-blur-sm' }}>
   ```

   The trailing `!` is required for the same reason as failure mode 7 above: `bg-overlay` and the library's own `bg-foreground/40` are two different custom utility names Tailwind generates independently, and nothing guarantees which one lands later in the compiled output (checked against the actual built CSS for this specific pair: `bg-overlay` does currently win by generation order, but that is an implementation detail of Tailwind's own build, not a contract — always use `!` here rather than relying on it). `backdrop-blur-sm` is optional (a glassmorphism treatment, not required to fix the contrast bug) but pairs well with a properly dark scrim once the colour itself is correct.

**The decided direction:** `layout.css` is replaced with `@import 'dystopia-linear-lib/index.css'` as the base (plus the `@source` directive above), keeping only the tokens the library doesn't define — `--color-chart-1..6`, `--color-sidebar*`, and any other app-specific role. The old `--color-brand-*` / `--color-ink-*` / `--color-line-*` block is retired in favour of the library's `--color-primary` / `--color-foreground*` / `--color-border*` vocabulary.

**This migration has not been done yet.** Until `layout.css` is updated, library components will render with the library's own default light-mode tokens but won't have the app's dark palette to draw from, and any element mixing a library component with legacy `bg-surface`/`text-ink` markup risks a token collision. Check `layout.css` before assuming a page is production-ready — if it still shows the old `--color-brand-*` block and no `@import 'dystopia-linear-lib/index.css'` (with its `@source`), flag it rather than silently shipping partially-styled components.

## Import Paths

No barrel export — each component folder is its own subpath export:

```ts
import { Button } from 'dystopia-linear-lib/components/button';
import {
	Card,
	CardHeader,
	CardTitle,
	CardContent,
	CardFooter
} from 'dystopia-linear-lib/components/card';
import { cn } from 'dystopia-linear-lib/utils/cn';
```

The `exports` map in the library's `package.json` is a wildcard — `./components/*` resolves to `./dist/components/*/index.js`. The folder segment is **kebab-case and does not always match the local project's old folder name**:

| Local `src/lib/components/ui/` folder | Library subpath                                 |
| ------------------------------------- | ----------------------------------------------- |
| `datepicker`                          | `dystopia-linear-lib/components/date-picker`    |
| `passwordfield`                       | `dystopia-linear-lib/components/password-field` |
| `textfield`                           | `dystopia-linear-lib/components/text-field`     |

Get this wrong and the import 404s at build time, not silently.

## Composition Pattern

Every component's props type follows the same shape — read it before wiring one up, the shape is consistent enough to predict:

```ts
export interface ButtonProps extends HTMLButtonAttributes, ButtonVariantProps {
	class?: string;
	ref?: HTMLButtonElement | null;
	children: Snippet;
	child?: Snippet<[{ props: Record<string, unknown> }]>;
	isLoading?: boolean;
	loading?: Snippet;
}
```

- **`children` is required**, not optional — every component expects real content, unlike the local primitives where `children?: Snippet` was common.
- **`class`** targets the root element. A component with internal parts also exposes **`classes`** — a keyed object for each part (`TextField`'s `classes: { input?, prefix?, suffix? }`, `Dialog`'s `classes: { trigger?, overlay?, content?, title?, description?, close? }`). Never try to style an inner part through `class` alone if `classes` exists for it.
- **`ref`** is a bindable prop for the underlying DOM node — `bind:ref={inputEl}`, not `bind:this`.
- **`child`** is the escape hatch for full control over the rendered root element (the same shape Radix/Bits UI call `asChild`): pass a snippet receiving `{ props }` and spread those props onto your own element instead of the component's default.

```svelte
<TextField bind:value={email} invalid={!!errors.email} classes={{ input: 'font-mono' }}>
	{#snippet prefix()}<IconMail class="size-4" />{/snippet}
</TextField>
```

Variant props (`variant`, `size`, …) come from each component's own `cva()` and are typed per-component — check `<Name>.variants.d.ts` in the package for the exact union before guessing a value.

## Catalogue

43 components ship today (as of `1.1.0`) — substantially more than the 22 primitives in `src/lib/components/ui`. Map a slicing task onto this table before reaching for a local primitive or writing new markup.

**Direct replacements for existing local primitives:**

| Local `src/lib/components/ui/` | Library import                                                                                                                                                                                                                                                                                                                 |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `button`                       | `dystopia-linear-lib/components/button`                                                                                                                                                                                                                                                                                        |
| `card`                         | `dystopia-linear-lib/components/card`                                                                                                                                                                                                                                                                                          |
| `checkbox`                     | `dystopia-linear-lib/components/checkbox`                                                                                                                                                                                                                                                                                      |
| `combobox`                     | `dystopia-linear-lib/components/combobox`                                                                                                                                                                                                                                                                                      |
| `data-table`                   | `dystopia-linear-lib/components/data-table`                                                                                                                                                                                                                                                                                    |
| `datepicker`                   | `dystopia-linear-lib/components/date-picker` (plus `calendar` for the standalone grid)                                                                                                                                                                                                                                         |
| `dialog`                       | `dystopia-linear-lib/components/dialog`                                                                                                                                                                                                                                                                                        |
| `helper-text`                  | `dystopia-linear-lib/components/helper-text`                                                                                                                                                                                                                                                                                   |
| `label`                        | `dystopia-linear-lib/components/label`                                                                                                                                                                                                                                                                                         |
| `pagination`                   | `dystopia-linear-lib/components/pagination`                                                                                                                                                                                                                                                                                    |
| `passwordfield`                | `dystopia-linear-lib/components/password-field`                                                                                                                                                                                                                                                                                |
| `passwordfield` (masked input) | `dystopia-linear-lib/components/masked-field` — a `pattern` string (`#` = digit placeholder, e.g. `"(##)-###-###"`) drives a masked, non-numeric display; bindable `value` is the masked string, bindable `unmaskedValue` the raw digits. Not a `passwordfield` replacement — use for phone numbers, postal codes, ID numbers. |
| `popover`                      | `dystopia-linear-lib/components/popover`                                                                                                                                                                                                                                                                                       |
| `radio`                        | `dystopia-linear-lib/components/radio`                                                                                                                                                                                                                                                                                         |
| `select`                       | `dystopia-linear-lib/components/select`                                                                                                                                                                                                                                                                                        |
| `sidebar`                      | `dystopia-linear-lib/components/sidebar`                                                                                                                                                                                                                                                                                       |
| `table`                        | `dystopia-linear-lib/components/table`                                                                                                                                                                                                                                                                                         |
| `textfield`                    | `dystopia-linear-lib/components/text-field`                                                                                                                                                                                                                                                                                    |
| `toast`                        | `dystopia-linear-lib/components/toast`                                                                                                                                                                                                                                                                                         |
| `typography`                   | `dystopia-linear-lib/components/typography`                                                                                                                                                                                                                                                                                    |

**No equivalent — compose it yourself:**

| Local                               | Note                                                                                                                                                         |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `alert-dialog`                      | The library has `alert` and `dialog` separately, no combined confirm-dialog. Compose `Dialog` with `Alert` (or plain buttons) inside its `children` snippet. |
| `header` (`ProfileDropdown.svelte`) | App-specific, not a generic primitive — stays local, out of scope for this library.                                                                          |

**New in the library — did not exist locally, check here before building custom markup:** `accordion`, `alert`, `avatar`, `badge`, `breadcrumb`, `button-group`, `collapsible`, `drawer`, `dropdown`, `empty-state`, `hover-card`, `number-field`, `progress`, `separator`, `skeleton`, `slider`, `spinner`, `switch`, `tabs`, `textarea`, `toggle`, `tooltip`.

If a page needs a status pill, an accordion filter, a skeleton loading state, or an empty-state placeholder, one of these already exists in the library — check this list before writing bespoke markup or copying dashboard's old hand-rolled version.

`NumberField` (`dystopia-linear-lib/components/number-field`) is `TextField` plus a numeric contract: bindable `value?: number` (`undefined` while empty/unparsable, not `''`), `onValueChange?: (value: number | undefined) => void`, and `thousandSeparator?: boolean` for Indonesian-style grouping (`.` thousands, `,` decimal — switches the input to `type="text"`/`inputmode="decimal"`, so native `min`/`max`/`step` are no longer browser-validated in that mode). `hideSpinner` defaults `true` and is a no-op once `thousandSeparator` is on. It inherits `TextField`'s `prefix`/`suffix` snippets (e.g. an "Rp" prefix for a currency field) — see `ProjectFormModal.svelte`'s `budgetAmount` field for a worked example. Since its bound `value` is `number | undefined`, bridge it against a schema field typed `number | null` with `value={field ?? undefined}` / `onValueChange={(v) => (field = v ?? null)}` rather than binding directly.

## App-Shell Composition: Sidebar Family + Popover

`dystopia-linear-lib/components/sidebar` ships no default nav — you assemble the tree yourself, same division of responsibility as the local primitive it replaces:

```ts
import {
	Sidebar,
	SidebarHeader,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarGroupLabel,
	SidebarItem,
	SidebarCollapsibleItem
} from 'dystopia-linear-lib/components/sidebar';
```

- **`<Sidebar bind:collapsed>`** — `collapsed` is bindable. The collapse _toggle_ lives outside the component, typically a plain button in the app header bound to the same `collapsed` state — `Sidebar` only reacts to it, it doesn't render a trigger of its own.
- **`icon` on `SidebarItem` / `SidebarCollapsibleItem` is a `Snippet`, not a component reference.** A nav tree built from data (icons as `Component` values, e.g. this repo's `appNavSections` in `src/routes/(app)/app.nav.ts`) needs a `{@const}` binding before it can render as the snippet's body:

  ```svelte
  {#each section.entries as entry}
  	{@const EntryIcon = entry.icon}
  	<SidebarItem active={activeHref === entry.href} onclick={() => (activeHref = entry.href)}>
  		{#snippet icon()}
  			<EntryIcon class="size-4" />
  		{/snippet}
  		{entry.title}
  	</SidebarItem>
  {/each}
  ```

- **`SidebarCollapsibleItem` renders its own chevron** — rotates on `open`, hides itself when the sidebar is collapsed. Don't build a separate toggle icon for a nested group; give it `icon` + `trigger` snippets and put child `<SidebarItem size="sm">` rows in its default `children`.
- **Reuse this repo's existing nav data shape** rather than inventing a new one: `NavSection`, `NavGroup`, `NavLink`, and the `isNavGroup()` type guard already live in `src/lib/components/ui/sidebar/sidebar.types.ts` and describe exactly the tree this composition expects (a labelled section of entries, where an entry is either a link or a group with children). Only the rendering swaps from the local primitive to this composition — the data doesn't need a parallel shape.
- **User-menu / account footer pattern** uses `Popover`, not a dedicated dropdown-menu component: a `trigger` snippet (avatar + name + a `~icons/lucide/chevrons-up-down` affordance) and `children` as the popover body (profile summary + a destructive `text-danger` log-out row). `classes: { trigger?, content? }` styles each part; `placement`/`offset` come from `@floating-ui/dom`'s `Placement` type.
- **Page title lives in the navbar, not in the page body.** `AppLayout` takes a `title?: Snippet` prop and forwards it into `AppNavbar`'s `children` slot (the space next to the sidebar-collapse button, `AppNavbar.svelte`'s existing `{#if children}{@render children()}{/if}`). Since the title's content differs per route but `AppLayout` lives in the root/nested shell above every page, the two are bridged with a small reactive store — `pageTitleStore` (`$lib/shared/presentation/page-title.store.svelte.ts`), the same shape as `theme.store.svelte.ts`. Each page sets it once at the top of its `<script>`, a plain assignment, no `$effect` needed:

  ```ts
  // AreaPage.svelte
  import { pageTitleStore } from '$lib/shared/presentation/page-title.store.svelte';
  pageTitleStore.set('Master Area');
  ```

  ```svelte
  <!-- (app)/+layout.svelte -->
  {#snippet title()}
    {#if pageTitleStore.title}
      <Typography variant="h4" as="h1" class="text-sm text-brand-fg!">{pageTitleStore.title}</Typography>
    {/if}
  {/snippet}
  <AppLayout {title} ...>
  ```

  `text-sm` shrinks `h4`'s default `text-base` to fit the navbar's `h-14`; the trailing `text-brand-fg!` is required — see failure mode 7 above for why a plain `text-brand-fg` silently loses to the variant's own `text-foreground`. A page's body `<header>` block (the old pattern: `Typography h2` title + `Separator`) is retired once it adopts this — keep only a `muted` description line in the body if the page still needs one, since the navbar slot is deliberately too short for it.

**Icon source mismatch:** this repo requires `~icons/lucide/*` (`unplugin-icons`) for every icon per this project's own conventions. The library's own reference builds (its demo routes in `svelte-dystopia-soft`, e.g. `src/routes/demo/sidebar/+page.svelte`) hand-write inline `<svg>` markup instead. When porting a layout from one of those reference demos, translate every inline SVG to the matching `~icons/lucide/<name>` import — don't copy the raw `<svg>` block in verbatim. A worked example of this full translation (sidebar + header + main panel, nav icons, theme toggle icons) lives in `src/routes/linear-demo/+page.svelte`.

## `Dialog`: Fixed Internal Spacing, No Trigger-less Mode

Real constraints worth knowing before reaching for `classes` to fight them (see the `superforms` skill for the full form-modal composition, `trigger`/`title`/`description`-as-snippets, and the `footer`-less action-row pattern — this section covers only the spacing/layout facts):

- The panel root is `p-surface` (1.5rem/24px) padding — not overridable per-side, only as a whole via `classes.content` (which replaces the entire root class list along with `classes?.content`, so restate the base classes too if changing this).
- The gap between the title/description block and `children` is a **hardcoded `mt-4` inside `Dialog.svelte`**, not exposed through any `classes` key (`trigger`/`overlay`/`content`/`title`/`description`/`close` — no `header`/`body` slot). There is no supported way to change just this gap without forking the component; don't spend time hunting for one.
- To make a form's own internal rhythm (label→field, field→field, field→footer) feel proportional to that fixed 24px header gap and the panel's 24px padding, use `gap-surface` (`gap: var(--spacing-surface)`, the same token `p-surface` reads) as the form's own flex-column gap, rather than a smaller density token like `gap-loose`. `AreaFormModal.svelte` landed here after trying a `<Separator />` before the footer row first — the separator read as one visual device too many once the gap itself already matched the panel's padding; matching the gap alone was the simpler, "more premium" result. Keep `Separator` in mind for a footer that needs to read as a genuinely distinct zone (a long form with several sections) rather than defaulting to it.

**Combobox** is the searchable alternative to `Select` for an enum-ish field — `dystopia-linear-lib/components/combobox`. Unlike `Select`, it takes `options: ComboboxOption<T>[]` directly (no `<option>` children), and its generic `T` is inferred from that array, so a hand-written options array needs an explicit type annotation to narrow away from `string`:

```ts
import type { ComboboxOption } from 'dystopia-linear-lib/components/combobox';

const TYPE_OPTIONS: ComboboxOption<AreaType>[] = [
	{ value: 'internal', label: 'Internal' },
	{ value: 'external', label: 'External' }
];
```

`name` renders its own hidden `<input>` for native-fallback posting, same contract as `TextField`/`Select`. See the `superforms` skill's Field Markup Convention for the full field-level composition next to `HelperText` and `$errors`.

## Toast Is A Function, Not A Component You Instantiate Per-Call

Mount `<Toaster />` once (root layout, same place the local `Toaster.svelte` sits today), then call the `toast` singleton from anywhere:

```ts
import { toast } from 'dystopia-linear-lib/components/toast';

toast.success('Area berhasil ditambahkan');
toast.danger('Gagal memuat data', { description: error.message });
```

`toast.message` / `.success` / `.warning` / `.danger` each return the new toast's id, for a manual `toast.dismiss(id)`. This replaces the local `toast.store.svelte.ts` — don't run both stores at once, they'd render two independent toast queues.

## `DataTable` Never Calls `createTable` For You

Same division of responsibility as the local primitive: you construct the TanStack table instance yourself (see the `feature-architecture` skill's step 14 for the `createDataTable` pattern), the component only renders it.

```svelte
<script lang="ts">
	import { DataTable, DataTablePagination } from 'dystopia-linear-lib/components/data-table';
	const table = createDataTable<MasterArea>({
		columns,
		get data() {
			return query.data ?? [];
		}
	});
</script>

<DataTable {table} labels={{ empty: 'Belum ada data area' }} />
<DataTablePagination {table} />
```

The `expandedRow` snippet only fires for rows where `row.getIsExpanded()` is true, and only if the table composes `rowExpandingFeature` — a table without it renders exactly as before, nothing to opt out of.

## `cn` Comes From The Library Too

`dystopia-linear-lib/utils/cn` has the identical signature to `$lib/utils`'s `cn` (`clsx` + `tailwind-merge`). Once a file is exclusively using library components, import `cn` from the library rather than the local util — it keeps one utility per dependency direction instead of two doing the same job.

## Peer Dependencies

`svelte ^5.0.0` is a hard peer dependency. `@tanstack/svelte-table ^9.0.0` is an **optional** peer — only needed if `data-table` is used. Both are already satisfied by this project's own `package.json`.

## Never

- Never import a component's `.svelte` file directly (`dystopia-linear-lib/components/button/Button.svelte`) — only the folder's barrel (`dystopia-linear-lib/components/button`) is a published export path.
- Never run the library's toast store and the local `toast.store.svelte.ts` at the same time — pick one `<Toaster />`.
- Never style a library component's inner part by fighting its root `class` — use `classes` if the prop exists.
- Never assume dark mode "just works" for a library component before the `layout.css` migration above is done — verify against the actual rendered page, not the class list.
- Never pass a component reference straight to `SidebarItem`'s/`SidebarCollapsibleItem`'s `icon` prop — it's a `Snippet`. Bind it first (`{@const Icon = entry.icon}`) and render `<Icon />` inside `{#snippet icon()}`.
- Never copy an inline `<svg>` block from one of the library's own reference demos — translate it to `~icons/lucide/<name>` (`unplugin-icons`), this project's required icon source.
- Never assume a missing hover/focus/active visual on a library component is a feature gap in the library before checking the `@source` directive is present wherever its CSS is imported — Tailwind silently drops any utility that lives only inside `node_modules`.

## Check

```sh
npm run check    # svelte-check catches a wrong import subpath
npm run lint
```

Before using a library component in new markup:

- [ ] Import subpath matches the library's own kebab-case folder name, not the old local one
- [ ] Every component used is from `dystopia-linear-lib`, not `src/lib/components/ui` or hand-rolled markup — check the Catalogue first
- [ ] Every standalone text node the page authors (headings, descriptions, empty/error copy) renders through `<Typography>`, with `as` for semantic overrides — not a raw `<h1>`/`<p>`/`<span>`
- [ ] `layout.css` has been migrated to the library's tokens (or you have flagged that it hasn't)
- [ ] `@source '.../node_modules/dystopia-linear-lib/dist'` is present wherever the library's CSS is imported — otherwise its own internal hover/focus/active-state classes silently never render
- [ ] Inner-part styling goes through `classes`, not a `class` override fight
- [ ] Only one `<Toaster />` mounted app-wide
