# Naming Conventions

This project strictly follows the naming conventions outlined below to ensure a clean, readable, and consistent codebase.

## 1. Svelte Components

- **Rule:** `PascalCase`
- **Reason:** Differentiates Svelte components from standard HTML elements.
- **Example:** `ProjectCard.svelte`, `PrimaryButton.svelte`.

## 2. Directories and Folders

- **Rule:** `kebab-case`
- **Reason:** URL-friendly (important for SvelteKit routing) and avoids cross-platform case-sensitivity issues.
- **Example:** `src/features/project-management/`, `src/lib/ui-components/`.

## 3. TypeScript Files (Business Logic & Architecture)

- **Rule:** `kebab-case` with dot notation indicating the architectural layer/role.
- **Example:**
  - `project.entity.ts` (Domain Layer)
  - `project.schema.ts` (Domain Layer — zod schemas for business/form rules)
  - `project.repository.ts` (Domain Layer — the contract)
  - `project.dto.ts` (Infrastructure Layer — plain types for the wire format, no zod)
  - `project.validator.ts` (Infrastructure Layer — zod schemas validating backend responses)
  - `project.mapper.ts` (Infrastructure Layer)
  - `project.repository.impl.ts` / `project.repository.mock.ts` (Infrastructure Layer)
  - `project.container.ts` (Application Layer — composition root)
  - `project.use-cases.ts` (Application Layer)
  - `project.store.svelte.ts` (Application/State Layer)
  - `project.guard.ts` (Presentation/Guards Layer — `presentation/guards/`)
  - `use-project-filter.svelte.ts` (Presentation/Hooks Layer — `presentation/hooks/`)
  - `project-table.columns.ts` (Presentation/Components Layer — TanStack Table column defs, in `presentation/components/project-table/`, named after the folder it lives in, not the feature)
  - `format-date.ts` (Generic Utility)
- **Rule:** Component-local reactive state files in `presentation/hooks/` follow `use-[name].svelte.ts`, mirroring the `use` prefix convention for hook-like modules. Keep these scoped to a single feature's UI concerns — anything shared feature-wide belongs in `application/[feature].store.svelte.ts` instead.
- **Rule:** This applies to shared files too — `result.ts`, `app-error.ts`, `api-response.ts`, not `Result.ts` or `AppError.ts`. The exported type stays `PascalCase`; only the filename is kebab-case.
- **Rule:** The `.svelte.ts` suffix is not decorative — it is what allows runes to compile in a non-component file. Use it only when the module actually contains `$state`, `$derived`, or `$effect`, and keep rune-free logic in a plain `.ts` file so it stays unit-testable outside the browser.

## 4. Variables and Functions

- **Rule:** `camelCase`
- **Reason:** Standard JavaScript/TypeScript convention.
- **Example:** `fetchProjectList()`, `isLoading`, `projectData`.

## 5. Constants

- **Rule:** `UPPER_SNAKE_CASE`
- **Reason:** Indicates that the value is immutable and global.
- **Example:** `MAX_UPLOAD_SIZE`, `API_BASE_URL`.

## 6. Interfaces, Types, and Classes

- **Rule:** `PascalCase`
- **Rule Exception:** Do NOT prefix Interfaces with an `I` (e.g., use `Project` instead of `IProject`). This is considered a TypeScript anti-pattern.
- **Example:** `interface ProjectEntity`, `type TaskStatus`, `class ProjectRepository`.
