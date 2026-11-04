# Type Safety Rules

This project enforces strict TypeScript practices to ensure runtime stability and superior developer experience.

<CRITICAL_RULES>

## 1. No `any` Allowed

- **Rule:** The use of the `any` type is strictly prohibited.
- **Solution:** If the shape of data is truly unknown (e.g., parsing arbitrary JSON), use the `unknown` type and perform type narrowing/validation (preferably using Zod) before using it.
  </CRITICAL_RULES>

## 2. Explicit Types & Interfaces

- **Rule:** All function parameters, return types, and complex variables must have explicit types or interfaces.
- **Location:** As per the architecture rules, domain models should be placed in `domain/[feature].entity.ts` and API models in `infrastructure/[feature].dto.ts`.

## 3. SvelteKit Auto-Generated Types

- **Rule:** Always use the automatically generated types from `./$types` for SvelteKit load functions and actions.
- **Example:**
  ```typescript
  import type { PageData, ActionData } from './$types';

  let { data }: { data: PageData } = $props();
  ```

## 4. Runtime Validation

- **Rule:** TypeScript only guarantees compile-time safety. For data crossing system boundaries (e.g., API responses, Form Submissions), you MUST use `zod` to validate the schema at runtime.
- **Rule:** Every API response goes through `parseApiResponse(schema, response.data)` from `$lib/shared/infrastructure/api/api-schema`. Reading `response.data.data` directly is a violation — the annotation `AxiosResponse<ApiResponse<T>>` is a claim about the backend, not a check on it.
- **Rule:** Every schema is pinned to an explicit type with `satisfies`. Types are written out, not inferred with `z.infer` — a reader should see the shape in the file without hovering an editor.

  ```typescript
  // domain/auth.schema.ts — pinned to the entity the use-case accepts
  export const loginSchema = z.object({
  	email: z.email('Format email tidak valid'),
  	password: z.string().min(6, 'Password minimal 6 karakter')
  }) satisfies z.ZodType<LoginCredentials>;
  ```

  ```typescript
  // infrastructure/auth.dto.ts — the backend contract, spelled out then enforced
  export interface AuthUserDto {
  	id: number;
  	email: string;
  	name: string;
  	role: string;
  	created_at: string;
  }

  export const authUserDtoSchema = z.object({
  	id: z.number(),
  	email: z.string(),
  	name: z.string(),
  	role: z.string(),
  	created_at: dateStringSchema
  }) satisfies z.ZodType<AuthUserDto>;
  ```

  Use `satisfies`, not a `: z.ZodType<T>` annotation — the annotation widens the variable to a generic `ZodType`, and superForm then loses `$form.<field>` inference and the concrete `ZodObject` its adapter needs.

  **Know what this does and does not buy.** `satisfies` catches a field the schema is missing, and a field whose type contradicts the declaration. It does **not** catch a field the schema has in excess of the type, and the declared type is always the looser of the two — `created_at: string` says nothing about `dateStringSchema` rejecting unparseable values. The type documents the contract; the schema enforces it. When they disagree about strictness, the schema wins at runtime.

- **Rule:** Dates arrive as strings. Use `dateStringSchema`, which rejects anything `Date.parse` cannot read, instead of `z.string()` — otherwise `new Date(dto.created_at)` yields `Invalid Date` and the failure surfaces far from its cause.
- **Note on Zod v4 generics:** `z.object({ data: someTypeParameter })` does not infer cleanly through a type parameter — the resulting output type loses its properties. Keep the envelope non-generic with `data: z.unknown()` and validate the payload in a second `safeParse`, as `parseApiResponse` does.
