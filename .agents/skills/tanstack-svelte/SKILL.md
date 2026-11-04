---
name: tanstack-svelte-table
description: Guidelines for implementing TanStack Table (v9) in Svelte 5. Trigger this when generating or modifying data tables, grids, or paginated lists.
---

# TanStack Table in Svelte 5

This project uses `@tanstack/svelte-table` **v9**. The v8 API (`createSvelteTable`,
`getCoreRowModel()`, `<FlexRender content={…} context={…} />`) does not exist here —
do not generate it.

## 1. Do Not Build a Table From Scratch

The table UI already exists. Compose it instead:

- `$lib/components/ui/table` — presentational primitives (`Table`, `TableHeader`,
  `TableBody`, `TableRow`, `TableHead`, `TableCell`, …). No TanStack import at all.
  Use these directly for static tables that need no sorting, filtering, or paging.
- `$lib/components/ui/data-table` — `DataTable`, `DataTableColumnHeader`,
  `DataTablePagination`, `DataTablePageSize`, plus `createDataTable` /
  `createDataTableColumnHelper`.

`DataTable` is presentation-only: it renders whatever instance it is handed. The
page or feature component that owns the data creates the instance and owns every
piece of state. Never move sorting/filter/pagination state into `DataTable`.

## 2. Feature Set Is Pinned App-Wide

v9 resolves its APIs from the concrete `features` object passed to the table. A
component generic over `TFeatures` therefore **cannot** call `getVisibleCells()`,
`getPageCount()`, or any other feature API — TypeScript has nothing to resolve them
against, and it fails with `Property 'getVisibleCells' does not exist`.

`dataTableFeatures` in `data-table.features.svelte.ts` pins one set for the whole app
(sorting, column filtering, global filtering, pagination, row selection, column
visibility). That is what makes `DataTable` typable. Features a given table does
not use stay inert, so there is no cost to leaving them in.

Adding a feature (grouping, expanding, pinning) means adding it there, not
creating a second feature set.

## 3. Auto-Reset Is Off, and Must Stay Off

`createDataTable` sets `autoResetAll: false`. Do not turn it back on.

The adapter holds `table.options` in a `$state` object and replaces it wholesale
on every option sync. `options.data` therefore comes back as a freshly proxied
array each time. The core row model memoises on that identity, concludes the data
changed, and fires the auto-resets. With controlled pagination the effect is that
every page click is undone on the next tick and the table snaps back to page 1;
auto-reset sorting and expansion misfire the same way.

`createDataTable` enforces the invariant auto-reset was protecting — never sit on
a page that no longer exists — with an effect that clamps the page index to the
last page. A caller that wants page 1 after a filter change should set the page
index itself alongside the filter.

Two related traps come from the same area:

- `@tanstack/svelte-table` and `@tanstack/svelte-query` are in
  `optimizeDeps.exclude`. Pre-bundling a Svelte library gives it its own copy of
  the Svelte runtime, so effects it creates register against a different
  `active_effect` than the app's component tree — `effect_orphan` where it throws,
  silently dead reactivity where it does not.
- `createDataTable` calls `$effect`, so it only runs during component
  initialisation. A `.stories.svelte` file must not build the instance in its own
  instance script: the CSF indexer mounts that file to collect story metadata and
  the effect orphans. Build it in a child component, as `DataTable.demo.svelte`
  does.

## 4. Defining Columns

Use `createDataTableColumnHelper` — it is pre-bound to the app feature set, so
`meta` is typed.

Wrap the array in `columnHelper.columns([...])`. Without it, TypeScript widens the
array to a single `TValue` and the mixed column types stop being assignable.

Put the column file in its own `presentation/components/[subject]-table/`
subfolder, named after what the table displays, alongside any cell/badge/action
components only that table uses — see [architecture.md](../../rules/architecture.md).
A feature with a single table can start the column file directly in
`presentation/components/`, but the subfolder is where it belongs the moment a
second file (a badge, a row-action component) joins it.

```typescript
// src/features/project/presentation/components/project-table/project-table.columns.ts
import {
	createDataTableColumnHelper,
	renderComponent,
	DataTableColumnHeader
} from '$lib/components/ui/data-table';
import type { Project } from '../../../domain/project.entity';

const columnHelper = createDataTableColumnHelper<Project>();

export const projectColumns = columnHelper.columns([
	columnHelper.accessor('title', {
		header: ({ header }) => renderComponent(DataTableColumnHeader, { header, label: 'Project' })
	}),
	columnHelper.accessor('isActive', {
		meta: { align: 'center' },
		header: 'Status',
		cell: ({ getValue }) => (getValue() ? 'Active' : 'Inactive')
	})
]);
```

`meta` accepts `align`, `headClass`, `cellClass`, `width`, and `truncate`. Prefer it
over restyling the table from the page — the column definition should carry its own
layout.

For a Svelte component in a cell use `renderComponent(Component, props)`; for a
snippet declared in the calling component use `renderSnippet(theSnippet, params)`.
Both are re-exported from `$lib/components/ui/data-table`.

## 5. Creating the Instance (Parent Owns Everything)

Reactive options are read lazily by the adapter, so `data` and every `state` slice
must be passed as **getters**. A plain `data: projects` snapshots the value and the
table stops updating.

```svelte
<script lang="ts">
	import type { PaginationState, SortingState } from '@tanstack/table-core';
	import { createDataTable, DataTable, DataTablePagination } from '$lib/components/ui/data-table';
	import { projectColumns } from './components/project-table/project-table.columns';
	import type { Project } from '../domain/project.entity';

	let { projects }: { projects: Project[] } = $props();

	let sorting = $state<SortingState>([]);
	let pagination = $state<PaginationState>({ pageIndex: 0, pageSize: 10 });

	const table = createDataTable<Project>({
		columns: projectColumns,
		get data() {
			return projects;
		},
		state: {
			get sorting() {
				return sorting;
			},
			get pagination() {
				return pagination;
			}
		},
		onSortingChange: (updater) => {
			sorting = typeof updater === 'function' ? updater(sorting) : updater;
		},
		onPaginationChange: (updater) => {
			pagination = typeof updater === 'function' ? updater(pagination) : updater;
		}
	});
</script>

<DataTable {table} density="default" stickyHeader />
<DataTablePagination {table} />
```

Read table state in templates or `$derived` with `table.atoms.<slice>.get()` (the
atom keys are optional — use `?.`) or `table.store.get()` for the whole state.

## 6. `DataTable` Props Worth Knowing

`loading` + `skeletonRows` swap the body for placeholders without unmounting the
header. `emptyMessage` or the `empty` snippet covers the zero-row case — do not
hand-roll either. `onRowClick` also switches the rows to their interactive hover
state. `cell` and `rowDetail` snippets override rendering when a column definition
is the wrong place for it.

`DataTablePagination` already renders numbered pages with ellipses at both ends,
tuned by `siblingCount` / `boundaryCount` and disabled with `showPageNumbers`. The
slot layout comes from the pure `buildPageRange` helper in
`data-table.pagination.ts` — reuse it for any other paginated list rather than
writing a second truncation rule.

## 7. Styling

Styling lives in `table.variants.ts` (CVA), not in the page. Follow the
[cva-tailwind skill](../cva-tailwind/SKILL.md) when adding a variant and the
[design-system rules](../../rules/design-system.md) for the aesthetic. Never render
a raw `<table>` with ad-hoc Tailwind classes alongside these components.
