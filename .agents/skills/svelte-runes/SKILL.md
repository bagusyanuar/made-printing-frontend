---
name: svelte-runes
description: Svelte 5 patterns for this repo — runes for reactivity, `$props()` for props, event props instead of `on:`, snippets instead of slots, and the two traps that cost the most time: `$effect` must be created at init (`effect_orphan`) and Svelte libraries must be excluded from Vite pre-bundling. Use when writing or editing any .svelte or .svelte.ts file, a component, a state class, a store, or a hook.
---

# Svelte 5 Runes

This project is Svelte 5 with runes **forced on** — `vite.config.ts` sets `compilerOptions.runes: true` for everything outside `node_modules`. Svelte 4 syntax does not merely lint badly here; it does not compile.

The repo is currently clean: zero `export let`, zero `on:click`, zero `<slot>`, zero `$:`, zero `svelte/store`. Keep it there.

## The Swap Table

| Svelte 4 — never write      | Svelte 5 — write this                 |
| --------------------------- | ------------------------------------- |
| `export let title`          | `let { title } = $props()`            |
| `$: doubled = n * 2`        | `const doubled = $derived(n * 2)`     |
| `writable()` / `readable()` | a `.svelte.ts` class holding `$state` |
| `on:click={fn}`             | `onclick={fn}`                        |
| `createEventDispatcher()`   | pass a callback prop                  |
| `<slot />`                  | `{@render children?.()}`              |
| `<slot name="footer" />`    | a named `Snippet` prop                |

## Props

Type the props object, destructure it, and keep the type exported when other files need it.

```svelte
<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	export type CardProps = HTMLAttributes<HTMLElement> & {
		variant?: CardVariant;
		/** Spacing rhythm inherited by every section below. */
		padding?: CardPadding;
		children?: Snippet;
	};

	let { class: className, variant, padding = 'default', children, ...rest }: CardProps = $props();
</script>

<div class={classes} {...rest}>
	{@render children?.()}
</div>
```

Points that matter:

- Extend `HTMLAttributes<T>` from `svelte/elements` so consumers get the real DOM attribute types instead of a hand-written subset.
- `class` is a reserved word — rename it in the destructure (`class: className`).
- Collect the remainder as `...rest` and spread it, so a consumer can pass `aria-*`, `data-*`, or an event handler without the component enumerating them.
- Render an optional snippet with `?.()` — `{@render children?.()}`, not `{@render children()}`.

## Derived, Not Effect

Reach for `$derived` first. `$effect` is for side effects that leave the component — DOM measurement, a third-party library, `localStorage`.

```ts
const isInteractive = $derived(interactive ?? Boolean(href));
const classes = $derived(cn(cardVariants({ variant, padding }), className));
```

Computing a value inside `$effect` and assigning it to `$state` is the common mistake: it runs a frame late, and it re-runs on its own writes.

Use `$derived.by(() => { … })` when the computation needs statements rather than an expression.

## Effects That Write State — Avoiding Infinite Loops

An effect that reads a `$state` value and also writes to it (directly, or through a value that feeds back into its own dependencies) re-runs every time that write changes something it tracks. If the write keeps producing a different value forever, that's an infinite loop — the classic case is two effects each syncing into the other's dependency.

Three patterns keep this safe, all in real components here:

**1. Guard the write so the condition goes false once applied.** The write moves state to exactly the place the `if` no longer holds, so the effect fires once more, sees nothing to do, and stops:

```ts
// data-table.features.svelte.ts — clamp pageIndex after the row count shrinks
$effect(() => {
	const pageCount = table.getPageCount();
	const pageIndex = table.atoms.pagination?.get()?.pageIndex ?? 0;

	if (pageCount > 0 && pageIndex > pageCount - 1) {
		table.setPageIndex(pageCount - 1);
	}
});
```

After `setPageIndex` runs, `pageIndex > pageCount - 1` is false, so the next pass is a no-op. An unconditional write here — clamping every run regardless of whether it's already in range — would still terminate in this case, but write the same pattern without the `if` for a value that never stabilizes and it won't.

Same shape in `Popover.svelte`:

```ts
$effect(() => {
	if (disabled && open) popover.set(false);
});
```

`popover.set(false)` makes `open` false, so `disabled && open` cannot be true on the next run.

**2. Write to something that isn't reactive state.** A DOM property, a ref, an imperative call to a non-Svelte library — none of these are tracked dependencies, so writing them cannot re-trigger the effect that wrote them:

```ts
// Checkbox.svelte
$effect(() => {
	if (inputRef) inputRef.indeterminate = indeterminate;
});
```

**3. Don't sync two `$state` values both ways with a pair of effects.** If you're reaching for a second effect to write back into the first effect's dependency, model it as one `$derived` instead — one value is the source of truth, the other is computed from it, not kept "in sync" by mutual watching.

When an effect must write a value using something it also needs to _read_ but should not depend on, pull that read out with `untrack` so it isn't a tracked dependency at all — see `LoginForm.svelte`'s `untrack` use in [superforms](../superforms/SKILL.md) for the shape. That's a different reason (avoiding an unrelated re-fire) but the same tool applies whenever a read inside an effect must not count toward its own re-run.

## `$effect` Is Init-Time Only

An effect may only be created during component initialisation — or inside another effect, or an explicit `$effect.root`. Anywhere else fails with **`effect_orphan`**.

That makes any helper that creates an effect an _init-time helper_. It must be called from a component's `<script>`, never from:

