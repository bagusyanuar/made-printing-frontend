import { z } from 'zod';

export const cashierPaymentMethodSchema = z.enum(['CASH', 'TRANSFER', 'QRIS', 'PIUTANG']);

export const cashierProcessPaymentSchema = z.object({
	isSplit: z.boolean().default(false),
	method: cashierPaymentMethodSchema.optional(),
	singleAmount: z.number().min(0, 'Nominal bayar tidak boleh negatif').optional(),
	splitAmounts: z
		.object({
			cash: z.number().min(0).default(0),
			transfer: z.number().min(0).default(0),
			qris: z.number().min(0).default(0)
		})
		.optional(),
	notes: z.string().max(255).optional()
});

export const cashierCancelOrderSchema = z.object({
	reason: z.string().min(3, 'Alasan pembatalan minimal 3 karakter').max(200, 'Alasan maksimal 200 karakter')
});

export const cashierAddRetailItemSchema = z.object({
	catalogItemId: z.string().optional(),
	name: z.string().min(1, 'Nama item wajib diisi'),
	price: z.number().min(0, 'Harga wajib diisi dan minimal 0'),
	quantity: z.number().min(1, 'Jumlah minimal 1'),
	uom: z.string().default('pcs')
});

export const cashierCreateRetailOrderSchema = z.object({
	customerName: z.string().min(1, 'Nama pelanggan wajib diisi'),
	customerPhone: z.string().max(20).optional(),
	items: z
		.array(
			z.object({
				catalogItemId: z.string().optional(),
				name: z.string().min(1, 'Nama produk wajib diisi'),
				price: z.number().min(0),
				quantity: z.number().min(1),
				uom: z.string().default('pcs')
			})
		)
		.min(1, 'Minimal tambahkan 1 produk ritel')
});

export type CashierProcessPaymentSchemaInput = z.infer<typeof cashierProcessPaymentSchema>;
export type CashierCancelOrderSchemaInput = z.infer<typeof cashierCancelOrderSchema>;
export type CashierAddRetailItemSchemaInput = z.infer<typeof cashierAddRetailItemSchema>;
export type CashierCreateRetailOrderSchemaInput = z.infer<typeof cashierCreateRetailOrderSchema>;
