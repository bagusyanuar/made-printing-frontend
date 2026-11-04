---
name: naming-convention
description: How to name every file, folder, type, and export in this repo — the kebab-case dot-suffix vocabulary for TypeScript modules, PascalCase for Svelte components and types, and the test suffix that decides which vitest project a spec runs in. Use when creating any new file, naming an export, adding a spec or story, or checking whether an existing name is correct.
---

# Naming Conventions

Naming here is a lookup, not a judgement call. Find the row, copy the shape.

## By Case

| Thing                  | Case                      | Example                                                   |
| ---------------------- | ------------------------- | --------------------------------------------------------- |
| Svelte component file  | `PascalCase.svelte`       | `ProjectCard.svelte`, `CardFooter.svelte`                 |
| Directory              | `kebab-case`              | `master-area/`, `area-table/`, `sto-editor/`              |
| TypeScript module      | `kebab-case` + dot suffix | `master-area.mapper.ts`, `button.variants.ts`             |
| Variable, function     | `camelCase`               | `isLoading`, `fetchProjectList()`                         |
| Exported constant      | `UPPER_SNAKE_CASE`        | `MOCK_FLAGS`, `REDIRECT_PARAM`, `TOAST_DEFAULT_DURATION`  |
| Interface, type, class | `PascalCase`              | `MasterArea`, `SessionStatus`, `MasterAreaRepositoryImpl` |

Two exceptions to PascalCase-for-components: SvelteKit's own `+page.svelte` and `+layout.svelte` keep the framework's names.

**Never prefix an interface with `I`.** `MasterArea`, not `IMasterArea`. The filename is kebab-case while the type inside stays PascalCase — `result.ts` exports `Result`, `app-error.ts` exports `AppError`.

## The Dot-Suffix Vocabulary

A TypeScript filename is `<subject>.<role>.ts`. The subject is the feature for feature code (`master-area.*`) or the component for primitives (`button.*`). The role is one of these — do not invent a new one:

**Feature layers**

| Suffix                | Layer                   | Holds                                       |
| --------------------- | ----------------------- | ------------------------------------------- |
| `.entity.ts`          | domain                  | Shapes the UI works with                    |
| `.repository.ts`      | domain                  | The repository interface                    |
| `.schema.ts`          | domain                  | Zod rules for **forms** (business policy)   |
| `.dto.ts`             | infrastructure          | Backend JSON as plain types, no zod         |
| `.validator.ts`       | infrastructure          | Zod rules for **responses** (wire contract) |
| `.mapper.ts`          | infrastructure          | DTO ↔ Entity conversion                     |
| `.repository.impl.ts` | infrastructure          | Real HTTP implementation                    |
| `.repository.mock.ts` | infrastructure          | Mock implementation                         |
| `.container.ts`       | application             | Composition root, reads `MOCK_FLAGS`        |
| `.use-cases.ts`       | application             | Operations the UI invokes                   |
| `.store.svelte.ts`    | application             | Feature-wide runes state                    |
| `.guard.ts`           | presentation/guards     | Route redirect rule                         |
| `.query-keys.ts`      | presentation/hooks      | TanStack Query key factory                  |
| `.columns.ts`         | presentation/components | TanStack Table column defs                  |

**UI primitives** (`src/lib/components/ui/<name>/`)

| Suffix             | Holds                                         |
| ------------------ | --------------------------------------------- |
| `.variants.ts`     | The `cva()` definition and its `VariantProps` |
| `.types.ts`        | Props and public types for the primitive      |
| `.context.ts`      | Svelte context key + getter/setter pair       |
| `.state.svelte.ts` | The primitive's runes state class             |
| `.utils.ts`        | Pure helpers for that primitive               |

**Hooks** use a prefix, not a suffix: `use-<name>.svelte.ts` in `presentation/hooks/` — `use-master-area-form.svelte.ts`, `use-login-form.svelte.ts`.

**Column files are named after their folder, not the feature:** `components/area-table/area-table.columns.ts`, not `master-area.columns.ts`.

## `.svelte.ts` Is Load-Bearing

The `.svelte.ts` suffix is what lets runes compile in a non-component file. It is not decoration.

- Use it **only** when the module actually contains `$state`, `$derived`, or `$effect`.
- Keep rune-free logic in a plain `.ts` so it runs in the fast node test project.

`master-area.query-keys.ts` is plain `.ts` — a key factory has no reactivity. `sidebar.state.svelte.ts` has the suffix because it holds `$state`.

## The Test Suffix Picks The Runner

This is the naming rule with real teeth. The suffix decides which project executes the file — get it wrong and the test silently never runs, or runs in an environment where it cannot work.

