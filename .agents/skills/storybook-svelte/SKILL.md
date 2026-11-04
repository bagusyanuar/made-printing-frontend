---
name: storybook-svelte-guidance
description: Guidelines for writing Storybook stories in Svelte 5 using @storybook/addon-svelte-csf. Trigger this when generating, fixing, or modifying .stories.svelte files.
---

# Storybook for Svelte 5 Guidelines

When writing stories using `@storybook/addon-svelte-csf` for Svelte 5, follow these critical rules to avoid double-rendering bugs, illegal DOM nesting, and styling issues.

<CRITICAL_RULES>

## CRITICAL RULES FOR @storybook/addon-svelte-csf

1. **Avoid Double Rendering & Component Wrapper Trap:**
   When `component: Component` is defined in `defineMeta`, Storybook automatically wraps every `<Story>`'s content in `<Component>`.
   - **DO NOT** manually instantiate `<Component>` inside `<Story>` unless using `asChild`.
   - **DO NOT** use `{#snippet children()}` with container wrappers (e.g., `<div class="dark">`) inside `<Story>` without `asChild`, as it causes `<Component><div...><Component>...</Component></div></Component>` nesting!

2. **Mandatory `asChild` for Composed & Container Stories:**
   - Whenever a story renders custom layouts, multiple components, or wrapper containers (e.g., Dark Mode previews, grid galleries, composed cards), **YOU MUST** set the `asChild` prop on `<Story name="..." asChild>`.
   - Example of correct container story:
     ```svelte
     <Story name="Dark Mode" asChild>
     	<div class="dark flex flex-wrap items-center gap-4 bg-slate-950 p-8">
     		<Button variant="default">Default</Button>
     		<Button variant="secondary">Secondary</Button>
     	</div>
     </Story>
     ```

3. **Pass Props via `args` for Single Component Stories:**
   - For regular stories of the component defined in `defineMeta`, pass props via `args` and place inner text/children directly inside the `<Story>` tag.
   - Example:
     ```svelte
     <Story name="Primary" args={{ variant: 'default' }}>Click Me</Story>
     ```

</CRITICAL_RULES>

## 1. Avoid Double Rendering (The "Component Wrapper" Trap)

When you define a `component` in the `defineMeta` block, Storybook automatically wraps the content of your `<Story>` tags with that component.

**INCORRECT (Do NOT do this):**

```svelte
<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import Button from './Button.svelte';

	const { Story } = defineMeta({
		title: 'UI/Button',
		component: Button // Storybook knows about the component here
	});
</script>

<!-- ❌ BAD: This will render <Button><Button>Default Button</Button></Button> -->
<Story name="Default">
	<Button variant="default">Default Button</Button>
</Story>

<!-- ❌ BAD: This will render <Button><div class="dark"><Button>...</Button></div></Button> -->
<Story name="Dark Mode">
	{#snippet children()}
		<div class="dark">
			<Button variant="default">Default</Button>
		</div>
	{/snippet}
</Story>
```

_Why this is bad:_ This causes padding, margins, and borders to be applied twice, creates invalid HTML element nesting (`<button>` inside `<button>`), and creates visual bugs.

**CORRECT (Pass props via `args` or use `asChild`):**

```svelte
<!-- ✅ GOOD (Single component): Pass props as `args` and text as children -->
<Story name="Default" args={{ variant: 'default' }}>Default Button</Story>

<!-- ✅ GOOD (Composed / Container story): Use `asChild` to disable component auto-wrapping -->
<Story name="Dark Mode" asChild>
	<div class="dark flex flex-wrap items-center gap-4 bg-slate-950 p-8">
		<Button variant="default">Default</Button>
	</div>
</Story>
```

## 2. Children and Snippets

In Svelte 5, component children are passed via snippets. When using the `args` prop on a `<Story>`, the inner text/HTML content of the `<Story>` tag automatically acts as the default children for the component defined in `defineMeta`. Do not manually wrap it in the component again.

## 3. Never Build an Effect-Bearing Instance in the Stories File

The CSF indexer mounts a `.stories.svelte` file to collect its story metadata, and it does so outside a normal component initialisation. Anything in the instance script that creates a `$effect` therefore fails with `effect_orphan`, and one broken stories file takes the whole `vitest --project storybook` run down with it — every other stories file reports `SB_SVELTE_CSF_PARSER_EXTRACT_SVELTE_0009`.

This covers TanStack Table instances (`createDataTable`), query clients, and any state class that sets up an effect.

**INCORRECT:**

```svelte
<script lang="ts">
	// ❌ Runs during metadata extraction → effect_orphan
	const table = createDataTable<Project>({ columns, data });
</script>

<Story name="Default" asChild>
	<DataTable {table} />
</Story>
```

**CORRECT — build it in a child component and drive that component with `args`:**

```svelte
<script module lang="ts">
	import DataTableDemo from './DataTable.demo.svelte';

	const { Story } = defineMeta({ title: 'UI/DataTable', component: DataTableDemo });
</script>

<Story name="Many Pages" args={{ rowCount: 240, pageSize: 10 }} />
```

The wrapper doubles as the harness for browser specs, so the story and the test exercise the same setup.

## 4. Tailwind CSS Integration

Always ensure that the global layout CSS (which imports Tailwind) is included in the Storybook preview configuration.

- Check `.storybook/preview.ts` or `.storybook/preview.js`
- Ensure it contains `import '../src/routes/layout.css';` (or the equivalent global CSS file) so that Tailwind utility classes work correctly in the Storybook canvas.
