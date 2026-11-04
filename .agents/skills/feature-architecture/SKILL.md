---
name: feature-architecture
description: Clean Architecture + DDD layering for src/features. Use when creating a new feature, wiring a new backend endpoint, or writing an entity, DTO, validator, mapper, repository, use-case, container, store, route guard, or TanStack Query hook — and whenever deciding which layer a file belongs in or why a layer may not import another.
---

# Feature Architecture

Four layers per feature, one direction of dependency. `master-area` is the reference implementation; read it when this document is ambiguous.

```
src/features/<feature>/
  domain/            pure. knows nothing about the outside world
  infrastructure/    HTTP, DTOs, mappers. knows the backend
  application/       use-cases, container, store. orchestrates
  presentation/      Svelte UI, hooks, guards. renders
```

**Dependency direction:** `presentation` → `application` → `domain`, and `infrastructure` → `domain`. Nothing points back inward. `application` may never import from `presentation`. `src/lib/shared/` must never import from `src/features/`.

## Which Layer Does This File Go In

| The thing you are writing                    | Layer                                      | Filename                                             |
| -------------------------------------------- | ------------------------------------------ | ---------------------------------------------------- |
| Shape the UI works with                      | `domain`                                   | `<feature>.entity.ts`                                |
| Interface listing what the backend can do    | `domain`                                   | `<feature>.repository.ts`                            |
| Zod rules for a **form** (business policy)   | `domain`                                   | `<feature>.schema.ts`                                |
| Backend JSON shape, as plain types           | `infrastructure`                           | `<feature>.dto.ts`                                   |
| Zod rules for a **response** (wire contract) | `infrastructure`                           | `<feature>.validator.ts`                             |
| DTO ↔ Entity conversion                      | `infrastructure`                           | `<feature>.mapper.ts`                                |
| Real HTTP calls                              | `infrastructure`                           | `<feature>.repository.impl.ts`                       |
| Fake data for frontend-first work            | `infrastructure`                           | `<feature>.repository.mock.ts`                       |
| Choosing mock vs real                        | `application`                              | `<feature>.container.ts`                             |
| Operations the UI invokes                    | `application`                              | `<feature>.use-cases.ts`                             |
| Feature-wide reactive state                  | `application`                              | `<feature>.store.svelte.ts`                          |
| Route-level page composition                 | `presentation/pages`                       | `<Feature>Page.svelte`                               |
| Reused markup within the feature             | `presentation/components`                  | `PascalCase.svelte`                                  |
| A table's column defs + its own cells        | `presentation/components/<subject>-table/` | `<subject>-table.columns.ts`                         |
| A cell renderer only that table uses         | `presentation/components/<subject>-table/` | `PascalCase.svelte`, colocated next to `.columns.ts` |
| Query cache keys                             | `presentation/hooks`                       | `<feature>.query-keys.ts`                            |
| Component-local reactive state / form logic  | `presentation/hooks`                       | `use-<name>.svelte.ts`                               |
| Redirect rule for a route                    | `presentation/guards`                      | `<feature>.guard.ts`                                 |

A component used only as a table cell lives inside that table's own subfolder, not the shared `components/` root — `master-area` puts `AreaTypeBadge.svelte` and `AreaRowActions.svelte` next to `area-table.columns.ts` in `presentation/components/area-table/`, while `AreaFormModal.svelte`, reused outside the table, stays at `presentation/components/`.

Two schema files exist on purpose. A form schema and a response schema change for different reasons — "the password minimum moved" versus "the backend renamed a field". Merging them couples policy to wire format.

`.svelte.ts` is only for files that actually contain `$state` / `$derived` / `$effect`. Query keys are plain `.ts`. Keep rune-free logic in plain `.ts` so it runs in the fast `server` test project.

## Build Order

Work inward-out. Each step compiles before the next one starts.

### 1. `domain/<feature>.entity.ts`

The shape the UI wants — not the shape the backend sends. Ids are strings here even when the backend sends numbers.

```ts
export type MasterAreaType = 'internal' | 'external';

export interface MasterArea {
	id: string;
	code: string;
	name: string;
	type: MasterAreaType;
}

/** What a create/update form produces. */
export interface MasterAreaInput {
	code: string;
	name: string;
	type: MasterAreaType;
}
```

### 2. `domain/<feature>.repository.ts`

The contract. Every method returns `Result<T>` — never throws, never returns a raw axios response.

```ts
import type { Result } from '$lib/shared/domain/types/result';
import type { MasterArea, MasterAreaInput } from './master-area.entity';

export interface MasterAreaRepository {
	list(): Promise<Result<MasterArea[]>>;
	create(input: MasterAreaInput): Promise<Result<MasterArea>>;
	update(id: string, input: MasterAreaInput): Promise<Result<MasterArea>>;
}
```

