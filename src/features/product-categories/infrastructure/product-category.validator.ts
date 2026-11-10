import { z } from 'zod';
import { dateStringSchema } from '$lib/shared/infrastructure/api/api-schema';
import type { ProductCategoryDto } from './product-category.dto';

export const productCategoryDtoSchema = z.object({
	id: z.union([z.string(), z.number()]),
	code: z.string(),
	name: z.string(),
	calculation_type: z.enum(['square_meter', 'sheet', 'meter_run', 'piece']),
	description: z.string().nullable(),
	is_active: z.boolean(),
	created_at: dateStringSchema,
	updated_at: dateStringSchema
}) satisfies z.ZodType<ProductCategoryDto>;
