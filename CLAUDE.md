# Made Printing — Frontend (Digital Printing ERP)

## 1. What This Application Is

Product: **Made Printing ERP** — Sistem Enterprise Resource Planning (ERP) & Point of Sale (POS) komprehensif khusus industri percetakan digital (_digital printing_). Aplikasi ini menangani seluruh siklus hidup operasional percetakan: penerimaan pesanan kasir, pengecekan file pra-cetak (pre-press), antrian dan alokasi mesin cetak, kontrol tahapan finishing, manajemen inventori bahan baku (roll & sheet), hingga penagihan dan piutang reseller.

Terms that appear in both the code and the UI. Do not translate them arbitrarily or swap in generic software synonyms:

| Term                           | What it means here                                                                                                  |
| :----------------------------- | :------------------------------------------------------------------------------------------------------------------ |
| **SPK (Surat Perintah Kerja)** | Work order instruction document for operators detailing customer specs, dimensions, material, and finishing.        |
| **Pre-press / RIP**            | Technical file check (bleed, resolution, CMYK) and Raster Image Processor staging before sending to printer.        |
| **Nesting / Imposition**       | Gang-run layout optimization to fit multiple artworks on a single sheet or roll width, minimizing waste.            |
| **Large Format**               | Outdoor/Indoor wide-format roll printing (Flexy, Albatros, Luster, Sticker) measured in square meters ($m^2$).      |
| **Sheetfed / A3+**             | Digital press sheet printing (Art Paper, Art Carton, Ivory, Sticker A3+) billed by sheet/click count.               |
| **DTF (Direct-to-Film)**       | Textile digital printing on PET film roll measured in linear meters.                                                |
| **Finishing**                  | Post-printing operations: laminasi (doff/glossy), mata ayam (grommet), seaming/lipat lem, kiss-cut, die-cut, jilid. |
| **Mata Ayam**                  | Ring eyelet/grommet installed on banner edges (options: 4 corners, per meter, all edges).                           |
| **Seaming**                    | Edge reinforcement fold glued/welded around banner borders.                                                         |
| **Kiss Cut vs Die Cut**        | _Kiss Cut_: cut sticker only through vinyl layer. _Die Cut_: punch cut entirely through backing sheet.              |
| **Kasir / POS**                | Front-desk sales counter managing Down Payments (DP), cash/QRIS/transfer, and invoices.                             |
| **Reseller Tier**              | Wholesale partner pricing matrix with credit term / kasbon accounts.                                                |

**UI copy uses professional Indonesian terms** matching real-world digital printing shop operations ("Buat SPK Baru", "Antrian Mesin Outdoor", "Menunggu Finishing", "Siap Ambil").

---

## 2. Design System & Visual Aesthetic

- **Design Philosophy**: **Soft Minimal SaaS** (Anti-AI Slop). Clean, low-contrast cool canvas, hairline borders (`border-line`), large consistent radii (`rounded-xl` for cards, `rounded-md` for inputs/buttons), near-flat elevation, and tinted semantic chips.
- **Color Discipline**:
  - Always use **semantic roles** (`bg-surface`, `bg-canvas`, `text-ink`, `text-ink-muted`, `border-line`), never hardcoded palette classes (`bg-white dark:bg-slate-900`) or raw hex codes.
  - Palette tokens live in `src/routes/layout.css`.
- **Layout Shell**:
  - Full-width modular canvas (`w-full`), responsive sidebar navigation (collapsible to icon rail), sticky context header, and structured card widgets.

---

## 3. Current State Of The Repo

