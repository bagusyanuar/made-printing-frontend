# Design System & Aesthetics (Anti-AI Slop)

To ensure this project feels premium, bespoke, and visually stunning, we strictly prohibit "AI Slop" designs (generic, uninspired, default-looking UI). All slicing and layout creation must adhere to the following aesthetic rules:

These are the _principles_. The concrete style that implements them — Soft Minimal SaaS built on the client's `#00272f` brand — is specified in [soft-minimal-saas.md](./soft-minimal-saas.md), and that file wins wherever the two disagree.

## 1. No "AI Slop" Permitted

- **Avoid Default Vibes:** Do not just slap `bg-white`, `p-4`, `shadow-md`, and `text-gray-800` to create a generic card.
- **Curated Colors:** Avoid generic Tailwind colors (like flat `blue-500` or `red-500`) as the entire identity. The palette is Slate for neutrals and the **`brand` scale** — the client's `#00272f`, defined in [layout.css](../../src/routes/layout.css) — as the single accent, used sparingly for actions and active state. Tailwind's `teal-*` is retired; the brand replaced it.
- **The brand is near-black.** `brand-700` for accents on light, `brand-950` for near-black filled actions, `brand-400`/`brand-500` on dark surfaces. No single step works on both modes — which is why components use the `brand-solid` / `brand-fg` roles rather than picking a step themselves.
- **Components reference roles, not palette steps.** `bg-surface`, `text-ink-subtle`, `border-line` — never `bg-white dark:bg-slate-900`. The role table is in [soft-minimal-saas.md](./soft-minimal-saas.md#4-colour). A hand-written light/dark pair is a bug: the same decision then gets re-made in every file, and it drifts.
- **Secondary identity colour:** If a secondary accent is used, it sits in the `accent` scale. It punctuates — highlights, active indicators, one chart series — and never fills a button, where it would collide with `amber` (warning) or primary actions.
- **One accent for interface, a separate ramp for data.** A donut or a multi-series chart cannot be drawn in one accent, so charts read from the fixed `--color-chart-1..6` tokens defined in [soft-minimal-saas.md](./soft-minimal-saas.md#4-colour). Never hand-pick colours per chart, and never borrow a chart hue for a button.
- **Semantic hues are fixed:** `emerald` success, `amber` warning, `rose` danger, `sky` info. Never repurpose them decoratively.
- **No arbitrary hex — including the brand's own.** `bg-[#00272f]` is a violation now that `bg-brand-950` exists; a literal hex escapes the scale and cannot be themed or audited. `#005466` and `#003e4a` are `brand-700` and `brand-800`.
- **Strict Prohibition of Dashed Borders (`border-dashed` / `border-dotted`):**
  Never use dashed borders on cards, empty states, file upload dropzones, dividers, or placeholders. Dashed borders are an overused "AI Slop" cliché that makes production UIs look like unfinished wireframes. Always use crisp solid hairline borders (`border border-border` / `border-line`) paired with subtle background contrast (`bg-surface-subtle`).
- **Restraint on Dashes & AI Slop Punctuation in Vibe Code & Copy:**
  Avoid excessive em-dashes (`—`), en-dashes (`–`), or repetitive hyphens in UI copy, placeholders, titles, and code comments. Write naturally, directly, and cleanly without the stereotypical repetitive LLM prose style.

## 2. Depth & Elevation

- **The border does the work.** Depth comes from a hairline border (`border-line`) plus a barely-there shadow, not from a pronounced lift. Two surface levels exist — canvas and card — and nesting is allowed once, downward in weight (`outline` inside `default`). See [soft-minimal-saas.md](./soft-minimal-saas.md#2-surfaces--elevation).
- **Shadows:** Soft and multi-layered (`shadow-[0_1px_2px_rgb(15_23_42/0.04),0_8px_30px_rgb(15_23_42/0.06)]`), never a harsh default drop shadow. Only floating surfaces — popovers, dropdowns, dialogs — get a pronounced one.
- **Glassmorphism is reserved, not the default.** `Card variant="glass"` only pays off over a busy backdrop (a gradient or an image). Over the flat `slate-50` canvas it reads as a smudge, so the solid `default` variant is what pages use.
- **Gradients:** Sparing and low-contrast, if at all. The canvas stays a flat neutral — a mesh gradient behind cards fights the hairline borders that carry the whole style.

## 3. Typography & Hierarchy

- **Modern Fonts:** Assume the use of a modern sans-serif font (like Inter, Outfit, or Plus Jakarta Sans).
- **Refined Headers:** Use tight tracking (`tracking-tight`) for large headers to make them look premium.
- **Muted Text:** Use `text-slate-400` or `text-slate-500` for secondary text to establish a clear visual hierarchy, rather than making everything high contrast.

## 4. Micro-Interactions & Animation

- **Hover/Active States:** Every interactive element MUST have a hover and active state. (e.g., `hover:-translate-y-0.5 hover:shadow-lg active:scale-95 transition-all duration-300`).
- **Focus States:** Provide clean, offset focus rings for accessibility without sacrificing design (`focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600/50 focus-visible:ring-offset-2`). Use `focus-visible`, not `focus`, so a mouse click does not leave a ring behind.

## 5. Spacing & Negative Space

- **Breathing Room:** Don't cramp elements. Use generous padding and margins (e.g., `p-6` or `p-8` for main cards) to let the content breathe.
- **Strict Grid:** Always adhere to Tailwind's 4-point/8-point grid system. Do not use random pixel values.

## 6. Dark Mode Support

- **First-Class Citizen:** Dark mode is not an afterthought. Every UI component MUST support dark mode out of the box using Tailwind's `dark:` modifier.
- **Backgrounds & Surfaces:** Use `dark:bg-slate-900` or `dark:bg-slate-950` for the main background, and `dark:bg-slate-800` for elevated surfaces (cards, dropdowns).
- **Text & Borders:** Ensure readable contrast with `dark:text-slate-100` for primary text and `dark:text-slate-400` for secondary. Use `dark:border-slate-800` or `dark:border-white/10` for borders to maintain a premium feel.

## 7. Icons & Imagery

- **Icon Library:** We use `unplugin-icons` as our standard icon solution. Do NOT install or use `@iconify/svelte` (runtime), `lucide-svelte`, `react-icons`, or raw SVG strings.
- **Import Format:** Import icons directly as Svelte components using the `~icons/[collection]/[icon]` format. For example: `import IconHome from '~icons/mdi/home'`. This ensures zero-runtime overhead, perfect tree-shaking, and eliminates FOIT (Flash of Invisible Text).
- **Styling:** Style imported icon components using standard Tailwind utility classes (e.g., `<IconHome class="text-2xl text-slate-500" />`).

_Whenever generating UI components, review this document first. If the output looks like a generic 2018 Bootstrap dashboard, rethink the styling._
