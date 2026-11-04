---
name: cva-tailwind-components
description: Guidelines for building UI component variants using class-variance-authority (CVA) and tailwind-merge. Trigger this when creating reusable UI components like Buttons, Badges, or Alerts.
---

# CVA & Tailwind UI Components

To maintain a consistent Design System, all reusable UI components (Buttons, Badges, Cards, etc.) MUST use `class-variance-authority` (cva) and `tailwind-merge` to handle style variants.

## 1. The Utility `cn()`

Always assume a utility function `cn()` exists (usually in `src/lib/utils.ts` or `src/lib/utils/cn.ts`) that combines `clsx` and `tailwind-merge`.

## 2. File Structure (Barrel Export Pattern)

When generating UI components, always split them into three files to promote clean exports and reusability:

1. `[component].variants.ts`: Contains the CVA definitions and variant types.
2. `[Component].svelte`: The main Svelte component.
3. `index.ts`: The barrel export file.

### Example: Button Component

**1. `button.variants.ts`**

```typescript
import { cva, type VariantProps } from 'class-variance-authority';

export const buttonVariants = cva(
	'inline-flex cursor-pointer items-center justify-center rounded-md text-sm font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50',
	{
		variants: {
			variant: {
				default: 'bg-brand-700 text-white hover:bg-brand-900',
				secondary: 'bg-slate-900 text-white hover:bg-slate-800'
			},
			size: {
				default: 'h-10 px-4 py-2',
				sm: 'h-8 px-3 text-xs'
			}
		},
		defaultVariants: {
			variant: 'default',
			size: 'default'
		}
	}
);

export type ButtonVariantProps = VariantProps<typeof buttonVariants>;
```

**2. `Button.svelte`**

```svelte
<script lang="ts">
	import { cn } from '$lib/utils';
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import { buttonVariants, type ButtonVariantProps } from './button.variants';

	type ButtonProps = HTMLButtonAttributes &
		ButtonVariantProps & {
			children?: Snippet;
		};

	let {
		class: className,
		variant,
		size,
		type = 'button',
		children,
		...rest
	}: ButtonProps = $props();
</script>

<button {type} class={cn(buttonVariants({ variant, size }), className)} {...rest}>
	{@render children?.()}
</button>
```

**3. `index.ts`**

```typescript
import Root from './Button.svelte';
import { buttonVariants, type ButtonVariantProps } from './button.variants';

export {
	Root,
	type ButtonVariantProps as ButtonProps,
	//
	Root as Button,
	buttonVariants,
	type ButtonVariantProps
};
```