`Result<T, E = AppError>` is `{ success: true; data: T } | { success: false; error: E }`.

### 3. `domain/<feature>.schema.ts`

Form rules. Pin with `satisfies`, never with a `: z.ZodType<T>` annotation — the annotation widens the variable and superForm loses `$form.<field>` inference. Messages are Indonesian, matching the UI.

```ts
import { z } from 'zod';
import type { MasterAreaInput } from './master-area.entity';

export const masterAreaSchema = z.object({
	code: z.string().min(1, 'Kode area wajib diisi').max(20, 'Kode area maksimal 20 karakter'),
	name: z.string().min(1, 'Nama area wajib diisi'),
	type: z.enum(['internal', 'external'])
}) satisfies z.ZodType<MasterAreaInput>;
```

### 4. `infrastructure/<feature>.dto.ts`

The backend contract spelled out as plain types. **No zod in this file.** Request DTOs get no schema at all — their contents already passed the domain schema, so there is no untrusted boundary left.

```ts
/** Request shape — already validated upstream by `masterAreaSchema`. */
export interface MasterAreaRequestDto {
	code: string;
	name: string;
	type: 'internal' | 'external';
}

/** Response shape — enforced at runtime by `master-area.validator.ts`. */
export interface MasterAreaDto {
	id: number;
	code: string;
	name: string;
	type: 'internal' | 'external';
}
```

### 5. `infrastructure/<feature>.validator.ts`

Every runtime check on responses for this feature, in one file. `satisfies` makes a schema that drifts from its DTO fail to compile.

```ts
import { z } from 'zod';
import type { MasterAreaDto } from './master-area.dto';

export const masterAreaDtoSchema = z.object({
	id: z.number(),
	code: z.string(),
	name: z.string(),
	type: z.enum(['internal', 'external'])
}) satisfies z.ZodType<MasterAreaDto>;
```

Dates arrive as strings: use `dateStringSchema` from `$lib/shared/infrastructure/api/api-schema`, not `z.string()`. It rejects anything `Date.parse` cannot read, so a bad value fails at the boundary instead of becoming `Invalid Date` three files later.

Know the limit of `satisfies`: it catches a **missing** or **contradicting** field, not an extra one, and the declared type is always the looser of the two. The type documents; the schema enforces.

### 6. `infrastructure/<feature>.mapper.ts`

Pure functions, both directions. A domain object must never go to the wire as-is.

```ts
export function mapMasterAreaDtoToEntity(dto: MasterAreaDto): MasterArea {
	return { id: String(dto.id), code: dto.code, name: dto.name, type: dto.type };
}

export function mapMasterAreaInputToDto(input: MasterAreaInput): MasterAreaRequestDto {
	return { code: input.code, name: input.name, type: input.type };
}
```

Mappers are pure, so they get a `<feature>.mapper.spec.ts` in the fast `server` suite. Write it.

### 7. `infrastructure/<feature>.repository.impl.ts`

Three moving parts per method, always in this order: call, `parseApiResponse`, map — all inside `safeApiCall`.

```ts
export class MasterAreaRepositoryImpl implements MasterAreaRepository {
	async list(): Promise<Result<MasterArea[]>> {
		return safeApiCall(async () => {
			const response = await axiosClient.get('/master-areas');
			const dtos = parseApiResponse(z.array(masterAreaDtoSchema), response.data);
			return dtos.map(mapMasterAreaDtoToEntity);
		});
	}

	async create(input: MasterAreaInput): Promise<Result<MasterArea>> {
		return safeApiCall(async () => {
			const response = await axiosClient.post('/master-areas', mapMasterAreaInputToDto(input));
			return mapMasterAreaDtoToEntity(parseApiResponse(masterAreaDtoSchema, response.data));
		});
	}
}

export const masterAreaRepository = new MasterAreaRepositoryImpl();
```

`parseApiResponse` unwraps the `{ message, data, meta? }` envelope and validates `data` against the schema. It **throws** an `AppError` with code `INVALID_RESPONSE`; `safeApiCall` converts that into `Result.error`, so callers still get a normal result.

Reading `response.data.data` directly is a violation. The `AxiosResponse<ApiResponse<T>>` annotation is a claim about the backend, not a check on it.

### 8. `infrastructure/<feature>.repository.mock.ts`

Must honour the same **behavioural** contract, not just the type signature. If the real `update` fails on a missing id, the mock fails too. A mock that always succeeds silently breaks every guard built on it.

