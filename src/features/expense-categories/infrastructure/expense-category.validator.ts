import { z } from 'zod';

export const expenseCategoryDtoSchema = z.object({
	id: z.string(),
	code: z.string(),
	name: z.string(),
	group: z.enum(['production', 'operational']),
	product_category_id: z.string().nullable().optional(),
	product_category_name: z.string().nullable().optional(),
	display_order: z.number().optional().default(1),
	is_active: z.boolean().optional().default(true),
	created_at: z.string().optional(),
	updated_at: z.string().optional()
});

export const expenseCategoryListResponseSchema = z.array(expenseCategoryDtoSchema);
