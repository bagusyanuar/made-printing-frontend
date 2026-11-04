---
name: data-mapper-generator
description: Guidelines for implementing the Anti-Corruption Layer (DTO -> Mapper -> Entity). Trigger this when integrating new backend API endpoints or creating data fetching logic.
---

# Data Mapper Workflow (Anti-Corruption Layer)

To satisfy the Clean Architecture rules, data fetched from external APIs MUST NOT be used directly in the UI. It must pass through validation and a mapping layer.

**Flow:** `API Response` -> `parseApiResponse` -> `DTO` -> `Mapper` -> `Entity` -> `UI`.

## Process Flow

Whenever a new API integration is required, generate the following within the feature directory (`src/features/[feature]/`):

### 1. DTO (Data Transfer Object)

Located in `infrastructure/[feature].dto.ts`. **Plain types only — this file never imports zod.** It is the readable statement of what the backend sends and expects.

Request DTOs get no schema at all. Zod validates untrusted input, and a request body is not untrusted: it is built from a form that `domain/[feature].schema.ts` already validated. The mapper is what earns its keep on the request side — it keeps domain field names off the wire.

```typescript
/** Request shape — already validated upstream by the form schema. */
export interface CreateProjectRequestDto {
	project_title: string;
	is_active: 0 | 1;
}

/** Response shape — enforced at runtime by `project.validator.ts`. */
export interface ProjectDto {
	id_project: number;
	project_title: string;
	is_active: 0 | 1;
	created_at: string;
}
```

### 2. Validator

Located in `infrastructure/[feature].validator.ts`. Every runtime check this feature performs on backend responses, collected in one file so the wire contract is auditable at a glance.

Each schema is pinned to its DTO with `satisfies`, which is what stops the two files from drifting apart.

```typescript
import { z } from 'zod';
import { dateStringSchema } from '$lib/shared/infrastructure/api/api-schema';
import type { ProjectDto } from './project.dto';

export const projectDtoSchema = z.object({
	id_project: z.number(),
	project_title: z.string(),
	is_active: z.union([z.literal(0), z.literal(1)]),
	created_at: dateStringSchema
}) satisfies z.ZodType<ProjectDto>;
```

`satisfies` catches a field the schema is missing or types that contradict. It does not catch an excess field, and the interface is always the looser of the two — `created_at: string` does not express that `dateStringSchema` rejects unparseable values. Interface documents, schema enforces.

Use `dateStringSchema` for any date field. `z.string()` alone would accept `"not-a-date"` and hand the mapper an `Invalid Date`.

**Zod appears at exactly two places per feature:** user input (`domain/[feature].schema.ts`) and backend responses (`infrastructure/[feature].validator.ts`). Form rules never move into infrastructure — that would make the presentation layer import from the outermost ring.

### 3. Domain Entity

Located in `domain/[feature].entity.ts`.
This represents the clean, frontend-friendly schema used by Svelte components.

```typescript
export interface Project {
	id: string; // Converted to string for internal consistency
	title: string;
	isActive: boolean; // Converted to boolean
	createdAt: Date; // Converted to Date object
}
```

### 4. Mapper

Located in `infrastructure/[feature].mapper.ts`.
Pure functions, **both directions**. The response direction protects the UI from backend changes; the request direction stops domain objects from leaking onto the wire. Skipping the request mapper means a field renamed in the entity silently changes the request body.

```typescript
import type { ProjectDto, CreateProjectRequestDto } from './project.dto';
import type { Project, CreateProjectInput } from '../domain/project.entity';

export function mapProjectDtoToEntity(dto: ProjectDto): Project {
	return {
		id: String(dto.id_project),
		title: dto.project_title,
		isActive: dto.is_active === 1,
		createdAt: new Date(dto.created_at)
	};
}

export function mapCreateProjectInputToDto(input: CreateProjectInput): CreateProjectRequestDto {
	return {
		project_title: input.title,
		is_active: input.isActive ? 1 : 0
	};
}
```

Mappers stay free of runes and I/O, so they are unit-tested in the `server` project (`[feature].mapper.spec.ts`).

### 5. Repository Contract & Implementation

The interface lives in `domain/[feature].repository.ts`; the class implementing it lives in `infrastructure/[feature].repository.impl.ts`.

Two things are mandatory in every method:

1. Wrap the call in `safeApiCall` so failures come back as `Result`, never as a thrown error.
2. Validate the response with `parseApiResponse` before mapping. It unwraps the `{ message, data, meta }` envelope and returns the validated payload.

```typescript
import { safeApiCall } from '$lib/shared/infrastructure/api/safe-api-call';
import { axiosClient } from '$lib/shared/infrastructure/api/axios-client';
import { parseApiResponse } from '$lib/shared/infrastructure/api/api-schema';
import type { Result } from '$lib/shared/domain/types/result';
import { projectDtoSchema } from './project.validator';
import { mapProjectDtoToEntity, mapCreateProjectInputToDto } from './project.mapper';
import type { Project, CreateProjectInput } from '../domain/project.entity';
import type { ProjectRepository } from '../domain/project.repository';
import { z } from 'zod';

export class ProjectRepositoryImpl implements ProjectRepository {
	async list(): Promise<Result<Project[]>> {
		return safeApiCall(async () => {
			const response = await axiosClient.get('/projects');
			const dtos = parseApiResponse(z.array(projectDtoSchema), response.data);
			return dtos.map(mapProjectDtoToEntity);
		});
	}

	async create(input: CreateProjectInput): Promise<Result<Project>> {
		return safeApiCall(async () => {
			const response = await axiosClient.post('/projects', mapCreateProjectInputToDto(input));
			return mapProjectDtoToEntity(parseApiResponse(projectDtoSchema, response.data));
		});
	}
}

export const projectRepository = new ProjectRepositoryImpl();
```

### 6. Mock Repository

`infrastructure/[feature].repository.mock.ts` implements the same interface for frontend-first development.

It must honour the **behavioural** contract, not just the type signature. If the real endpoint 401s without a session, the mock must track that state in memory and fail the same way. A mock that always returns success will make every guard and empty-state built on top of it untestable — and the bug only surfaces once the real backend arrives.

### 7. Wiring (DI)

Never decide mock-vs-real inside a use-case. Add the feature's flag to `MOCK_FLAGS` in `$lib/shared/infrastructure/di/mock-config.ts`, then resolve it in the feature's composition root:

```typescript
// application/project.container.ts
import { MOCK_FLAGS } from '$lib/shared/infrastructure/di/mock-config';
import { projectRepository } from '../infrastructure/project.repository.impl';
import { projectRepositoryMock } from '../infrastructure/project.repository.mock';
import type { ProjectRepository } from '../domain/project.repository';

export const projectRepositoryInstance: ProjectRepository = MOCK_FLAGS.project
	? projectRepositoryMock
	: projectRepository;
```

```typescript
// application/project.use-cases.ts
export interface ProjectUseCases {
	list(): Promise<Result<Project[]>>;
	create(input: CreateProjectInput): Promise<Result<Project>>;
}

export function createProjectUseCases(repository: ProjectRepository): ProjectUseCases {
	return {
		list: () => repository.list(),
		create: (input) => repository.create(input)
	};
}

export const projectUseCases = createProjectUseCases(projectRepositoryInstance);
```

The factory is what lets a test pass a fake repository directly — no module mocking, no reaching into the container.
