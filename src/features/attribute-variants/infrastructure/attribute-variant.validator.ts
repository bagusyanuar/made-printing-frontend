import { z } from 'zod';

export const productAttributeVariantDtoSchema = z.object({
	id: z.union([z.string(), z.number()]),
	attribute_id: z.union([z.string(), z.number()]),
	name: z.string(),
	code: z.string(),
	description: z.string().nullable().optional(),
	display_order: z.number().optional().default(1),
	is_active: z.boolean(),
	created_at: z.string(),
	updated_at: z.string()
});

export const productAttributeDtoSchema = z.object({
	id: z.union([z.string(), z.number()]),
	name: z.string(),
	code: z.string(),
	description: z.string().nullable().optional(),
	is_required: z.boolean().optional().default(false),
	display_order: z.number().optional().default(1),
	is_active: z.boolean(),
	variants: z.array(productAttributeVariantDtoSchema).optional().default([]),
	created_at: z.string(),
	updated_at: z.string()
});
