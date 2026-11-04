---
name: interaction-states
description: Mandatory loading/empty/error/disabled/focus state checklist for any interactive or data-bound slice, grounded in this repo's own AreaPage query pattern and the library's built-in Button isLoading/Skeleton/EmptyState/Spinner components. Use whenever wiring a TanStack Query view, a form submit button, or any custom interactive control — a happy-path-only slice (renders once real data exists, nothing else) is the single most common gap in AI-generated UI and is not considered done here.
---

# Interaction States

A slice that only renders its happy path — real data, no pending request, no error, never disabled — is not finished. This is the most common gap in AI-generated UI: fast to produce, looks right in the first screenshot, and breaks the moment a network request is slow, empty, or fails. This skill exists to make that gap checkable, not to restate general UX advice.

## The Four States Every Data-Bound View Needs

`AreaPage.svelte` — the reference feature this project's own `CLAUDE.md` already points to for every new pattern — implements the canonical shape. Read the check order directly rather than re-deriving it:

```svelte
{#if page.query.isError}
	<EmptyState>
		{#snippet description()}
			{page.query.error instanceof Error ? page.query.error.message : 'Terjadi kesalahan'}
		{/snippet}
	</EmptyState>
{:else if page.query.isPending}
	<Skeleton class="h-9 w-full" />
	<!-- ...repeated to roughly match the real content's row count/shape -->
{:else}
	<!-- the real DataTable -->
{/if}
```

Four states, checked in this order:

1. **Error** (`isError`) — checked first, before pending, because a query that has already failed once is not "pending" on a refetch. Surface the real error message (`error instanceof Error ? error.message : ...`), never a generic "something went wrong" that discards the actual cause — the fallback string only covers the case where the thrown value genuinely is not an `Error`.
2. **Loading** (`isPending`) — a `Skeleton` shaped like the real content (same rough height/row count as the table it is standing in for), not a centered spinner that gives no sense of the eventual layout. A spinner is for a short, unstructured wait (a button submit); a skeleton is for a structured view (a table, a list, a form about to be populated).

   **`isPending` is not the only loading state once a view has `placeholderData: keepPreviousData`.** A server-driven list (search/sort/pagination sent as query params — see the `api-integration` skill) needs `keepPreviousData` so paging/sorting/searching doesn't flash back to the skeleton on every change; the cost is that `isPending` stays `false` during that refetch, because TanStack Query is technically already showing data (the previous page's). `AreaPage.svelte` shipped exactly this gap once: `isFetching` existed but only drove the refresh button's spin icon — small, easy to miss — while the table itself sat frozen with zero visual change for the whole round trip, reading as "the search box doesn't work." The populated branch needs its own `isFetching`-but-not-`isPending` treatment: dim the stale content (`opacity-60`, `aria-busy={isFetching}`) and/or show a small `Spinner` near the control that triggered the refetch (the search field's `suffix`, in `AreaPage`'s case) — never nothing.

3. **Empty** (loaded successfully, zero rows) — its own distinct state, not folded into the error branch. This is a genuinely different message ("no data yet, here's how to add one") from an error ("something failed, here's what"). `DataTable` takes this directly via `labels={{ empty: '...' }}`; a custom list/grid uses `EmptyState` the same way the error branch does, with a different `title`/`description` and, where relevant, a primary action to fix the emptiness (an "add first item" button).
4. **Populated** — the real content. This is the only branch most AI-generated slices actually implement.

## Every Submit/Async Action Needs Its Own Pending State

The Doherty Threshold: feedback within ~400ms keeps a user's attention on task; anything slower with no visible response reads as broken. `Button` already has this built in — `node_modules/dystopia-linear-lib/dist/components/button/Button.svelte` accepts `isLoading` and an optional `loading` snippet, and wires `disabled={disabled || isLoading}` plus `aria-busy` automatically:

```svelte
<Button type="submit" isLoading={$submitting}>Simpan</Button>
```

