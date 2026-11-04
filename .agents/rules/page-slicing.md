# Page Slicing Rules

Rules for how a view/page is composed — sourcing markup from existing components first, and structuring the DOM with semantic HTML per context.

## 1. Component Reuse Priority

Before writing any new markup, check in this order:

1. **`src/lib/components/ui/`** — generic, cross-feature primitives (button, card, dialog, alert-dialog, checkbox, combobox, data-table, datepicker, popover, radio, table, textfield, toast, typography, etc.). Use these directly.
2. **`src/features/[feature]/presentation/components/`** — this feature's own reusable pieces, for markup shared across pages within the same feature.
3. **Only if neither covers it** — write new markup. If it renders raw HTML for something a primitive already covers (a bare `<table>` when `data-table`/`table` exists, a bare `<input>` when `textfield` exists), that's a rule violation, not a valid new case.

**Extraction threshold:** the moment a block of markup is duplicated in 2+ places within a feature, extract it into `presentation/components/` instead of copy-pasting. Do not wait for a third occurrence.

Check the inventory before assuming something doesn't exist — `ls src/lib/components/ui` or a `Glob` for the feature's `presentation/components/` takes one call and prevents a duplicate primitive from being built.

## 2. Semantic HTML Per Context

Every distinct content context gets its own semantic element — not another generic `<div>`.

- **`<section>`**: wrap each distinct content block on a page (a KPI summary row, a chart group, a table block). Each `<section>` should have an accessible name — either a visible heading (`<h2>`, `<h3>`, …) or `aria-labelledby`/`aria-label` when there's no visible heading.
- **`<main>`**: the page's primary content area (maps to the Main Content Area in [layout-structure.md](./layout-structure.md)). One per page.
- **`<nav>`**: the Rail Navigation sidebar and any in-page navigation (tabs, breadcrumbs).
- **`<header>`**: the Sticky Header context bar, and per-card/section headers where appropriate.
- **`<aside>`**: secondary content that isn't the main flow (filters panel, side notes, related-info panel).
- **`<article>`**: self-contained, independently distributable content (a single project card in a feed, a notification item) — not just any card.
- **`<footer>`**: page or section footers (pagination controls, form actions row).

**Heading hierarchy:** one `<h1>` per page. Each `<section>` continues the hierarchy (`<h2>` inside a page-level section, `<h3>` inside a card within that section) — never skip a level or reset back to `<h1>` inside nested content.

**Don't over-apply:** a `Card` primitive's internal wrapper stays a `<div>` (that's the component's own concern per [design-system.md](./design-system.md)); semantic sectioning is about how the _page_ groups its cards/widgets into contexts, not about replacing every div inside a component.
