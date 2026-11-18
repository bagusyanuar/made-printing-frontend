import { z } from 'zod';

export const expenseCategorySchema = z
	.object({
		code: z.string().optional(),
		name: z
			.string()
			.min(2, 'Nama kategori pengeluaran minimal 2 karakter')
			.max(100, 'Nama kategori pengeluaran maksimal 100 karakter'),
		group: z.enum(['production', 'operational'], {
			error: 'Pilih grup pengeluaran (Produksi atau Operasional)'
		}),
		productCategoryId: z.string().nullable().optional(),
		productCategoryName: z.string().nullable().optional(),
		displayOrder: z.number().min(1, 'Urutan minimal 1').optional(),
		isActive: z.boolean().optional()
	})
	.superRefine((data, ctx) => {
		if (data.group === 'production') {
			if (!data.productCategoryId || data.productCategoryId.trim() === '') {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message: 'Kategori produk terkait wajib dipilih untuk pengeluaran grup produksi',
					path: ['productCategoryId']
				});
			}
		}
	});

export type ExpenseCategoryFormSchema = z.infer<typeof expenseCategorySchema>;
