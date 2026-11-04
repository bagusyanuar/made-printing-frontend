# Tailwind CSS Rules

This project uses Tailwind CSS v4. To maintain a clean and consistent styling architecture, follow these rules:

## 1. Utility-First Approach

- **Rule:** Strictly use Tailwind utility classes directly in the HTML markup.
- **Restriction:** Avoid writing custom CSS in Svelte `<style>` blocks unless absolutely necessary (e.g., for complex third-party library overrides or highly specific micro-animations that Tailwind cannot handle).

## 2. Component Extraction over `@apply`

- **Rule:** If you find yourself repeating the same long list of utility classes (e.g., for a button), **do not** use the `@apply` directive in a CSS file.
- **Solution:** Extract the HTML into a reusable Svelte component (e.g., `Button.svelte`) and apply the utility classes there.

## 3. Class Ordering

- **Rule:** Order your utility classes logically to improve readability.
- **Recommended Order:**
  1. Layout (e.g., `block`, `flex`, `grid`, `absolute`)
  2. Spacing (e.g., `m-4`, `p-4`)
  3. Sizing (e.g., `w-full`, `h-64`)
  4. Typography (e.g., `text-lg`, `font-bold`)
  5. Visuals (e.g., `bg-blue-500`, `text-white`, `rounded-md`, `shadow`)
  6. States & Pseudo-classes (e.g., `hover:bg-blue-600`, `focus:ring`)
  7. Responsive (e.g., `md:flex`, `lg:w-1/2`)

## 4. Conditional Classes

- **Rule:** When applying dynamic or conditional classes, be mindful of Tailwind class conflicts.
- **Best Practice:** Use a utility like `clsx` and `tailwind-merge` (often combined as `cn()`) to safely merge classes and override conflicting tailwind rules, rather than raw string concatenation.

## 5. Arbitrary Values

- **Rule:** Minimize the use of arbitrary values (e.g., `w-[153px]`, `bg-[#ff0000]`).
- **Solution:** Always prefer using Tailwind's predefined design tokens (e.g., `w-40`, `bg-red-500`). Only use arbitrary values for strictly specific design requirements that cannot be mapped to the theme.

## 6. Color Theme (Design Aesthetics)

- **Rule:** The UI should feel premium and sleek. Avoid generic browser colors. Utilize modern aesthetics like glassmorphism (e.g., `bg-white/10 backdrop-blur-md` for dark mode cards) and subtle micro-animations (`transition-all duration-300`).
