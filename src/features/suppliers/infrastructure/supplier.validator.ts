import { z } from 'zod';

export const supplierDtoSchema = z.object({
	id: z.string(),
	code: z.string(),
	name: z.string(),
	contact_person: z.string().nullable().optional(),
	phone: z.string().nullable().optional(),
	email: z.string().nullable().optional(),
	address: z.string().nullable().optional(),
	notes: z.string().nullable().optional(),
	is_active: z.boolean().optional().default(true),
	display_order: z.number().optional().default(1),
	created_at: z.string().optional(),
	updated_at: z.string().optional()
});

export const supplierListResponseSchema = z.array(supplierDtoSchema);
