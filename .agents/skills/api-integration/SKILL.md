---
name: api-integration
description: Wiring a feature's `infrastructure` layer to the real backend at https://api-ubh.wolfmother613.web.id/api-docs — the envelope/error/pagination contract, why the openapi doc lied about one field name, the shared list-query types in `$lib/shared/domain/types/pagination.ts`, manual-pagination TanStack Table wiring, and the `$effect` self-loop trap that hung the whole page during the `area` integration. Use when flipping a `MOCK_FLAGS` entry to `false`, writing a `.repository.impl.ts`, or wiring search/sort/pagination as real query params.
---

# API Integration

Grounded in the `area` feature going from mock to live backend. Read `src/features/area/` — it is the reference implementation, the same way `feature-architecture` points at it for layering.

## 1. Verify Against The Live Server, Not Just The Doc

The openapi spec at `/api-docs/openapi.bundled.yaml` **was wrong**. It documented the list meta field as `total_page`; the live server actually sends `total_pages`. Trusting the doc produced a `paginationMetaSchema` that rejected every real response, which — combined with TanStack Query's default retry — turned one bad field name into 7 identical `GET /areas` calls and a "Gagal memuat data area" error on a 200 response with an empty array.

Before wiring any endpoint, pull the real shape and diff it against the doc:

```sh
curl -s https://api-ubh.wolfmother613.web.id/api/v1/areas
# {"success":true,"data":[],"meta":{"page":1,"per_page":20,"total_data":0,"total_pages":0}}
```

If the doc and the live response disagree, the live response wins — it's what `axiosClient` actually receives. Check a sibling endpoint too (`/plants`, `/units`) before assuming a field-name quirk is endpoint-specific; `total_pages` turned out to be consistent across all three.

## 2. The Envelope, Exactly

Every success response: `{ success, message?, data, meta? }`. Every error response: `{ success: false, data: null, error: { code, message, details? } }` — the error fields are **nested under `error`**, never top-level.

`src/lib/shared/infrastructure/mappers/error.mapper.ts` used to read `data?.message` / `data?.code` / `data?.details` straight off `error.response.data`. Those are always `undefined` on a real error response, so every API error — a 409 duplicate code, a 422 validation failure, even a 401 invalid-credentials on login — silently fell back to axios's generic `"Request failed with status code …"` instead of the backend's actual message. Read through `error` instead:

```ts
const message = data?.error?.message || error.message || 'An unexpected network error occurred';
const details = data?.error?.details;
// …
const code = data?.error?.code || error.code || 'NETWORK_ERROR';
```

`src/lib/shared/infrastructure/api/api-error.ts`'s `ApiErrorDto` type must mirror this nesting, or the mistake comes back the next time someone "fixes" the mapper.

## 3. Meta Is Flat, Not `{ pagination: {...} }`

`src/lib/shared/infrastructure/api/api-schema.ts`:

```ts
export const paginationMetaSchema = z.object({
	page: z.number(),
	per_page: z.number(),
	total_data: z.number(),
	total_pages: z.number()
});

export const apiEnvelopeSchema = z.object({
	message: z.string().optional(),
	data: z.unknown(),
	meta: paginationMetaSchema.nullable().optional()
});
```

Two parse functions, not one:

- `parseApiResponse(schema, raw)` — the common case, discards `meta`. Every non-list endpoint uses this.
- `parseApiResponseWithMeta(schema, raw)` — returns `{ data, meta }`. Use this in a list endpoint's repository method when the UI needs `total_data`/`total_pages` for server-driven pagination (see §5). `parseApiResponse` is a one-line wrapper over this — don't duplicate the envelope-parsing logic when you need meta, call the `WithMeta` variant instead.

## 4. DTO Fields Are A Claim — Check What The Backend Actually Sends

`area.dto.ts` originally declared `id: number`, because it was scaffolded before the backend existed. The live API returns a UUID string. `areaDtoSchema`'s `id: z.number()` doesn't error on a mismatch in a way you'd notice from the type system — it throws at runtime the moment a real response arrives (`INVALID_RESPONSE`, same failure mode as §1).

Before writing a DTO for a new endpoint:

- Check whether a sibling feature (`plant`, `unit`, `project`) already integrated the same backend and got the shape right — `plant.dto.ts` already had `id: string` and `created_at`/`updated_at: string` mapped through `dateStringSchema` while `area.dto.ts` still had the stale `number`. Siblings that integrated later are more likely to be correct than the one that was scaffolded first.
- Or just `curl` the endpoint (§1) and read the real JSON.

