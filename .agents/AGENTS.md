# Global Agent Rules

These rules apply to all interactions within this workspace (`made-printing-frontend`).

## Project Architecture

- We strictly follow the architecture outlined in [architecture rules](./rules/architecture.md). Always refer to this document before generating new code, files, or folders related to business logic and UI presentation.
- **This app is a client-side SPA** (`adapter-static` + `ssr = false`). `+page.server.ts`, form actions and `hooks.server.ts` never run — never generate them. Data fetching happens in the browser through use-cases/queries, and `+page.ts` / `+layout.ts` are for guards and redirects only.

## Naming Conventions

- We strictly follow the naming conventions outlined in [naming conventions](./rules/naming-convention.md). Always refer to this document to ensure variables, files, folders, and components are named correctly.

## Styling (Tailwind CSS)

- We strictly follow the styling conventions outlined in [tailwind rules](./rules/tailwind.md). Always refer to this document for guidance on using Tailwind CSS utility classes, structuring styling, and handling conditional classes.

## Design System & Aesthetics

- We strictly follow the design aesthetics outlined in [design-system rules](./rules/design-system.md). Always refer to this document before generating UI layouts to ensure a premium, modern, and non-generic user interface (Anti-AI Slop).

## Visual Style (Soft Minimal SaaS)

- The project's single visual language is **Soft Minimal SaaS**, defined in [soft-minimal-saas rules](./rules/soft-minimal-saas.md). Read it before writing any page, card, chart, or control. It supersedes conflicting guidance in older layout and design docs.

## Layout Structure

- We strictly follow the layout guidelines outlined in [layout structure rules](./rules/layout-structure.md). Always refer to this document to ensure consistent use of the labelled Sidebar, Sticky Header, and approved column grids across all dashboard pages.

## Page Slicing

- We strictly follow the slicing guidelines outlined in [page slicing rules](./rules/page-slicing.md). Always refer to this document before slicing a new page or view — reuse existing components first, and structure the DOM with semantic HTML per content context.

## Svelte 5 Best Practices

- We strictly follow the Svelte 5 paradigms outlined in [svelte best practices](./rules/svelte-best-practices.md). Always refer to this document to ensure the correct use of Runes, Snippets, and event props, and avoid deprecated Svelte 4 syntax.

## Type Safety

- We strictly follow the type safety guidelines outlined in [type safety rules](./rules/type-safety.md). Always refer to this document to ensure the prohibition of `any` and proper usage of Zod for runtime validation.

## Testing

- We strictly follow the testing guidelines outlined in [testing rules](./rules/testing.md). Always refer to this document before adding a test — the filename suffix decides which of the test suites it runs in.

## Digital Printing ERP Domain & Semantics

- We strictly follow the business domain vocabulary, product categories, calculation models, and status semantics documented in [digital printing ERP domain rules](./rules/digital-printing-erp-domain.md). Never invent generic terms or rename domain-specific concepts (SPK, Pre-press, Nesting, Click Count, Kiss Cut/Die Cut, Finishing, Mata Ayam, Seaming, dsb).

<CRITICAL_RULES>

- **Strict Prohibition of `any` Type**: The use of the `any` type is strictly forbidden anywhere in the codebase. Always use explicit types/interfaces or `unknown` with type narrowing and Zod validation.
- **Mandatory Runtime Validation of API Responses**: Never read `response.data.data` directly. Every response passes through `parseApiResponse(schema, response.data)` before it reaches a mapper. A type annotation is a claim about the backend, not a check on it.
- **Mock Selection Belongs to `MOCK_FLAGS`**: The choice between `.repository.mock.ts` and `.repository.impl.ts` is made only in `$lib/shared/infrastructure/di/mock-config.ts`, resolved by the feature's `[feature].container.ts`. Never put a `useMock` flag inside a use-case, a store, or a component.
- **Svelte 5 Runes Only**: `$props()`, not `export let`. `onclick`, not `on:click`. Snippets with `{@render ...}`, not `<slot />`. No `$:` reactive statements.
- **Client-Side SPA Paradigm**: No server-only SvelteKit files (`+page.server.ts`, `hooks.server.ts`). All business logic and UI runs in the browser.
- **No Manual Component Wrapping in Stories**: When `component` is set in `defineMeta`, `<Story>` automatically wraps its content with that component. Pass props via `args` instead of instantiating the component manually.
- **Mandatory `asChild` for Composed & Container Stories**: Whenever writing stories with wrapper containers (e.g. `<div class="dark">`) or multiple component instances inside `<Story>`, **ALWAYS** use `<Story name="..." asChild>` to prevent double rendering and invalid DOM element nesting.
- **Zero Dashed Borders & No AI Slop Dashes**: Never use `border-dashed` or `border-dotted` in UI markup (empty states, upload zones, cards). Avoid excessive em-dashes (`—`) and repetitive hyphenated phrasing in UI text, code comments, and vibe coding.
  </CRITICAL_RULES>
