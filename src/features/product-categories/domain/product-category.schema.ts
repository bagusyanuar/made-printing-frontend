import { z } from 'zod';
import type { ProductCategoryInput } from './product-category.entity';

export const productCategorySchema = z.object({
	code: z
		.string()
		.min(1, 'Kode kategori wajib diisi')
		.max(20, 'Kode kategori maksimal 20 karakter')
		.regex(/^[A-Z0-9_-]+$/, 'Kode hanya boleh berupa huruf kapital, angka, strip, atau underscore'),
	name: z
		.string()
		.min(1, 'Nama kategori wajib diisi')
		.max(100, 'Nama kategori maksimal 100 karakter'),
	type: z.enum(['production', 'non_production'], {
		error: 'Tipe kategori wajib dipilih'
	}),
	spkCategory: z.string().nullable().optional(),
	displayOrder: z.coerce.number().int().min(1, 'Index display minimal 1'),
	calculationType: z.enum(['square_meter', 'sheet', 'meter_run', 'piece'], {
		error: 'Model kalkulasi wajib dipilih'
	}),
	description: z.string().max(255, 'Keterangan maksimal 255 karakter').nullable().optional(),
	isActive: z.boolean()
}) satisfies z.ZodType<ProductCategoryInput>;