```ts
export class MasterAreaRepositoryMock implements MasterAreaRepository {
	#areas: MasterArea[] = [...SEED];
	#nextId = SEED.length + 1;

	async list(): Promise<Result<MasterArea[]>> {
		await delay();
		return { success: true, data: [...this.#areas] };
	}

	async update(id: string, input: MasterAreaInput): Promise<Result<MasterArea>> {
		await delay();
		if (!this.#areas.some((area) => area.id === id)) {
			return { success: false, error: new NotFoundError('Area tidak ditemukan') };
		}
		// …
	}
}

export const masterAreaRepositoryMock = new MasterAreaRepositoryMock();
```

Keep the `delay()` — it exposes loading states that an instant mock would hide. Error classes live in `$lib/shared/domain/errors/app-error`: `UnauthorizedError`, `ForbiddenError`, `NotFoundError`, `ValidationError`, `InternalServerError`.

### 9. Register the flag

Add one entry to `MOCK_FLAGS` in `src/lib/shared/infrastructure/di/mock-config.ts`, camelCase:

```ts
export const MOCK_FLAGS = {
	auth: true,
	masterArea: true
} as const;
```

This is the **only** place mock selection is decided. A `useMock` flag anywhere else is a violation.

### 10. `application/<feature>.container.ts`

The composition root, and the only module allowed to read `MOCK_FLAGS`.

```ts
export const masterAreaRepositoryInstance: MasterAreaRepository = MOCK_FLAGS.masterArea
	? masterAreaRepositoryMock
	: masterAreaRepository;
```

### 11. `application/<feature>.use-cases.ts`

Export a **factory** taking the repository, plus a pre-wired singleton. The factory is what makes this testable without `vi.mock`.

```ts
export interface MasterAreaUseCases {
	list(): Promise<Result<MasterArea[], AppError>>;
	create(input: MasterAreaInput): Promise<Result<MasterArea, AppError>>;
}

export function createMasterAreaUseCases(repository: MasterAreaRepository): MasterAreaUseCases {
	return {
		list: () => repository.list(),
		create: (input) => repository.create(input)
	};
}

export const masterAreaUseCases = createMasterAreaUseCases(masterAreaRepositoryInstance);
```

A pass-through use-case is fine. It is the seam that lets orchestration land later without touching callers.

### 12. `application/<feature>.store.svelte.ts` — only when needed

Add this only for state the whole feature shares. Per-page or per-component state belongs in `presentation/hooks/`. Export the class as well as the singleton so tests can inject fake use-cases.

`master-area` has no store; `auth` does — `auth.store.svelte.ts` is the real file this pattern is drawn from, read it directly for the full class. Session-shaped state needs a tri-state, never a boolean:

```ts
export type SessionStatus = 'unknown' | 'authenticated' | 'anonymous';
```

A boolean cannot tell "not logged in" from "not checked yet", and guards fire on the wrong one. Anything resolved once per app load should be single-flight:

```ts
ensureSession(): Promise<void> {
  this.#hydration ??= this.#hydrate();
  return this.#hydration;
}
```

### 13. `presentation/hooks/<feature>.query-keys.ts`

Plain `.ts`, no runes. Key factories live in presentation because caching is a presentation concern — application code must never import from presentation.

```ts
export const masterAreaKeys = {
	all: ['master-area'] as const,
	lists: () => [...masterAreaKeys.all, 'list'] as const
};
```

### 14. Fetch in the page, not in a load function

`createQuery` calls the use-case and unwraps `Result` by throwing on failure, which is what TanStack Query expects.

```ts
const query = createQuery(() => ({
	queryKey: masterAreaKeys.lists(),
	queryFn: async () => {
		const result = await masterAreaUseCases.list();
		if (!result.success) throw result.error;
		return result.data;
	}
}));
```

Mutations go through a form hook that owns the submit branch and the invalidation together:

```ts
export function useMasterAreaForm(options: { onSuccess: () => void }) {
	const queryClient = useQueryClient();
	let editingId = $state<string | null>(null);

	const form = superForm(defaults(zod4(masterAreaSchema)), {
		SPA: true,
		validators: zod4(masterAreaSchema),
		resetForm: false,
		async onUpdate({ form: validated }) {
			if (!validated.valid) return;
			const result = editingId
				? await masterAreaUseCases.update(editingId, validated.data)
				: await masterAreaUseCases.create(validated.data);
			if (!result.success) {
				validated.message = result.error.message;
				return;
			}
			await queryClient.invalidateQueries({ queryKey: masterAreaKeys.lists() });
			options.onSuccess();
		}
	});
	// …
}
```

