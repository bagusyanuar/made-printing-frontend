---
name: type-safety
description: Strict TypeScript and runtime validation for this repo — no `any`, `unknown` plus narrowing, explicit types, and the zod rules that tooling cannot catch: `satisfies` over annotation, `parseApiResponse` on every response, `dateStringSchema` for dates, and the Zod v4 generic trap. Use when writing or reviewing any .ts or .svelte file, and always when touching a schema, DTO, mapper, repository, or form.
---

# Type Safety

## What The Tooling Already Catches

`tsconfig.json` has `"strict": true`, and `eslint.config.js` sets `@typescript-eslint/no-explicit-any: 'error'`. Writing `any` fails `npm run lint`. The repo is currently at zero occurrences — keep it there.

So this document is mostly about what `npm run check` and `npm run lint` **cannot** see: a type that is a claim rather than a check.

## No `any`

When a shape is genuinely unknown, use `unknown` and narrow before use. `unknown` forces the narrowing; `any` deletes the question.

```ts
export function mapErrorToAppError(error: unknown): AppError {
	if (error instanceof AppError) return error;
	if (error instanceof AxiosError) {
		const data = error.response?.data as ApiErrorDto | undefined;
		// …
	}
	if (error instanceof Error) return new AppError(error.message, 'INTERNAL_ERROR');
	return new AppError('An unknown error occurred', 'UNKNOWN_ERROR');
}
```

Every branch narrows before reading a property, and the final fallback assumes nothing. Note the one `as` here: it sits behind an `instanceof AxiosError` guard and is immediately made optional. That is the shape an assertion is allowed to take — never a bare `as SomeType` on unvalidated input.

Explicit types on all function parameters, return types, and non-trivial variables. Domain models live in `domain/<feature>.entity.ts`, wire models in `infrastructure/<feature>.dto.ts`.

For SvelteKit load functions, use the generated types — never hand-write them:

```ts
import type { PageLoad } from './$types';
export const load: PageLoad = async ({ url }) => {
	/* … */
};
```

## Types Vanish At Runtime

TypeScript guarantees nothing about what the backend actually sends. Any data crossing a system boundary — API responses, form submissions — must be validated with zod.

**Every API response goes through `parseApiResponse`:**

```ts
const response = await axiosClient.get('/areas');
const dtos = parseApiResponse(z.array(areaDtoSchema), response.data);
return dtos.map(mapAreaDtoToEntity);
```

Reading `response.data.data` directly is a violation, and so is `axiosClient.get<ApiResponse<AreaDto[]>>(…)`. An `AxiosResponse<ApiResponse<T>>` annotation is a claim about the backend, not a check on it — it compiles happily while the field it names is `undefined` at runtime.

`parseApiResponse` unwraps the `{ message?, data, meta? }` envelope, validates `data`, and **throws** an `AppError` with code `INVALID_RESPONSE`. Repositories call it inside `safeApiCall`, so the throw becomes a normal `Result.error` for the caller. A list endpoint that needs `meta` (pagination) calls `parseApiResponseWithMeta` instead — see the `api-integration` skill.

`meta`, when present, is **flat** — `{ page, per_page, total_data, total_pages }` — not nested under a `pagination` key. The openapi doc at `/api-docs` documented `total_page` (singular); the live server actually sends `total_pages`. When the doc and a real response disagree, trust the real response.

## `satisfies`, Not Annotation

Every schema is pinned to an explicit type with `satisfies`. Types are written out, not inferred with `z.infer` — a reader should see the shape in the file without hovering an editor.

```ts
export const loginSchema = z.object({
	email: z.email('Format email tidak valid'),
	password: z.string().min(6, 'Password minimal 6 karakter')
}) satisfies z.ZodType<LoginCredentials>;
```

```ts
export const areaDtoSchema = z.object({
	id: z.string(),
	code: z.string(),
	name: z.string(),
	type: z.enum(['internal', 'external']),
	created_at: dateStringSchema,
	updated_at: dateStringSchema
}) satisfies z.ZodType<AreaDto>;
```

Don't assume a numeric-looking backend `id` — this one is a UUID string. Check a real response (or a sibling feature that already integrated) rather than guessing; see the `api-integration` skill.

**Never `const schema: z.ZodType<T> = z.object({…})`.** The annotation widens the variable to a generic `ZodType`, and superForm then loses `$form.<field>` inference along with the concrete `ZodObject` its adapter needs. `satisfies` checks the same thing without widening.

### Know what `satisfies` buys

It catches a field the schema is **missing**, and a field whose type **contradicts** the declaration. It does **not** catch a field the schema has in excess of the type. And the declared type is always the looser of the two — `created_at: string` says nothing about `dateStringSchema` rejecting unparseable values.

The type documents the contract; the schema enforces it. When they disagree about strictness, the schema wins at runtime.

## Dates Arrive As Strings

Use `dateStringSchema` from `$lib/shared/infrastructure/api/api-schema`, never a bare `z.string()`:

```ts
export const authUserDtoSchema = z.object({
	id: z.number(),
	email: z.string(),
	created_at: dateStringSchema
}) satisfies z.ZodType<AuthUserDto>;
```

It rejects anything `Date.parse` cannot read. With `z.string()`, a `null` or a malformed value passes validation and becomes `Invalid Date` inside the mapper — a failure that surfaces far from its cause, usually as a blank cell in a table.

## Zod v4 Generic Trap

`z.object({ data: someTypeParameter })` does not infer cleanly through a type parameter — the resulting output type loses its properties. Keep the envelope non-generic with `data: z.unknown()` and validate the payload in a second `safeParse`. That is exactly what `parseApiResponse` does:

```ts
export const apiEnvelopeSchema = z.object({
	message: z.string().optional(),
	data: z.unknown(),
	meta: paginationMetaSchema.nullable().optional()
});
```

Do not try to "improve" this into a generic envelope schema. It has been tried; the payload type comes back empty.

## Two Schema Files, On Purpose

| File                                    | Layer          | Validates         | Changes when                 |
| --------------------------------------- | -------------- | ----------------- | ---------------------------- |
| `domain/<feature>.schema.ts`            | domain         | Form submissions  | Business policy changes      |
| `infrastructure/<feature>.validator.ts` | infrastructure | Backend responses | The backend contract changes |

Merging them couples "the password minimum moved" to "the backend renamed a field". Request DTOs get no schema at all — their contents already passed the domain schema, so there is no untrusted boundary left to check.

## Check

```sh
npm run check    # svelte-check, must be zero errors
npm run lint     # eslint fails on any `any`
```

Before finishing:

- [ ] No `any` — `unknown` plus narrowing where the shape is open
- [ ] Every response through `parseApiResponse`, never `response.data.data`
- [ ] Every schema pinned with `satisfies`, never a `: z.ZodType<T>` annotation
- [ ] Date fields use `dateStringSchema`
- [ ] No bare `as` on unvalidated input
- [ ] Load functions typed from `./$types`