Map every backend field the entity plausibly needs (including `created_at`/`updated_at` as `Date`, matching `plant.mapper.ts`'s pattern) even if no UI currently renders it — the DTO documents the actual contract, not just today's UI.

## 5. Server-Driven List: Shared Types, Not A Bespoke Shape Per Feature

Search, sort, and pagination are backend query params (`search`, `sort_by`, `sort_order`, `page`, `per_page`), not client-side `table.getFilteredRowModel()` work — the mock repository can afford to slice an in-memory array, but the real one returns one page, already filtered and sorted, plus a `meta` block with the true total.

Use the generic types in `src/lib/shared/domain/types/pagination.ts` instead of hand-rolling `<Feature>ListParams`/`<Feature>ListMeta`:

```ts
export type AreaListParams = ListParams<'code' | 'name'>; // the sort_by values THIS endpoint accepts
export type AreaListResult = PaginatedResult<Area>;
```

`ListParams<TSortField>` is `{ search?, sortBy?: TSortField, sortOrder?: 'asc'|'desc', page?, perPage? }`; `PaginatedResult<T>` is `{ items: T[], meta: PaginationMeta }`. The repository's `list()` takes `AreaListParams` and returns `Result<AreaListResult>` — see `area.repository.impl.ts` for the axios `params:` object and the `parseApiResponseWithMeta` call.

Wire the page's `.svelte.ts` hook so `sorting`/`pagination` TanStack Table state maps directly into query params, and the table trusts the server's page instead of re-slicing it:

```ts
const table = createDataTable<Area>({
	columns,
	get data() {
		return query.data?.items ?? [];
	},
	manualSorting: true,
	manualPagination: true,
	get rowCount() {
		return query.data?.meta.totalData ?? 0;
	}
	// onSortingChange / onPaginationChange update `sorting`/`pagination` state,
	// which a $derived `listParams` turns into the next queryFn's params.
});
```

`placeholderData: keepPreviousData` (from `@tanstack/svelte-query`) keeps the previous page's rows on screen while the next page/sort/search loads, instead of flashing back to the skeleton — but it also means `query.isPending` stays `false` during that refetch, so the populated branch needs its own `isFetching` cue or the view reads as broken. See the `interaction-states` skill.

Disable sorting (`enableSorting: false`) on any column the backend's `sort_by` enum doesn't cover — `area-table.columns.ts` disables it on `type` because the API only sorts by `code`/`name`/`created_at`. Debounce the search input (see `use-area-page.svelte.ts`'s `SEARCH_DEBOUNCE_MS`) before it flows into the query key — otherwise every keystroke is a request.

Key the query on the full params object (`areaKeys.list(params)`), and keep invalidation on the bare prefix (`areaKeys.lists()`) — TanStack Query's `invalidateQueries` matches by prefix, so one `invalidateQueries({ queryKey: areaKeys.lists() })` after a mutation still catches every search/sort/page variant cached under it.

## 6. Check Who Else Calls The Thing You're Changing

Changing `AreaRepository.list()`'s return type from `Area[]` to `AreaListResult` broke three call sites in **other** features that had nothing to do with the task at hand: `plant`'s form modal and page (Area combobox / filter), and `project`'s page (Area filter) — all three imported `areaUseCases` directly to populate a dropdown, expecting a plain array.

Before changing a repository or use-case's signature or return shape:

```sh
grep -rn "areaUseCases\." src --include="*.ts" --include="*.svelte"
```

A dropdown/filter consumer usually wants "all of them", not one paginated page — call `list({ perPage: 100 })` (100 is this backend's own `per_page` ceiling) and read `.items`, rather than teaching that consumer about pagination it doesn't need.

## 7. Keep The Mock Repository's Contract In Sync

`MOCK_FLAGS` can flip a feature back to its mock at any time (local dev without the backend, a demo, a flaky API). If `list()`'s signature changes, `<feature>.repository.mock.ts` must implement the same params (search/sort/paginate over the in-memory `SEED`) and return the same `PaginatedResult` shape — see `area.repository.mock.ts`. A mock that still returns the old shape only fails at compile time if you're lucky; if the return type happens to structurally satisfy the interface, it fails silently at runtime instead.

## 8. The `$effect` Self-Loop Trap

Resetting pagination when a debounced search value changes looked like this, and it hung the entire `/area` route (infinite reactive loop, page never rendered, browser pegged):

```ts
// WRONG — reads `pagination` (via the spread) and writes it in the same effect
$effect(() => {
	void debouncedSearch;
	pagination = { ...pagination, pageIndex: 0 };
});
```

`{...pagination}` **reads** `pagination`, which makes the effect depend on it — and the effect also **writes** `pagination`, so every run schedules another run, forever. This is easy to miss because the offending read is a spread, not an obvious `pagination.foo`.

Fix: read the state you're about to overwrite inside `untrack` (from `'svelte'`), and guard against a no-op write:

```ts
$effect(() => {
	void debouncedSearch;
	untrack(() => {
		if (pagination.pageIndex !== 0) {
			pagination = { ...pagination, pageIndex: 0 };
		}
	});
});
```

General rule: an `$effect` that writes to a piece of `$state` must never _read_ that same state outside `untrack` — including implicitly, via a spread, a `.length`, or any other property access.

## Checklist

- [ ] Pulled the real response with `curl` and diffed it against the openapi doc — trusted the live one on any conflict
- [ ] Error path reads `data.error.{code,message,details}`, never top-level `data.{code,message,details}`
- [ ] List endpoints use `parseApiResponseWithMeta`; everything else uses `parseApiResponse`
- [ ] DTO field types (esp. `id`) checked against a real response or a sibling feature, not assumed
- [ ] Server-driven list params/result use `ListParams<TSortField>` / `PaginatedResult<T>` from `$lib/shared/domain/types/pagination.ts`
- [ ] Table wired with `manualSorting`/`manualPagination`/`rowCount` when the list is server-paginated; unsupported sort columns get `enableSorting: false`; search is debounced before it hits the query key
- [ ] `grep`'d for other consumers of any repository/use-case whose signature changed
- [ ] Mock repository updated to the same params/return shape as the real one
- [ ] No `$effect` reads (including via spread) the same `$state` it writes, outside `untrack`
- [ ] `npm run check`, `npm run lint`, `npx vitest run --project server` all clean