| Filename ends with                    | Project     | Environment             | Command                           |
| ------------------------------------- | ----------- | ----------------------- | --------------------------------- |
| `.svelte.spec.ts` / `.svelte.test.ts` | `client`    | Chromium via Playwright | `npx vitest run --project client` |
| `.spec.ts` / `.test.ts`               | `server`    | Node                    | `npx vitest run --project server` |
| `.e2e.ts`                             | Playwright  | Real browser, built app | `npx playwright test`             |
| `.stories.svelte`                     | `storybook` | Chromium                | `npm run storybook`               |

Pick the suffix from **where the test needs to run**, not by mirroring the filename:

```
auth.store.svelte.ts        →  auth.store.spec.ts              (node — logic only)
theme.store.svelte.ts       →  theme.store.svelte.spec.ts      (browser — touches localStorage/DOM)
Sidebar.svelte              →  Sidebar.svelte.spec.ts          (browser — renders)
sidebar.nav.ts              →  sidebar.nav.spec.ts             (node — pure function)
master-area.mapper.ts       →  master-area.mapper.spec.ts      (node — pure function)
```

Both store files hold runes; they differ because one needs a DOM and the other does not. Default to node — it is the fastest suite and the one to run first.

Storybook stories sit next to their component: `Button.svelte` → `Button.stories.svelte`.

## Barrel Files

Every UI primitive folder has an `index.ts`. Two shapes are in use, both fine:

```ts
// card/index.ts — re-export by name
export { default as Card, type CardProps } from './Card.svelte';
export { default as CardFooter, type CardFooterProps } from './CardFooter.svelte';
export * from './card.context';
export * from './card.variants';
```

```ts
// button/index.ts — Root alias plus named export
import Root from './Button.svelte';
import { buttonVariants, type ButtonVariantProps } from './button.variants';

export { Root, Root as Button, buttonVariants, type ButtonVariantProps };
```

Consumers import from the folder, never from the file inside it:

```ts
import { Button } from '$lib/components/ui/button'; // yes
import Button from '$lib/components/ui/button/Button.svelte'; // no
```

## Export Names

Follow the verb the layer already uses, so a name predicts its layer:

| Pattern                          | Layer                     | Real example                            |
| -------------------------------- | ------------------------- | --------------------------------------- |
| `map<Subject>DtoToEntity`        | mapper                    | `mapMasterAreaDtoToEntity`              |
| `map<Subject>InputToDto`         | mapper                    | `mapMasterAreaInputToDto`               |
| `create<Subject>UseCases`        | use-cases factory         | `createMasterAreaUseCases`              |
| `<subject>UseCases`              | use-cases singleton       | `masterAreaUseCases`                    |
| `<subject>Repository`            | real repository instance  | `masterAreaRepository`                  |
| `<subject>RepositoryMock`        | mock instance             | `masterAreaRepositoryMock`              |
| `<subject>RepositoryInstance`    | container's resolved pick | `masterAreaRepositoryInstance`          |
| `<subject>Keys`                  | query key factory         | `masterAreaKeys`                        |
| `use<Subject>Form`               | form hook                 | `useMasterAreaForm`                     |
| `create<Subject>Columns`         | column factory            | `createAreaTableColumns`                |
| `<name>Variants`                 | cva definition            | `buttonVariants`                        |
| `<Name>Dto` / `<Name>RequestDto` | wire types                | `MasterAreaDto`, `MasterAreaRequestDto` |
| `<Name>Input`                    | what a form produces      | `MasterAreaInput`                       |

## Known Drift — Do Not Copy

Seven files break the kebab-case rule, all of them in `dashboard/`:

```
dashboard/presentation/components/AddProjectTypes.ts
dashboard/presentation/components/CalendarTypes.ts
dashboard/presentation/components/ManpowerTypes.ts
dashboard/presentation/components/master-role/RoleTypes.ts
dashboard/presentation/components/master-user/UserTypes.ts
dashboard/presentation/components/planner/PlannerTypes.ts
dashboard/presentation/components/sto-editor/StoTypes.ts
```

They should be `<subject>.types.ts` — the shape used everywhere in `src/lib/components/ui/` (`sidebar.types.ts`, `dialog.types.ts`, `combobox.types.ts`). New type files use the kebab form. Rename an existing one only when already editing that file for another reason, and never as an unrequested sweep — the import sites move with it.

## Check

```sh
npm run lint     # prettier + eslint
npm run check    # svelte-check; a wrong import path from a rename fails here
```

Before adding a file, ask in order:

1. Which layer owns it? → picks the folder
2. What role does it play? → picks the dot suffix from the vocabulary above
3. Does it contain runes? → decides `.svelte.ts` versus `.ts`
4. If it is a test, where must it run? → decides `.spec.ts` versus `.svelte.spec.ts` versus `.e2e.ts`
