import { z } from 'zod';

export const attributeVariantBatchItemSchema = z.object({
	name: z.string().trim().min(1, 'Nama varian minimal 1 karakter'),
	displayOrder: z.coerce.number().int().min(1).default(1)
});

export const attributeInputSchema = z.object({
	name: z
		.string()
		.trim()
		.min(2, 'Nama atribut minimal 2 karakter')
		.max(100, 'Nama atribut maksimal 100 karakter'),
	code: z.string().trim().max(50, 'Kode atribut maksimal 50 karakter').optional(),
	description: z.string().trim().max(255, 'Deskripsi maksimal 255 karakter').nullable().optional(),
	isRequired: z.boolean().default(false),
	displayOrder: z.coerce.number().int().min(1).default(1),
	isActive: z.boolean().default(true),
	variants: z.array(attributeVariantBatchItemSchema).optional().default([])
});

export const variantInputSchema = z.object({
	attributeId: z.string().min(1, 'ID Atribut wajib diisi'),
	name: z
		.string()
		.trim()
		.min(1, 'Nama varian minimal 1 karakter')
		.max(100, 'Nama varian maksimal 100 karakter'),
	code: z.string().trim().max(50, 'Kode varian maksimal 50 karakter').optional(),
	description: z.string().trim().max(255, 'Deskripsi maksimal 255 karakter').nullable().optional(),
	displayOrder: z.coerce.number().int().min(1).default(1),
	isActive: z.boolean().default(true)
});

export type AttributeInputSchema = z.infer<typeof attributeInputSchema>;
export type VariantInputSchema = z.infer<typeof variantInputSchema>;
