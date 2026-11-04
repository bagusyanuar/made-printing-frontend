# Frontend Architecture Rules (Clean Architecture + DDD)

## 1. Core Philosophy

This project strictly follows Clean Architecture, Domain-Driven Design (DDD), and Feature-Based modularization. The goal is to decouple the UI from business logic, and the business logic from external data sources (Backend API).

## 2. Decoupling Domain and Infrastructure (Anti-Corruption Layer)

To prevent backend payload changes from breaking the frontend UI, we strictly separate Data Transfer Objects (DTO) from Domain Entities using Mappers.

- **DTO (Data Transfer Object)**: An explicit TypeScript type describing the raw JSON exactly as returned by the Backend (`[feature].dto.ts`), paired with a Zod schema in `[feature].validator.ts` pinned to it via `satisfies`.
- **Domain Entity**: Represents the clean, typed data structure used by the Frontend components.
- **Mapper**: A pure function that converts DTOs to Domain Entities (and vice versa for requests).

**Data Flow:** `API Response` -> `parseApiResponse` (runtime validation) -> `DTO` -> `Mapper` -> `Domain Entity` -> `UI/Application`.

The validation step is not optional. TypeScript types vanish at runtime, so an unvalidated response means a backend contract change reaches the UI as a silent wrong value — a `null` date becoming `Invalid Date`, a renamed field becoming `undefined` — instead of a caught error. `parseApiResponse` throws an `AppError` with code `INVALID_RESPONSE`, and because repositories call it inside `safeApiCall`, callers still receive a normal `Result.error`.

## 3. Directory Structure

Code is grouped by Feature in the `src/features/` directory.

### `src/features/[feature-name]/`

- **`domain/`**: The core logic. Contains pure TypeScript files. No external imports (`zod` is the one exception, for schemas).
  - `[feature].entity.ts`: Interfaces/types for Domain Entities.
  - `[feature].repository.ts`: Interface representing the repository contract (e.g. `AuthRepository`).
  - `[feature].schema.ts`: Zod schemas for **business rules** — what a valid form submission looks like (`loginSchema`, `createProjectSchema`), pinned to the entity they validate with `satisfies`.

    These stay in the domain even though zod is an import. The rule "domain has no external imports" means domain knows nothing about the outside **world** — no axios, no browser, no backend — and a form schema knows about none of those. Moving it to `infrastructure/` would force `presentation/hooks/use-*-form.svelte.ts` to import from the outermost ring, which inverts the dependency rule; it would also couple "the backend renamed a field" and "the password minimum changed" into one file. Wire format and business policy are different schemas with different reasons to change.
- **`infrastructure/`**: The outer layer connecting to external APIs.
  - `[feature].dto.ts`: The Backend JSON payload as plain TypeScript types, **no zod**. Request DTOs have no schema at all — their contents come from a form the domain schema already validated, so there is no untrusted boundary left to check.
  - `[feature].validator.ts`: Every runtime check on backend responses for this feature, in one file. Each schema is pinned to its DTO with `satisfies z.ZodType<SomeDto>`, so a schema that drifts from the declared contract fails to compile. Only responses live here — form rules are business policy and stay in `domain/[feature].schema.ts`.
  - `[feature].mapper.ts`: Pure functions converting `DTO` -> `Entity` **and** `Entity` -> request `DTO`. Both directions are mandatory: a domain object must never be sent to the wire as-is.
  - `[feature].repository.impl.ts`: Class implementing the domain repository interface. Performs HTTP calls, validates the response with `parseApiResponse`, returns mapped Domain Entities wrapped in `safeApiCall`.
  - `[feature].repository.mock.ts`: Mock implementation for frontend-first development. It must honour the **same behavioural contract** as the real one, not just the type signature — if the real `getProfile` fails without a session, the mock must hold in-memory session state and fail too. A mock that always succeeds silently breaks every guard built on it.
- **`application/`**: Use cases and state management.
  - `[feature].container.ts`: The feature's composition root. The only module allowed to choose between `.mock.ts` and `.impl.ts`, and it decides by reading `MOCK_FLAGS` (see below). Never put that choice inside a use-case.
  - `[feature].use-cases.ts`: Business logic orchestrating repositories and state. Exported as a **factory** taking the repository as an argument (`createAuthUseCases(repository)`), plus a pre-wired singleton built from the container. The factory is what makes use-cases testable without module mocking.
  - `[feature].store.svelte.ts`: Svelte 5 Runes (`$state`, `$derived`) managing feature state. Export the class as well as the singleton so tests can construct it with fake use-cases.
