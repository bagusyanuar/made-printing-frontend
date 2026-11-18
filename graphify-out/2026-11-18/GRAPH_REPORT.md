# Graph Report - made-printing-frontend  (2026-11-18)

## Corpus Check
- 263 files · ~121,230 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 5 file(s) not represented in the graph (top: (none) 4, .css 1)

## Summary
- 1469 nodes · 3401 edges · 109 communities (82 shown, 22 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 37 edges (avg confidence: 0.84)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `eb2c3b91`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- package.json
- devDependencies
- Reseller
- Product
- ExpenseCategory
- product.entity.ts
- supplier.repository.impl.ts
- What You Must Do When Invoked
- @sveltejs/kit
- scripts
- dependencies
- dystopia-linear-lib
- tsconfig.json
- Build Order
- CreateTicketOrderPage.svelte
- prettier.config.js
- +layout.ts
- app.d.ts
- Visual Style: Soft Minimal SaaS (Made Printing)
- Linear-Style Slicing
- Domain Knowledge: Digital Printing ERP (Made Printing)
- 04. Model Rumus Kalkulasi Harga & Multi-Tier Pricing
- Global Agent Rules
- Global Agent Rules
- AGENTS.md
- API Integration
- Svelte 5 Runes
- Tailwind v4
- Type Safety
- Process Flow
- Naming Conventions
- 1. Kategori Produk Utama
- Feature Architecture
- graphify reference: extra exports and benchmark
- Superforms + Zod
- Made Printing — Frontend (Digital Printing ERP)
- 06. Manajemen Inventori, Bahan Baku, & Pelacakan Waste
- Result
- SupplierInput
- Naming Conventions
- Svelte 5 Best Practices
- Tailwind CSS Rules
- Interaction States
- Layout Composition
- Design System & Aesthetics (Anti-AI Slop)
- Commit Message Format
- 05. Manajemen Mesin Produksi & Antrian Kerja (_Machine Scheduling_)
- 07. Point of Sales (POS), Keuangan, & Manajemen Penagihan
- TanStack Table in Svelte 5
- Testing Rules
- Storybook for Svelte 5 Guidelines
- UX Heuristics For Slicing
- Visual Hierarchy And Scale
- 02. Siklus Hidup Pesanan & Dokumen SPK (Surat Perintah Kerja)
- 2. Opsi Pasca-Cetak (_Finishing Guide_)
- eslint.config.js
- Type Safety Rules
- Conventional Commit Workflow
- safeApiCall
- graphify reference: query, path, explain
- 01. Overview & Domain Model: Made Printing ERP
- ProductCategoryInput
- sv
- ProductCategoryListPage.svelte
- knowledge/README.md
- sidebar.types.ts
- themeStore
- graphify reference: add a URL and watch a folder
- graphify reference: commit hook and native CLAUDE.md integration
- graphify reference: incremental update and cluster-only
- product-category.repository.impl.ts
- graphify reference: GitHub clone and cross-repo merge
- graphify reference: transcribe video and audio
- ux-audit.md
- imports
- @playwright/test
- rules/graphify.md
- extraction-spec.md
- workflows/graphify.md
- zod
- TicketOrder
- ProductListPage.svelte
- expenseCategoryStore
- AppSidebar.svelte
- resellerStore
- dystopia-linear-lib/components/typography
- Supplier
- app-error.ts
- ProductCategory
- Frontend Architecture Rules (Clean Architecture + DDD)
- vitest
- productCategoryStore
- api-schema.ts
- product.schema.ts
- reseller.repository.impl.ts
- routes/+layout.svelte
- CVA & Tailwind UI Components
- productCategoryUseCases
- reseller.schema.ts
- ticket-order.schema.ts
- greet.ts
- (app)/+layout.svelte
- theme.store.svelte.ts
- vite.config.ts

## God Nodes (most connected - your core abstractions)
1. `Result` - 214 edges
2. `AppError` - 202 edges
3. `safeApiCall()` - 60 edges
4. `parseApiResponse()` - 42 edges
5. `NotFoundError` - 39 edges
6. `TicketOrder` - 36 edges
7. `Reseller` - 28 edges
8. `ProductAttribute` - 24 edges
9. `ExpenseCategory` - 24 edges
10. `ProductCategory` - 24 edges

## Surprising Connections (you probably didn't know these)
- `attributeVariantStore` --references--> `attributeVariantUseCases`  [EXTRACTED]
  src/features/attribute-variants/application/attribute-variant.store.svelte.ts → src/features/attribute-variants/application/attribute-variant.use-cases.ts
- `attributeVariantRepositoryMock` --references--> `ProductAttribute`  [EXTRACTED]
  src/features/attribute-variants/infrastructure/attribute-variant.repository.mock.ts → src/features/attribute-variants/domain/attribute-variant.entity.ts
- `AttributeVariantRepositoryImpl` --implements--> `AttributeVariantRepository`  [EXTRACTED]
  src/features/attribute-variants/infrastructure/attribute-variant.repository.impl.ts → src/features/attribute-variants/domain/attribute-variant.repository.ts
- `productCategoryStore` --references--> `productCategoryUseCases`  [EXTRACTED]
  src/features/product-categories/application/product-category.store.svelte.ts → src/features/product-categories/application/product-category.use-cases.ts
- `mapProductCategoryInputToDto()` --calls--> `generateCategoryCode()`  [EXTRACTED]
  src/features/product-categories/infrastructure/product-category.mapper.ts → src/features/product-categories/domain/product-category.entity.ts

## Import Cycles
- None detected.

## Communities (109 total, 22 thin omitted)

### Community 0 - "package.json"
Cohesion: 0.07
Nodes (28): name, private, type, version, class-variance-authority, clsx, dystopia-linear-lib, eslint (+20 more)

### Community 1 - "devDependencies"
Cohesion: 0.07
Nodes (30): devDependencies, eslint, eslint-config-prettier, @eslint/js, eslint-plugin-svelte, globals, @iconify-json/lucide, @iconify-json/mdi (+22 more)

### Community 2 - "Reseller"
Cohesion: 0.13
Nodes (6): createResellerUseCases(), resellerUseCases, Reseller, ResellerRepository, ResellerRepositoryMock, ConflictError

### Community 3 - "Product"
Cohesion: 0.10
Nodes (12): productRepositoryImpl, productRepositoryInstance, productRepositoryMock, productStore, createProductUseCases(), productUseCases, generateProductCode(), Product (+4 more)

### Community 4 - "ExpenseCategory"
Cohesion: 0.11
Nodes (18): expenseCategoryRepositoryImpl, expenseCategoryRepositoryInstance, expenseCategoryRepositoryMock, EXPENSE_GROUPS, ExpenseCategory, ExpenseCategoryInput, ExpenseGroup, ExpenseGroupOption (+10 more)

### Community 5 - "product.entity.ts"
Cohesion: 0.09
Nodes (21): CALCULATION_TYPES, CalculationType, CalculationTypeOption, PriceTierItem, ProductAttributeSelection, ProductTierPricing, VariantTierPricing, PriceTierItemDto (+13 more)

### Community 6 - "supplier.repository.impl.ts"
Cohesion: 0.16
Nodes (7): axios, supplierDtoSchema, supplierListResponseSchema, ForbiddenError, UnauthorizedError, ValidationError, axiosClient

### Community 7 - "What You Must Do When Invoked"
Cohesion: 0.08
Nodes (24): For /graphify add and --watch, For /graphify query, For the commit hook and native CLAUDE.md integration, For --update and --cluster-only, /graphify, Honesty Rules, Interpreter guard for subcommands, Part A - Structural extraction for code files (+16 more)

### Community 9 - "scripts"
Cohesion: 0.17
Nodes (12): scripts, build, check, check:watch, dev, format, lint, prepare (+4 more)

### Community 10 - "dependencies"
Cohesion: 0.18
Nodes (11): dependencies, axios, class-variance-authority, clsx, dystopia-linear-lib, @floating-ui/dom, sveltekit-superforms, tailwind-merge (+3 more)

### Community 11 - "dystopia-linear-lib"
Cohesion: 0.11
Nodes (17): Alias, Not Rename, App-Shell Composition: Sidebar Family + Popover, Catalogue, Check, `cn` Comes From The Library Too, Composition Pattern, `DataTable` Never Calls `createTable` For You, `Dialog`: Fixed Internal Spacing, No Trigger-less Mode (+9 more)

### Community 12 - "tsconfig.json"
Cohesion: 0.20
Nodes (9): $app/tsconfig, compilerOptions, paths, strict, types, extends, include, $features/* (+1 more)

### Community 13 - "Build Order"
Cohesion: 0.12
Nodes (17): 10. `application/<feature>.container.ts`, 11. `application/<feature>.use-cases.ts`, 12. `application/<feature>.store.svelte.ts` — only when needed, 13. `presentation/hooks/<feature>.query-keys.ts`, 14. Fetch in the page, not in a load function, 15. Wire the route, 1. `domain/<feature>.entity.ts`, 2. `domain/<feature>.repository.ts` (+9 more)

### Community 19 - "Visual Style: Soft Minimal SaaS (Made Printing)"
Cohesion: 0.17
Nodes (12): 10. Quick Rejection List, 1. What The Style Is, 2. Surfaces & Elevation, 3. Radius, 4. Colour, 5. Spacing Rhythm, 6. Grid & Composition, 7. Navigation (+4 more)

### Community 21 - "Linear-Style Slicing"
Cohesion: 0.12
Nodes (15): Border Is The Default Separator, Check, Color Discipline: Fill Is Opt-In, Not Ambient, Control Size: Match The Toolbar To The Table It Sits Above, Icon-Button Recipe, Icon Sizing, Layout Shell: Floating Card, Not Edge-To-Edge, Linear-Style Slicing (+7 more)

### Community 22 - "Domain Knowledge: Digital Printing ERP (Made Printing)"
Cohesion: 0.15
Nodes (12): 1. Glosarium & Terminologi Domain, 2. Kategori Produk & Satuan Hitung, 3. Alur Siklus Hidup Order & Status Semantik, 4. Keuangan, Kasir, & Presisi Angka, 5. Manajemen Mesin & Stok Bahan, A. Large Format / Outdoor & Indoor Banner, B. Digital Printing Lembaran (Sheetfed A3+), C. Sablon Digital / DTF (Direct-to-Film) & Sublimasi (+4 more)

### Community 23 - "04. Model Rumus Kalkulasi Harga & Multi-Tier Pricing"
Cohesion: 0.17
Nodes (12): 04. Model Rumus Kalkulasi Harga & Multi-Tier Pricing, 1. Rumus Cetak Format Meteran ($m^2$ - Banner & Indoor), 2. Rumus Cetak Digital Press Lembaran A3+ (Sheetfed), 3. Rumus Cetak DTF (Meter Lari), 4. Multi-Tier Customer Pricing (Matrix Harga), 5. Standar Presisi Finansial dalam Kode, A. Rumus Dasar, A. Rumus Muat per Lembar (_Imposition Yield_) (+4 more)

### Community 24 - "Global Agent Rules"
Cohesion: 0.17
Nodes (12): Design System & Aesthetics, Digital Printing ERP Domain & Semantics, Global Agent Rules, Layout Structure, Naming Conventions, Page Slicing, Project Architecture, Styling (Tailwind CSS) (+4 more)

### Community 25 - "Global Agent Rules"
Cohesion: 0.17
Nodes (12): Design System & Aesthetics, Digital Printing ERP Domain & Semantics, Global Agent Rules, Layout Structure, Naming Conventions, Page Slicing, Project Architecture, Styling (Tailwind CSS) (+4 more)

### Community 26 - "AGENTS.md"
Cohesion: 0.18
Nodes (8): 1. Global Layout Anatomy, 2. Content Area Grid (Modular Widget-Based), 3. Card-Based Content, 4. Responsive Behavior, Dashboard Layout Structure, 1. Component Reuse Priority, 2. Semantic HTML Per Context, Page Slicing Rules

### Community 27 - "API Integration"
Cohesion: 0.18
Nodes (10): 1. Verify Against The Live Server, Not Just The Doc, 2. The Envelope, Exactly, 3. Meta Is Flat, Not `{ pagination: {...} }`, 4. DTO Fields Are A Claim — Check What The Backend Actually Sends, 5. Server-Driven List: Shared Types, Not A Bespoke Shape Per Feature, 6. Check Who Else Calls The Thing You're Changing, 7. Keep The Mock Repository's Contract In Sync, 8. The `$effect` Self-Loop Trap (+2 more)

### Community 28 - "Svelte 5 Runes"
Cohesion: 0.18
Nodes (11): Check, Derived, Not Effect, `$effect` Is Init-Time Only, Effects That Write State — Avoiding Infinite Loops, Lifecycle, Props, Runes Outside Components, State Classes (+3 more)

### Community 29 - "Tailwind v4"
Cohesion: 0.18
Nodes (10): Check, Colour Comes From Roles, Conditional Classes, Known Drift — Do Not Copy, No `@apply`, Tailwind v4, The Directives In `layout.css`, The Eight Lint Rules (+2 more)

### Community 30 - "Type Safety"
Cohesion: 0.20
Nodes (10): Check, Dates Arrive As Strings, Know what `satisfies` buys, No `any`, `satisfies`, Not Annotation, Two Schema Files, On Purpose, Type Safety, Types Vanish At Runtime (+2 more)

### Community 31 - "Process Flow"
Cohesion: 0.20
Nodes (9): 1. DTO (Data Transfer Object), 2. Validator, 3. Domain Entity, 4. Mapper, 5. Repository Contract & Implementation, 6. Mock Repository, 7. Wiring (DI), Data Mapper Workflow (Anti-Corruption Layer) (+1 more)

### Community 32 - "Naming Conventions"
Cohesion: 0.20
Nodes (9): Barrel Files, By Case, Check, Export Names, Known Drift — Do Not Copy, Naming Conventions, `.svelte.ts` Is Load-Bearing, The Dot-Suffix Vocabulary (+1 more)

### Community 33 - "1. Kategori Produk Utama"
Cohesion: 0.33
Nodes (6): 1. Kategori Produk Utama, A. Large Format Outdoor (Solvent / UV Roll), B. Large Format Indoor & Display (Eco-Solvent / Waterbased), C. Digital Printing A3+ Lembaran (Laser Sheetfed), D. Sablon Digital & DTF (Direct-to-Film), E. Merchandise & Flatbed

### Community 34 - "Feature Architecture"
Cohesion: 0.22
Nodes (5): Feature Architecture, Never Create, Notes On The Reference, Verify, Which Layer Does This File Go In

### Community 35 - "graphify reference: extra exports and benchmark"
Cohesion: 0.22
Nodes (8): graphify reference: extra exports and benchmark, Step 6b - Wiki (only if --wiki flag), Step 7 - Neo4j export (only if --neo4j or --neo4j-push flag), Step 7a - FalkorDB export (only if --falkordb or --falkordb-push flag), Step 7b - SVG export (only if --svg flag), Step 7c - GraphML export (only if --graphml flag), Step 7d - MCP server (only if --mcp flag), Step 8 - Token reduction benchmark (only if total_words > 5000)

### Community 36 - "Superforms + Zod"
Cohesion: 0.22
Nodes (9): Checklist, Create/Edit Seam: `form.reset({ data })`, `dystopia-linear-lib`'s `Dialog`: Mandatory Trigger, No `footer` Snippet, Field Markup Convention, Hook Return Shape: Narrow Only When There's a Reason To, `message` Is Not Optional — Always Render It, Superforms + Zod, The Hook Recipe (+1 more)

### Community 37 - "Made Printing — Frontend (Digital Printing ERP)"
Cohesion: 0.22
Nodes (8): 1. What This Application Is, 2. Design System & Visual Aesthetic, 3. Current State Of The Repo, 4. Quick Map, 5. Read Before Writing Code, 6. Non-Negotiable Rules, 7. Verify Before Claiming Done, Made Printing — Frontend (Digital Printing ERP)

### Community 38 - "06. Manajemen Inventori, Bahan Baku, & Pelacakan Waste"
Cohesion: 0.22
Nodes (8): 06. Manajemen Inventori, Bahan Baku, & Pelacakan Waste, 1. Dua Tipe Inventori Bahan Baku Utama, 2. Inventori Tinta & Consumables, 3. Toleransi Limbah & Waste Ratio (_Scrap Tracking_), A. Bahan Continuous / Roll-Based Goods, B. Bahan Diskrit / Sheet-Based Goods, Rumus Persentase Waste:, Sumber-sumber Limbah Cetak:

### Community 39 - "Result"
Cohesion: 0.10
Nodes (7): attributeVariantUseCases, createAttributeVariantUseCases(), AttributeVariantRepository, attributeVariantRepositoryMock, AppError, NotFoundError, Result

### Community 40 - "SupplierInput"
Cohesion: 0.16
Nodes (4): supplierStore, createSupplierUseCases(), supplierUseCases, SupplierInput

### Community 41 - "Naming Conventions"
Cohesion: 0.25
Nodes (7): 1. Svelte Components, 2. Directories and Folders, 3. TypeScript Files (Business Logic & Architecture), 4. Variables and Functions, 5. Constants, 6. Interfaces, Types, and Classes, Naming Conventions

### Community 42 - "Svelte 5 Best Practices"
Cohesion: 0.25
Nodes (8): 1. Runes for Reactivity, 2. Component Props, 3. Event Handling, 4. Slots vs Snippets, 5. Lifecycle and Effects, 6. Runes Outside Components (`.svelte.ts`), 7. Svelte Libraries and Vite Pre-Bundling, Svelte 5 Best Practices

### Community 43 - "Tailwind CSS Rules"
Cohesion: 0.25
Nodes (7): 1. Utility-First Approach, 2. Component Extraction over `@apply`, 3. Class Ordering, 4. Conditional Classes, 5. Arbitrary Values, 6. Color Theme (Design Aesthetics), Tailwind CSS Rules

### Community 44 - "Interaction States"
Cohesion: 0.25
Nodes (7): A Fully-Interactive Appearance Implies Real Behavior, Check, Disabled Means Perceivable, Not Hidden, Every Submit/Async Action Needs Its Own Pending State, Focus State Is Not Optional, Interaction States, The Four States Every Data-Bound View Needs

### Community 45 - "Layout Composition"
Cohesion: 0.25
Nodes (7): Check, F-Pattern And Z-Pattern: Match The Flow To The Content Density, Law of Continuity: Alignment Consistency, Overridable By A Stronger Convention, Layout Composition, Rule Of Thirds: A Compositional Guide, Not A Requirement For Functional UI, Symmetry And Asymmetry: Balance Is Not The Same As Mirroring, White Space Must Be Deterministic, Not Incidental

### Community 46 - "Design System & Aesthetics (Anti-AI Slop)"
Cohesion: 0.25
Nodes (8): 1. No "AI Slop" Permitted, 2. Depth & Elevation, 3. Typography & Hierarchy, 4. Micro-Interactions & Animation, 5. Spacing & Negative Space, 6. Dark Mode Support, 7. Icons & Imagery, Design System & Aesthetics (Anti-AI Slop)

### Community 47 - "Commit Message Format"
Cohesion: 0.25
Nodes (7): 1. Types, 2. Domain Name (Scope), 3. Changelog (Detailed Description), Commit Message Format, Execution Steps (Agent Workflow), Git Commit Workflow, Perfect Commit Message Example:

### Community 48 - "05. Manajemen Mesin Produksi & Antrian Kerja (_Machine Scheduling_)"
Cohesion: 0.22
Nodes (8): 05. Manajemen Mesin Produksi & Antrian Kerja (_Machine Scheduling_), 1. Inventori & Kategori Mesin Produksi, 2. Status Siklus Mesin (_Machine State Machine_), 3. Algoritma Antrian Produksi (_Production Queue Strategy_), 4. Pelacakan Kapasitas & Bottleneck, Aturan 1: Emergency First (Express / Same-Day), Aturan 2: Batching Bahan Serupa (Material Grouping), Aturan 3: Gang-Run Printing / Nesting

### Community 49 - "07. Point of Sales (POS), Keuangan, & Manajemen Penagihan"
Cohesion: 0.25
Nodes (7): 07. Point of Sales (POS), Keuangan, & Manajemen Penagihan, 1. Alur Operasional Kasir / POS, 2. Skema & Metode Pembayaran, 3. Manajemen Piutang & Plafon Kredit Reseller (_Credit Limit_), 4. Format Dokumen Finansial & Percetakan, A. Tipe Status Pembayaran, B. Metode Pembayaran yang Didukung

### Community 50 - "TanStack Table in Svelte 5"
Cohesion: 0.12
Nodes (13): 1. Schema Definition (Zod), 2. Client Form (`+page.svelte` or Component), 3. Extracting the Form into a Hook, 4. Navigating After a Successful Submit, Superforms & Zod Workflow (SPA Mode), 1. Do Not Build a Table From Scratch, 2. Feature Set Is Pinned App-Wide, 3. Auto-Reset Is Off, and Must Stay Off (+5 more)

### Community 51 - "Testing Rules"
Cohesion: 0.29
Nodes (7): 1. The Four Suites, 2. Put Logic Where It Can Be Tested Cheaply, 3. Reproduce Before Fixing, 4. Component Tests Need a Real Component, 5. Assertions Are Mandatory, 6. Guards and Redirects Need an E2E Test, Testing Rules

### Community 52 - "Storybook for Svelte 5 Guidelines"
Cohesion: 0.29
Nodes (6): 1. Avoid Double Rendering (The "Component Wrapper" Trap), 2. Children and Snippets, 3. Never Build an Effect-Bearing Instance in the Stories File, 4. Tailwind CSS Integration, CRITICAL RULES FOR @storybook/addon-svelte-csf, Storybook for Svelte 5 Guidelines

### Community 53 - "UX Heuristics For Slicing"
Cohesion: 0.29
Nodes (6): Check, Fitts's Law: Target Size And Distance, Hick's Law And The Von Restorff Effect: One Dominant Action, Jakob's Law: Do Not Invent New Patterns For Common Tasks, Proximity And Gestalt: Grouping Is Spacing, Not Just Color, UX Heuristics For Slicing

### Community 54 - "Visual Hierarchy And Scale"
Cohesion: 0.29
Nodes (6): Check, Golden Ratio: Know When It Does Not Apply, Modular Scale And Weber's Law: Why Type Sizes Cannot Be Arbitrary, The Spacing Grid: Named Density Tokens, Not Raw Multiples, Visual Hierarchy And Scale, Visual Hierarchy: The Outcome, Not A Separate Rule

### Community 55 - "02. Siklus Hidup Pesanan & Dokumen SPK (Surat Perintah Kerja)"
Cohesion: 0.29
Nodes (6): 02. Siklus Hidup Pesanan & Dokumen SPK (Surat Perintah Kerja), 1. Diagram Transisi Status Pesanan, 2. Definisi Status & Perilaku Sistem, 3. Tingkat Prioritas Pesanan (_Priority Levels_), 4. Anatomi Dokumen SPK (Surat Perintah Kerja), Elemen Data SPK:

### Community 56 - "2. Opsi Pasca-Cetak (_Finishing Guide_)"
Cohesion: 0.29
Nodes (6): 03. Katalog Produk, Material Bahan Baku, & Pilihan Finishing, 2. Opsi Pasca-Cetak (_Finishing Guide_), A. Finishing Khusus Banner / Spanduk, B. Finishing Laminasi, C. Finishing Potong & Bentuk (_Cutting & Shaping_), D. Finishing Penjilidan (_Binding_)

### Community 57 - "eslint.config.js"
Cohesion: 0.29
Nodes (6): gitignorePath, eslint-config-prettier, @eslint/js, eslint-plugin-svelte, globals, typescript-eslint

### Community 58 - "Type Safety Rules"
Cohesion: 0.33
Nodes (5): 1. No `any` Allowed, 2. Explicit Types & Interfaces, 3. SvelteKit Auto-Generated Types, 4. Runtime Validation, Type Safety Rules

### Community 59 - "Conventional Commit Workflow"
Cohesion: 0.33
Nodes (5): 1. Format, 2. One Domain Per Commit, 3. Always Confirm Before Committing, 4. Standard Git Safety, Conventional Commit Workflow

### Community 60 - "safeApiCall"
Cohesion: 0.08
Nodes (27): attributeVariantRepositoryInstance, attributeVariantStore, generateSlug(), ProductAttribute, ProductAttributeInput, ProductAttributeVariant, ProductAttributeVariantBatchItem, ProductAttributeVariantInput (+19 more)

### Community 61 - "graphify reference: query, path, explain"
Cohesion: 0.33
Nodes (5): For /graphify explain, For /graphify path, graphify reference: query, path, explain, Step 0 — Constrained query expansion (REQUIRED before traversal), Step 1 — Traversal

### Community 62 - "01. Overview & Domain Model: Made Printing ERP"
Cohesion: 0.33
Nodes (5): 01. Overview & Domain Model: Made Printing ERP, 1. Latar Belakang & Profil Bisnis, 2. Aktor Pengguna & Peran Sistem (_User Personas_), Detail Tanggung Jawab Per Role:, Mengapa Digital Printing Berbeda dari Percetakan Konvensional (Offset)?

### Community 63 - "ProductCategoryInput"
Cohesion: 0.28
Nodes (6): ProductCategoryInput, ProductCategoryDto, ProductCategoryRequestDto, mapProductCategoryDtoToEntity(), mapProductCategoryInputToDto(), ProductCategoryRepositoryImpl

### Community 64 - "sv"
Cohesion: 0.33
Nodes (5): Adding features, Building, Creating a project, Developing, sv

### Community 66 - "knowledge/README.md"
Cohesion: 0.40
Nodes (3): 📚 Daftar Modul Knowledge, Knowledge Base: Made Printing ERP (Digital Printing System), 🎯 Prinsip Utama Domain Percetakan Digital

### Community 67 - "sidebar.types.ts"
Cohesion: 0.24
Nodes (10): svelte, isActiveHref(), sectionContainsActive(), testSections, isNavGroup(), NavEntry, NavGroup, NavLink (+2 more)

### Community 69 - "graphify reference: add a URL and watch a folder"
Cohesion: 0.50
Nodes (3): For /graphify add, For --watch, graphify reference: add a URL and watch a folder

### Community 70 - "graphify reference: commit hook and native CLAUDE.md integration"
Cohesion: 0.50
Nodes (3): For git commit hook, For native CLAUDE.md integration, graphify reference: commit hook and native CLAUDE.md integration

### Community 71 - "graphify reference: incremental update and cluster-only"
Cohesion: 0.50
Nodes (3): For --cluster-only, For --update (incremental re-extraction), graphify reference: incremental update and cluster-only

### Community 72 - "product-category.repository.impl.ts"
Cohesion: 0.29
Nodes (6): productCategoryRepositoryInstance, CALCULATION_TYPES, CalculationType, CalculationTypeOption, CategoryType, productCategoryRepository

### Community 76 - "imports"
Cohesion: 0.67
Nodes (3): imports, #features/*, #lib

### Community 81 - "zod"
Cohesion: 0.12
Nodes (11): zod, AttributeInputSchema, attributeVariantBatchItemSchema, VariantInputSchema, ExpenseCategoryFormSchema, expenseCategorySchema, expenseCategoryDtoSchema, expenseCategoryListResponseSchema (+3 more)

### Community 82 - "TicketOrder"
Cohesion: 0.06
Nodes (38): ticketOrderRepositoryImpl, ticketOrderRepositoryInstance, ticketOrderRepositoryMock, ticketOrderStore, TicketStatusFilterTab, CancelTicketOrderUseCase, GetTicketOrderByIdUseCase, GetTicketOrdersUseCase (+30 more)

### Community 85 - "expenseCategoryStore"
Cohesion: 0.15
Nodes (3): expenseCategoryStore, createExpenseCategoryUseCases(), expenseCategoryUseCases

### Community 86 - "AppSidebar.svelte"
Cohesion: 0.15
Nodes (3): groupTrigger(), linkContent(), pageTitleStore

### Community 89 - "Supplier"
Cohesion: 0.17
Nodes (11): supplierRepositoryImpl, supplierRepositoryInstance, supplierRepositoryMock, generateSupplierCode(), getSupplierInitial(), Supplier, SupplierRepository, mapSupplierDtoToEntity() (+3 more)

### Community 90 - "app-error.ts"
Cohesion: 0.14
Nodes (13): resellerRepositoryImpl, resellerRepositoryInstance, resellerRepositoryMock, generateResellerCode(), RESELLER_STATUSES, RESELLER_TIERS, ResellerInput, ResellerStatus (+5 more)

### Community 91 - "ProductCategory"
Cohesion: 0.20
Nodes (6): generateCategoryCode(), ProductCategory, ProductCategoryRepository, delay(), INITIAL_CATEGORIES, productCategoryRepositoryMock

### Community 92 - "Frontend Architecture Rules (Clean Architecture + DDD)"
Cohesion: 0.22
Nodes (9): 1. Core Philosophy, 2. Decoupling Domain and Infrastructure (Anti-Corruption Layer), 3. Directory Structure, 4. This Project Is an SPA, Not SSR, 5. State Management, Frontend Architecture Rules (Clean Architecture + DDD), `src/features/[feature-name]/`, `src/lib/` (+1 more)

### Community 93 - "vitest"
Cohesion: 0.36
Nodes (5): vitest, SupplierCreatePayload, SupplierDto, SupplierUpdatePayload, mapSupplierInputToDto()

### Community 95 - "api-schema.ts"
Cohesion: 0.25
Nodes (6): productCategoryDtoSchema, InvalidResponseError, PaginationMeta, apiEnvelopeSchema, dateStringSchema, paginationMetaSchema

### Community 96 - "product.schema.ts"
Cohesion: 0.22
Nodes (8): priceTierItemSchema, productAttributeSelectionSchema, ProductFormSchema, productSchema, productStep1Schema, productStep3Schema, productTierPricingSchema, variantTierPricingSchema

### Community 97 - "reseller.repository.impl.ts"
Cohesion: 0.47
Nodes (4): ResellerDto, ResellerInputDto, mapResellerInputToDto(), resellerDtoSchema

### Community 99 - "CVA & Tailwind UI Components"
Cohesion: 0.40
Nodes (4): 1. The Utility `cn()`, 2. File Structure (Barrel Export Pattern), CVA & Tailwind UI Components, Example: Button Component

### Community 103 - "reseller.schema.ts"
Cohesion: 0.29
Nodes (6): ResellerDepositFormSchema, resellerDepositSchema, ResellerFormSchema, resellerSchema, resellerStatusSchema, resellerTierSchema

### Community 104 - "ticket-order.schema.ts"
Cohesion: 0.29
Nodes (6): CancelTicketOrderFormSchema, cancelTicketOrderSchema, SaveDraftTicketOrderFormSchema, saveDraftTicketOrderSchema, TicketOrderItemFormSchema, ticketOrderItemSchema

### Community 107 - "theme.store.svelte.ts"
Cohesion: 0.50
Nodes (4): isTheme(), readStoredTheme(), Theme, THEME_STORAGE_KEY

### Community 108 - "vite.config.ts"
Cohesion: 0.50
Nodes (3): @sveltejs/adapter-static, @tailwindcss/vite, @vitest/browser-playwright

## Knowledge Gaps
- **520 isolated node(s):** `gitignorePath`, `name`, `private`, `version`, `type` (+515 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 680 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **22 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `zod` connect `zod` to `package.json`, `product.schema.ts`, `reseller.repository.impl.ts`, `ExpenseCategory`, `product.entity.ts`, `supplier.repository.impl.ts`, `reseller.schema.ts`, `product-category.repository.impl.ts`, `ticket-order.schema.ts`, `TicketOrder`, `safeApiCall`, `api-schema.ts`?**
  _High betweenness centrality (0.101) - this node is a cross-community bridge._
- **Why does `Result` connect `Result` to `reseller.repository.impl.ts`, `Reseller`, `Product`, `ExpenseCategory`, `productCategoryUseCases`, `product.entity.ts`, `supplier.repository.impl.ts`, `product-category.repository.impl.ts`, `SupplierInput`, `TicketOrder`, `expenseCategoryStore`, `Supplier`, `app-error.ts`, `ProductCategory`, `safeApiCall`, `ProductCategoryInput`?**
  _High betweenness centrality (0.086) - this node is a cross-community bridge._
- **Why does `AppError` connect `Result` to `reseller.repository.impl.ts`, `Reseller`, `Product`, `ExpenseCategory`, `productCategoryUseCases`, `product.entity.ts`, `supplier.repository.impl.ts`, `product-category.repository.impl.ts`, `SupplierInput`, `TicketOrder`, `expenseCategoryStore`, `Supplier`, `app-error.ts`, `safeApiCall`, `api-schema.ts`?**
  _High betweenness centrality (0.072) - this node is a cross-community bridge._
- **What connects `gitignorePath`, `name`, `private` to the rest of the system?**
  _520 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.06896551724137931 - nodes in this community are weakly interconnected._
- **Should `devDependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.06666666666666667 - nodes in this community are weakly interconnected._
- **Should `Reseller` be split into smaller, more focused modules?**
  _Cohesion score 0.12561576354679804 - nodes in this community are weakly interconnected._