import { z } from 'zod';

export const supplierSchema = z.object({
	code: z.string().optional(),
	name: z
		.string()
		.min(2, 'Nama supplier minimal 2 karakter')
		.max(100, 'Nama supplier maksimal 100 karakter'),
	contactPerson: z
		.string()
		.max(100, 'Nama kontak maksimal 100 karakter')
		.or(z.literal(''))
		.nullable()
		.optional(),
	phone: z
		.string()
		.max(30, 'Nomor telepon maksimal 30 digit')
		.or(z.literal(''))
		.nullable()
		.optional(),
	email: z.string().email('Format email tidak valid').or(z.literal('')).nullable().optional(),
	address: z.string().nullable().optional(),
	notes: z.string().nullable().optional(),
	isActive: z.boolean().optional(),
	displayOrder: z.number().min(1, 'Urutan minimal 1').optional()
});

export type SupplierFormSchema = z.infer<typeof supplierSchema>;