**Do not hand-roll this.** A currently-shipped example of the anti-pattern, worth recognizing rather than repeating, is `LoginForm.svelte`'s submit button:

```svelte
<!-- what NOT to copy -->
<Button type="submit" class="w-full gap-2" disabled={$submitting}>
	{#if $submitting}
		<IconLoader class="size-4 animate-spin" />
		Memproses...
	{:else}
		MASUK
	{/if}
</Button>
```

This works visually but re-implements what `isLoading` already gives for free (`aria-busy`, guaranteed-in-sync `disabled`), and ties the disabled state to a hand-tracked flag that has to be kept in sync manually instead of by the component itself. Prefer `isLoading={$submitting}` unless the button's label genuinely needs to change text mid-submit (as here, "MASUK" → "Memproses...") — in that case keep the `{#if}` for the label only, but still pass `isLoading` so `aria-busy`/`disabled` stay component-owned rather than duplicated by hand.

**The general rule**: `disabled` and the loading indicator must read from the exact same signal. Two separately-tracked flags for "is this busy" and "is this disabled" will eventually drift out of sync — one becomes stale after a refactor and the button is clickable while a request is in flight, or permanently disabled after one fails.

## Focus State Is Not Optional

Every library component already ships `focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none` (see `Button.variants.js`, `TextField.variants.js`, the icon-button recipe in `linear-style-slicing`). When building a **custom** interactive element that is not a library component — a bespoke clickable `<div>`, a custom icon trigger — copy that exact recipe rather than omitting it. Never ship `outline-none` (or an equivalent that suppresses the browser's default focus ring) without an explicit visible replacement; keyboard-only navigation depends on it.

## Disabled Means Perceivable, Not Hidden

The library's own convention — `disabled:opacity-50 disabled:cursor-not-allowed` on `Button`/`TextField` — keeps a disabled control visible but visually receded, not removed from the layout. When a control becomes unusable for a transient reason (a dependent field not filled yet, a request in flight), disable it in place; do not conditionally unmount it. A control that disappears and reappears is harder to track than one that stays put and changes state, and it shifts every sibling element's layout.

## A Fully-Interactive Appearance Implies Real Behavior

This overlaps with `ux-heuristics-slicing`'s Jakob's Law section, from the state side rather than the pattern side: a control with hover/focus/pressed states styled as if it works is an implicit promise that it does something. The login page's ID/EN toggle (hover state, pressed state, focus ring, all fully styled) with zero effect on page content is this codebase's own example of the gap — noted here as a known, currently-unresolved case, not a pattern to copy. If a control cannot be wired to real behavior in the same slice, give it a `disabled` state (which the library already styles distinctly) rather than a fully-interactive one.

## Check

- [ ] Any TanStack Query (or similar async) view branches on, in this order: `isError` → `isPending` → empty (loaded, zero items) → populated
- [ ] The error branch surfaces the real error message, not a hardcoded generic string
- [ ] The loading branch is a `Skeleton` shaped like the real content for a structured view, or a `Spinner`/`isLoading` button state for a short unstructured wait
- [ ] If the view uses `placeholderData: keepPreviousData`, the populated branch itself shows an `isFetching` cue (dim + `aria-busy`, and/or a small `Spinner`) — `isPending` alone misses every search/sort/page refetch
- [ ] The empty branch has its own message and, where relevant, an action to resolve it — never folded into the error branch
- [ ] Every submit/async button uses `isLoading` (not a hand-rolled `{#if submitting}<Icon spin>{/if}`) unless the label must change text, in which case `isLoading` is still passed alongside the manual label swap
- [ ] `disabled` and the loading indicator read from the same signal, never two separately-tracked flags
- [ ] Every custom (non-library) interactive element keeps a visible `focus-visible` ring
- [ ] A disabled control stays mounted and visually receded, not conditionally removed from the layout
- [ ] No control carries fully-interactive styling (hover/focus/pressed) without real behavior wired to it