- **`presentation/`**: Feature-specific UI, split into four sub-folders:
  - `pages/`: Route-level compositions rendered directly by `src/routes/[route]/+page.svelte` (e.g. `ProjectListPage.svelte`).
  - `components/`: Reusable presentational pieces used across pages within this feature (e.g. `ProjectCard.svelte`).
    - A table's column-definition file (`[view].columns.ts`) plus the small cell/badge/action components only that table uses go in their own `components/[subject]-table/` subfolder (kebab-case, named by what it displays — e.g. `area-table/` holding `area-table.columns.ts`, `AreaTypeBadge.svelte`, `AreaRowActions.svelte`). Group by subject, not by file kind: a `columns/` + `badges/` + `actions/` split scatters one table's pieces across three folders that must all be opened for a single change. Keep this flat until a feature genuinely has more than one distinct table — a feature that keeps growing new tables is a sign it should split into a new feature, not grow more subfolders.
  - `hooks/`: Component-local reactive state, extracted out of a component when it's non-trivial (e.g. `use-project-filter.svelte.ts`). Scoped to this feature's presentation layer only — feature-wide shared state still belongs in `application/[feature].store.svelte.ts`, never here.
    - TanStack Query key factories also live here as `[feature].query-keys.ts` (plain `.ts`, no runes), colocated with the `createQuery`/`createMutation` hooks that produce and invalidate them. Keep them out of `application/` — query caching is a presentation concern, not repository orchestration, and application code must never import from presentation.
  - `guards/`: Route guards called from `+layout.ts` / `+page.ts` (e.g. `auth.guard.ts`). They belong to the feature that owns the rule, and they are the only presentation modules a route load function may import.

### `src/lib/`

Contains global, cross-feature shared code.

- `components/`: Reusable, generic UI components (Buttons, Modals, Inputs).
- `utils/`: Global helper functions.
- `shared/`: Shared architectural layers across all features.
  - `domain/`: Internal core logic and types (`result.ts`, `app-error.ts`, `pagination.ts`).
  - `infrastructure/`: External integrations and global mappers.
    - `api/axios-client.ts`: Axios instance, refresh-token queue. Knows nothing about stores or routing — a dead session is reported through `setUnauthorizedHandler()`, which the auth store registers a callback on.
    - `api/api-schema.ts`: `parseApiResponse()`, `apiEnvelopeSchema`, `dateStringSchema`, `paginationMetaSchema`.
    - `api/safe-api-call.ts`, `mappers/error.mapper.ts`: `Result` wrapping and error normalisation.
    - `di/mock-config.ts`: `MOCK_FLAGS` — one entry per feature, the single place mocks are switched on or off. Deliberately a plain const, not an env var, so each feature is flipped independently and Vite can dead-code-eliminate the unused branch. Audit this file before every release.

**Direction rule:** `shared/` must never import from `features/`. A feature container imports `MOCK_FLAGS`, not the other way around.

### `src/routes/`

The Delivery Mechanism. This is strictly for SvelteKit file-based routing.

- `+page.svelte`: Imports components from `src/features/[feature]/presentation/` via the `$features` alias — never a relative `../../features/…` chain.
- `+layout.ts` / `+page.ts`: Route guards and redirects only. **Not** data fetching — see the SPA section below.

Route groups carry the guard so individual pages don't have to:

```
src/routes/
  +page.ts                  redirect to the landing page for the current session
  (auth)/+layout.ts         requireGuest()
  (auth)/login/+page.svelte
  (app)/+layout.ts          requireAuth()
  (app)/[feature]/…         every page inside is guarded automatically
```

## 4. This Project Is an SPA, Not SSR

`adapter-static` with `fallback: 'index.html'` plus `ssr = false` in the root `+layout.ts`. Everything runs in the browser. Consequences that override the usual SvelteKit advice:

- **`+page.server.ts`, `+layout.server.ts`, form actions and `hooks.server.ts` never run.** Do not create them.
- **Data fetching lives in `presentation/hooks/`** via TanStack Query, which calls use-cases. `+page.ts` load functions are for guards and redirects, not for fetching — two fetching paths mean two caches that never agree.
- **Forms** use `superForm` with `SPA: true` and `defaults(zod4(schema))`, submitted through `onUpdate`. See the [superforms-zod skill](../skills/superforms-zod/SKILL.md).
- **Guards are client-side only.** They are a UX affordance, never a security boundary — the backend must authorize every endpoint on its own. A guard must `await store.ensureSession()` before reading auth state, otherwise a page reload looks anonymous while the profile request is still in flight.
- **Env vars are `VITE_*` only** and are inlined into the bundle. Never put a secret in one.
- **Session survives reload only through the backend.** There is no server to hydrate from, so the app calls `getProfile()` once on boot. Make that call single-flight so concurrent layout loads share it.

## 5. State Management

- Strictly use Svelte 5 Runes (`$state`, `$derived`, `$effect`) for all reactivity.
- Do not use old Svelte 4 `writable` stores.
- Session-shaped state needs a tri-state status (`unknown` | `authenticated` | `anonymous`), not a boolean. A boolean cannot distinguish "not logged in" from "not checked yet", and guards will fire on the wrong one.