The page's own list state — the query, the table (columns, sorting, pagination, search), and any per-row dialog toggles (add/edit/delete) — gets the same treatment: a `use-<feature>-page.svelte.ts` hook, not logic left sitting in the `.svelte` file. `AreaPage.svelte`'s real hook, `use-area-page.svelte.ts`, is the worked example — it owns `createQuery`, `createDataTable`, and the modal/dialog `$state` together, and the page component becomes composition only:

```ts
export function useAreaPage() {
	const queryClient = useQueryClient();
	let isModalOpen = $state(false);
	let areaToEdit = $state<Area | null>(null);
	// … delete-dialog state, sorting, pagination, search — all the same way

	const query = createQuery(() => ({/* … */}));
	const table = createDataTable<Area>({/* … */});

	return {
		query,
		table,
		get search() {
			return search;
		},
		set search(value: string) {
			search = value;
		},
		get isModalOpen() {
			return isModalOpen;
		},
		set isModalOpen(value: boolean) {
			isModalOpen = value;
		}
		// … areaToEdit, handleAdd, confirmDelete, etc.
	};
}
```

A value the template needs `bind:` to (`bind:value={page.search}`, `bind:open={page.isModalOpen}`) is exposed as a `get`/`set` accessor pair, not a plain field — see the `svelte-runes` skill's State Classes section for why this is a deliberate exception to "getters only," not a contradiction of it. Everything else (`areaToEdit`, `isDeleting`, …) stays a read-only getter; the component never needs to write those directly, only the hook's own handlers do.

### 15. Wire the route

`src/routes/(app)/dashboard/<path>/+page.svelte` does nothing but compose:

```svelte
<script lang="ts">
	import MasterAreaPage from '$features/master-area/presentation/pages/MasterAreaPage.svelte';
</script>

<MasterAreaPage />
```

Use the `$features` alias, never a `../../features/…` chain. Guards already sit on the route group's `+layout.ts` — a page inside `(app)/` is authenticated automatically and needs no guard of its own.

Add the nav entry in `src/routes/(app)/app.nav.ts`, and the page title branch in `(app)/+layout.svelte`.

### Guards — only when a feature needs its own redirect rule

Most features never need one — `master-area` has none, `(app)/` pages get their auth check for free from the route group's `+layout.ts`. Write a `presentation/guards/<feature>.guard.ts` only for a redirect rule specific to that feature (an already-authenticated user hitting `/login`, for example). Called from a route's `+layout.ts` / `+page.ts`, never from a component. `auth.guard.ts` is the real example:

```ts
export async function requireAuth(url: URL): Promise<void> {
	await authStore.ensureSession();
	if (!authStore.isAuthenticated) {
		redirect(307, `/login?redirectTo=${encodeURIComponent(`${url.pathname}${url.search}`)}`);
	}
}
```

A guard is a UX affordance, not a security boundary — the backend must authorize every endpoint on its own regardless of what the guard redirects.

## Never Create

- `+page.server.ts`, `+layout.server.ts`, `hooks.server.ts`, form actions — this is an SPA with `ssr = false`; they never run.
- Data fetching inside `+page.ts` / `+layout.ts`. Those are for guards and redirects only. Two fetching paths mean two caches that never agree.
- A `useMock` flag outside `MOCK_FLAGS`.
- A secret in a `VITE_*` env var — they are inlined into the bundle.

## Verify

```sh
npm run check                      # zero errors required
npx vitest run --project server    # mapper + use-case + store specs
```

Checklist before calling a feature done:

- [ ] Every repository method returns `Result`, never throws
- [ ] Every response passes through `parseApiResponse`
- [ ] Mapper covers both directions and has a spec
- [ ] Use-cases have a `.spec.ts` exercising success and error `Result`s against a fake repository (see `auth.use-cases.spec.ts`)
- [ ] A store, if present, has a `.spec.ts` covering hydration, single-flight `ensureSession`, and clear-on-logout (see `auth.store.spec.ts`)
- [ ] Mock fails where the real one fails
- [ ] `MOCK_FLAGS` has the feature's entry
- [ ] Use-cases exported as factory **and** singleton
- [ ] No `any` anywhere
- [ ] Route page only composes; guard comes from the route group

## Notes On The Reference

`master-area` is the pattern for **structure**. Do not copy its page styling: `MasterAreaPage.svelte` still writes raw pairs (`text-slate-900 dark:text-slate-100`) instead of `text-ink` roles, and hand-rolls a `border-t` div around the pagination where `CardFooter bordered` is the primitive. New pages use the roles and the primitive.

Do not use `dashboard/` as a structural reference at all — it has no `domain/` or `infrastructure/`, only presentation over a local mock file.
