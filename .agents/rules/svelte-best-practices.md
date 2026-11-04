# Svelte 5 Best Practices

This project uses **Svelte 5**. All Svelte components and logic must strictly adhere to Svelte 5 syntax and paradigms (Runes, Snippets, Event Props). Do **NOT** use deprecated Svelte 4 features.

## 1. Runes for Reactivity

- **Rule:** Always use `$state`, `$derived`, and `$effect` for reactivity.
- **Restriction:** Never use the old Svelte 4 reactive statements (`$:`).
- **Restriction:** Do not use `svelte/store` (`writable`, `readable`) for new code; use `.svelte.ts` files exporting classes or functions with `$state` runes for global/shared state instead.

## 2. Component Props

- **Rule:** Use the `$props()` rune to declare component properties.
- **Restriction:** Never use `export let` to define props.

```svelte
<script lang="ts">
	// ✅ Correct Svelte 5
	let { title, isActive = false }: { title: string; isActive?: boolean } = $props();

	// ❌ Incorrect Svelte 4 (Do not use)
	// export let title: string;
	// export let isActive: boolean = false;
</script>
```

## 3. Event Handling

- **Rule:** In Svelte 5, event handlers are simply props. Pass functions down to children and bind them to standard DOM attributes (`onclick`, `oninput`, etc. - notice the lack of a colon).
- **Restriction:** Never use `createEventDispatcher`. Never use the `on:click` syntax.

```svelte
<script lang="ts">
	// ✅ Correct Svelte 5
	let { onclick }: { onclick: (e: MouseEvent) => void } = $props();
</script>

<button {onclick}>Click Me</button>
```

## 4. Slots vs Snippets

- **Rule:** Use Svelte 5 `Snippet` types and the `{@render ...}` tag for passing content.
- **Restriction:** Avoid using the old `<slot />` element.

```svelte
<script lang="ts">
	import type { Snippet } from 'svelte';
	let { children }: { children: Snippet } = $props();
</script>

<div>
	<!-- ✅ Correct Svelte 5 -->
	{@render children()}
</div>
```

## 5. Lifecycle and Effects

- **Rule:** Use `$effect` for side effects (e.g., syncing with DOM or APIs). Minimize use of `onMount` or `onDestroy` unless specifically interacting with third-party libraries that require them.
- **Rule:** `$effect` may only be created during component initialisation (or inside another effect / an explicit `$effect.root`). A helper that creates one is therefore an _init-time_ helper: it must be called from a component's `<script>`, never lazily from an event handler, a `$derived`, or module top level. Calling it anywhere else fails with `effect_orphan`.
- **Consequence:** A factory that creates effects internally — `createDataTable`, a query client, a state class with `$effect` — must be constructed by the component that owns it. If a file cannot do that (a `.stories.svelte` file, a plain module), move the construction into a child component.

## 6. Runes Outside Components (`.svelte.ts`)

- **Rule:** Runes only compile inside `.svelte` files and `.ts` files whose name ends in `.svelte.ts`. A plain `.ts` file cannot use `$state`, `$derived`, or `$effect` — the rune is left as an undefined identifier.
- **Rule:** The moment a shared module needs a rune, rename it to `<name>.svelte.ts` and update its imports (the import specifier drops the `.ts`, so `./project.store.svelte.ts` is imported as `./project.store.svelte`).
- **Example:** `project.store.svelte.ts`, `popover.state.svelte.ts`, `data-table.features.svelte.ts`.
- **Prefer:** Keep pure logic in a plain `.ts` file so it stays unit-testable in the node test project. Only the rune-bearing part needs the `.svelte.ts` suffix.

## 7. Svelte Libraries and Vite Pre-Bundling

- **Rule:** Every dependency that ships Svelte components or calls runes must be listed in `optimizeDeps.exclude` in `vite.config.ts`.
- **Why:** A pre-bundled dependency resolves its own copy of the Svelte runtime. Effects it creates then register against a different `active_effect` than the app's component tree. Where that throws you get `effect_orphan` from inside the library; where it does not, reactivity silently never propagates — the far worse failure, because it looks like a logic bug in your own code.
- **Symptom to recognise:** a stack trace where the library frame and the Svelte frame come from different paths (`node_modules/.vite/deps/…` vs `node_modules/svelte/src/…`).
