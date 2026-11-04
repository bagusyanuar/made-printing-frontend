# Dashboard Layout Structure

This project enforces a strict, consistent layout for all dashboard pages to maintain a professional, data-centric user experience.

The visual treatment of everything described here — surfaces, elevation, radius, colour, rhythm — is defined in [soft-minimal-saas.md](./soft-minimal-saas.md). This file governs _structure_; that file governs _style_. Where the two disagree, the style doc wins.

## 1. Global Layout Anatomy

Every dashboard page must exist within the primary application shell, which consists of three main components:

- **Sidebar Navigation:** A wide, labelled sidebar fixed to the left: brand/workspace switcher at the top, uppercase group labels, icon + text per item, collapsible groups for nested routes, and a toggle that collapses it to an icon rail on demand. Explicit labels are the default — this app has too many master-data routes for icon guessing to be usable. The icon-only rail is a user-invoked mode, not the resting state.
- **Sticky Header (Context Bar):** A horizontal top bar that remains visible when scrolling. It should display the current context (e.g., Page Title, Project Name), global filters, and user profile/notifications.
- **Main Content Area:** The primary workspace located to the right of the sidebar and below the Sticky Header. It owns the page padding (`p-6 lg:p-8`) — a page component never sets its own outer padding.

## 2. Content Area Grid (Modular Widget-Based)

- **Full Width Canvas (Konten Penuh):** The main container of the dashboard page must take up the full available width (`w-full`). Do not constrain the layout with `max-w-*` utilities (like `max-w-5xl` or `max-w-[1400px]`). Content should stretch seamlessly to fill the screen on large displays.
- **Proportioned splits are allowed; bento is not.** A 2/3 + 1/3 row (`grid-cols-1 lg:grid-cols-3` with `lg:col-span-2` on the primary) is a proportioned twelve-column grid and is encouraged — a wide chart beside a companion panel, a wide table beside an activity list. What stays banned is _arbitrary_ tile sizing, where the sizes carry no meaning and hierarchy is faked with mismatched boxes.
- **Top Row (KPIs/Summary):** If summarizing data, use a distinct row at the very top (e.g., `grid-cols-4`) for high-level metrics (Total Projects, Delayed, etc.).
- **Data Visualizations:** Use either a symmetrical grid (`grid-cols-1 lg:grid-cols-2`) or the proportioned 2/3 + 1/3 split for charts and large data cards. Gutters are always `gap-6`.
- **Approved row grids** are listed in [soft-minimal-saas.md](./soft-minimal-saas.md#6-grid--composition). Reach for one of those before inventing a new column split.

## 3. Card-Based Content

- All distinct pieces of information, charts, or forms within the Main Content Area must be enclosed in Cards.
- Never let content float freely on the main background canvas.
- Ensure all cards use the `Card` primitive's `padding` scale rather than hand-written padding classes, and follow the surface and elevation rules in [soft-minimal-saas.md](./soft-minimal-saas.md#2-surfaces--elevation).
- **One section, one card.** Toolbars and filters belong in `CardHeader bordered`, pagination in `CardFooter bordered`, and a table sits in a `padding="none"` card so it runs edge to edge.

## 4. Responsive Behavior

- **Desktop:** The labelled sidebar is always visible. Grid columns should be at their maximum (e.g., 3 or 4 cols).
- **Tablet:** Grid columns should collapse (e.g., to 2 cols).
- **Mobile:** The sidebar collapses into a hamburger-triggered sheet. Grid columns must collapse to a single column (`grid-cols-1`).
