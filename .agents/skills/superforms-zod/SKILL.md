---
name: superforms-zod-workflow
description: Guidelines for implementing forms using sveltekit-superforms and zod validation in SPA mode. Trigger this when generating or modifying forms.
---

# Superforms & Zod Workflow (SPA Mode)

When creating or modifying forms in this SvelteKit SPA project, strictly adhere to the `sveltekit-superforms` client-side pattern.

## 1. Schema Definition (Zod)

- Always define the validation schema using `zod` first.
- If the form relates to a specific feature, place the schema in `src/features/[feature]/domain/[feature].schema.ts`.

- Pin the schema to the entity the use-case accepts with `satisfies`. Adding a field to the entity then breaks the schema at compile time instead of at runtime.

```typescript
import { z } from 'zod';
import type { CreateProjectInput } from './project.entity';

export const createProjectSchema = z.object({
	name: z.string().min(3, 'Project name must be at least 3 characters'),
	status: z.enum(['PLANNED', 'IN_PROGRESS', 'DONE'])
}) satisfies z.ZodType<CreateProjectInput>;
```

Do not write `: z.ZodType<CreateProjectInput>` as an annotation — that widens the variable to a generic `ZodType` and superForm loses both `$form.<field>` inference and the concrete `ZodObject` that `zod4()` expects.

Zod v4: use the top-level string formats (`z.email()`, `z.url()`, `z.uuid()`), not the deprecated v3 method chain (`z.string().email()`).

## 2. Client Form (`+page.svelte` or Component)

- Because the app is in SPA mode (`ssr = false`), we DO NOT use `+page.server.ts` or `+page.ts` `load` functions to initialize forms.
- Always initialize the form directly inside the Svelte component using `defaults(zod4(schema))`.
- Use the `SPA: true` option in `superForm`.
- Handle form submission inside the `onUpdate` callback.

```svelte
<script lang="ts">
	import { superForm, defaults } from 'sveltekit-superforms';
	import { zod4 } from 'sveltekit-superforms/adapters';
	import { createProjectSchema } from '../domain/project.schema';
	import { projectUseCases } from '../application/project.use-cases';

	const { form, errors, constraints, enhance, message } = superForm(
		defaults(zod4(createProjectSchema)),
		{
			SPA: true,
			validators: zod4(createProjectSchema),
			async onUpdate({ form }) {
				if (!form.valid) return;

				// Perform the mutation via the use-case object, never the repository
				const result = await projectUseCases.create(form.data);

				if (!result.success) {
					form.message = result.error.message;
					return;
				}

				form.message = 'Project created successfully!';
			}
		}
	);
</script>

{#if $message}
	<div class="alert">{$message}</div>
{/if}

<form method="POST" use:enhance>
	<label>
		Name
		<input name="name" bind:value={$form.name} {...$constraints.name} />
	</label>
	{#if $errors.name}<span class="text-red-500">{$errors.name}</span>{/if}

	<button type="submit">Submit</button>
</form>
```

## 3. Extracting the Form into a Hook

Once `onUpdate` does more than set a message — updating a store, navigating, invalidating a query — move the whole `superForm` call into `presentation/hooks/use-[name]-form.svelte.ts`. The component then only binds fields, and the submit logic becomes readable on its own.

## 4. Navigating After a Successful Submit

Update the store first, then navigate. Skipping the store update means the destination's guard runs against a session that still looks anonymous and bounces the user straight back.

```typescript
authStore.setUser(result.data);
form.message = 'Login successful!';
await goto(resolveLanding(page.url.searchParams.get(REDIRECT_PARAM)));
```

**Never pass a `?redirectTo=` value straight to `goto()`** — that is an open redirect. Accept only same-origin relative paths:

```typescript
function resolveLanding(target: string | null): string {
	const fallback = resolve('/dashboard');
	if (!target || !target.startsWith('/') || target.startsWith('//')) return fallback;
	return target;
}
```

`eslint-plugin-svelte` requires `resolve()` from `$app/paths` around navigation targets. Literal route ids get `resolve('/dashboard')`; a validated dynamic target needs a one-line `eslint-disable-next-line svelte/no-navigation-without-resolve` with the reason stated.