- an event handler
- a `$derived` callback
- module top level

**Consequence:** a factory that creates effects internally — `createDataTable`, a query client, a state class holding `$effect` — must be constructed by the component that owns it. If a file cannot do that (a `.stories.svelte` file, a plain module), move the construction into a child component.

```svelte
<script lang="ts">
	// correct: constructed at init, in the component that owns the table
	const table = createDataTable<MasterArea>({
		columns,
		get data() {
			return query.data ?? [];
		}
	});
</script>
```

Note the getter in the options object. Passing `data: query.data` would snapshot the value once; `get data()` keeps it reactive across the boundary. The same pattern applies to context:

```ts
setCardContext({
	get padding() {
		return padding;
	}
});
```

## Runes Outside Components

Runes compile only in `.svelte` files and `.ts` files whose name ends in `.svelte.ts`. In a plain `.ts` file the rune is left as an undefined identifier — no error at build, a crash at runtime.

- The moment a shared module needs a rune, rename it to `<name>.svelte.ts` and update its imports. The import specifier drops the `.ts`: `./auth.store.svelte.ts` is imported as `./auth.store.svelte`.
- Keep pure logic in a plain `.ts` so it stays testable in the fast node project. Only the rune-bearing part needs the suffix.

Real examples: `auth.store.svelte.ts`, `popover.state.svelte.ts`, `data-table.features.svelte.ts`. Counter-example: `master-area.query-keys.ts` is plain `.ts` — a key factory has no reactivity.

## State Classes

Shared state is a class with `$state` fields, exported alongside a singleton so tests can construct it with fakes.

```ts
export class AuthStore {
	#user = $state<AuthUser | null>(null);
	#status = $state<SessionStatus>('unknown');

	get user(): AuthUser | null {
		return this.#user;
	}
	get isAuthenticated(): boolean {
		return this.#status === 'authenticated';
	}
}
```

Private fields plus getters, not public mutable state — a consumer that can assign into the store makes every write site a candidate when the value goes wrong.

**Exception: a `use-<name>.svelte.ts` hook instance, not a shared singleton.** `AuthStore`/`ThemeStore` are app-wide singletons — anything could write to them from anywhere, so a setter is a real liability. A page-scoped hook (`use-area-page.svelte.ts`, see the `feature-architecture` skill) is different: it lives for exactly one component instance, and its only possible write sites are the two or three `bind:` expressions right next to where it's constructed. When the template needs `bind:value={page.search}` or `bind:open={page.isModalOpen}`, expose that one field as a `get`/`set` accessor pair — it's the only way a plain function-returned object satisfies Svelte's two-way binding. Every other field the hook returns (`areaToEdit`, `isDeleting`, …) stays a read-only getter; only fields the template actually binds to get a setter.

Session-shaped state needs a tri-state (`'unknown' | 'authenticated' | 'anonymous'`), never a boolean. A boolean cannot distinguish "not logged in" from "not checked yet", and guards fire on the wrong one.

Anything resolved once per app load should be single-flight:

```ts
ensureSession(): Promise<void> {
  this.#hydration ??= this.#hydrate();
  return this.#hydration;
}
```

## Lifecycle

Prefer `$effect` over `onMount` / `onDestroy`. Reach for them only when a third-party library genuinely requires a mount hook. An `$effect` returns its own cleanup:

```ts
// AlertDialog.svelte — focus the right button once the dialog opens
$effect(() => {
	if (!open) return;
	const wanted = initialFocus === 'confirm' ? confirmRef : cancelRef;
	const frame = requestAnimationFrame(() => (wanted ?? confirmRef)?.focus());
	return () => cancelAnimationFrame(frame);
});
```

The early `return` when `open` is false is deliberate: an effect that bails before scheduling anything has nothing to clean up.

## Svelte Libraries And Vite Pre-Bundling

Every dependency that ships Svelte components or calls runes **must** be listed in `optimizeDeps.exclude` in `vite.config.ts`:

```ts
optimizeDeps: {
	exclude: ['@tanstack/svelte-table', '@tanstack/svelte-query'];
}
```

A pre-bundled dependency resolves its own copy of the Svelte runtime. Effects it creates then register against a different `active_effect` than the app's component tree. Where that throws, you get `effect_orphan` from inside the library. Where it does not throw, reactivity silently never propagates — the far worse failure, because it looks like a logic bug in your own code.

**Symptom to recognise:** a stack trace where the library frame and the Svelte frame come from different paths — `node_modules/.vite/deps/…` versus `node_modules/svelte/src/…`. Add the package to `exclude` and restart the dev server; a stale Vite cache survives a plain reload.

## Check

```sh
npm run check    # svelte-check, zero errors
npm run lint
```

Before finishing:

- [ ] `$props()` with an explicit props type, `...rest` spread through
- [ ] `$derived` for computed values; `$effect` only for real side effects
- [ ] Every effect that writes `$state` either guards the write so the condition clears, or writes to non-reactive state (DOM property, ref, external call) — never an unguarded write that feeds back into its own dependencies
- [ ] No pair of effects syncing two `$state` values both ways — one `$derived` instead
- [ ] Every effect-creating factory constructed at init, in the owning component
- [ ] Reactive values crossed into options/context via a getter, not a snapshot
- [ ] `.svelte.ts` only where runes actually appear
- [ ] Optional snippets rendered with `{@render x?.()}`
- [ ] No `export let`, `on:`, `<slot>`, `$:`, or `svelte/store`