- **Stack**: Svelte 5 (Runes), SvelteKit (Client-side SPA mode), Tailwind CSS v4, TypeScript, Vitest, Playwright.
- **Architecture**: Clean Architecture + Domain-Driven Design (DDD) with 4 explicit layers per feature (`domain/`, `infrastructure/`, `application/`, `presentation/`).
- **Data Flow**: `API Response` &rarr; `parseApiResponse(schema, data)` &rarr; `DTO` &rarr; `Mapper` &rarr; `Domain Entity` &rarr; `UI / Stores`.
- **Mocks & Backend Parity**:
  - Frontend-first development uses `.repository.mock.ts` toggled via `MOCK_FLAGS` in `$lib/shared/infrastructure/di/mock-config.ts`.
  - Mocks must strictly honour real contract behaviors (validation, latency, stateful mock storage).

---

## 4. Quick Map

```
src/features/<feature>/     domain · infrastructure · application · presentation
src/lib/components/ui/      Reusable UI primitives (button, card, dialog, table, badge, textfield, ...)
src/lib/shared/             result, app-error, api-schema, safe-api-call, mock-config
src/routes/(app)/           Guarded application routes + shell layout (sidebar, header)
src/routes/(auth)/          Authentication routes (login, forgot-password)
src/routes/layout.css       Tailwind entry, theme tokens & semantic roles
docs/knowledge/             Core domain knowledge & business logic specs
.agents/                    Agent ecosystem (AGENTS.md, rules/, skills/, workflows/)
```

Aliases: `$features` &rarr; `src/features`, `$lib` &rarr; `src/lib`. Never use relative `../../features/…` chains.

---

## 5. Read Before Writing Code

1. **`docs/knowledge/`** — Core domain knowledge, SPK lifecycle, calculation formulas, and machine workflows.
2. **`.agents/AGENTS.md`** — Workspace-wide master rules.
3. **`.agents/rules/architecture.md`** — Clean Architecture + DDD layer boundaries and responsibilities.
4. **`.agents/rules/digital-printing-erp-domain.md`** — Digital printing domain logic, metrics, and workflows.
5. **`.agents/rules/svelte-best-practices.md`** — Svelte 5 Runes, Snippets, and event props.
6. **`.agents/rules/type-safety.md`** & **`tailwind.md`** — Strict typing and styling conventions.
7. **`.agents/skills/`** — Reusable specialized skills for API integration, form handling, slicing, etc.

---

## 6. Non-Negotiable Rules

- **Zero `any`**: Strictly forbidden anywhere in the codebase. Use explicit types/interfaces or `unknown` narrowed with Zod.
- **Mandatory Runtime Validation**: Every API response must pass through `parseApiResponse(schema, response.data)` before reaching a mapper. TypeScript types do not exist at runtime.
- **DTO vs Entity Separation**: DTOs (`infrastructure/*.dto.ts`) represent external wire data; Entities (`domain/*.entity.ts`) represent clean domain models. Never leak DTOs into the presentation layer.
- **Mock Selection in `MOCK_FLAGS`**: Mocks are selected only in `mock-config.ts` resolved by container roots. Never put a `useMock` flag in a component or use-case.
- **Svelte 5 Runes Only**: `$props()`, `$state()`, `$derived()`, `$effect()`. Never use deprecated Svelte 4 syntax (`export let`, `$:`, `on:click`, `<slot />`).
- **SPA Architecture**: This app runs entirely in the browser (`adapter-static`, `ssr = false`). Never create `+page.server.ts` or `hooks.server.ts`.
- **Currency & Precision**: All money amounts are handled in Rupiah (`IDR`). Display with standard formatting (`Rp 150.000`), never calculate financial totals with raw floating-point math.
- **Zero Dashed Borders & No AI Slop Dashes**: Never use `border-dashed` or `border-dotted` in UI markup (empty states, upload zones, cards). Avoid excessive em-dashes (`—`) and repetitive hyphenated phrasing in UI text, code comments, and vibe coding.

---

## 7. Verify Before Claiming Done

```sh
npm run check                      # svelte-check, zero errors required
npm run lint                       # prettier --check + eslint
npx vitest run --project server    # unit tests (schemas, mappers, domain, use-cases)
```

Every suite you touched must be green. If something fails, fix it or report it plainly with its error output — never call it done until verified.
