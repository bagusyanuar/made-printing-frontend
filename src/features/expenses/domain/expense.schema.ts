import { z } from 'zod';
import type { ExpenseInput, ExpenseItemInput, ExpensePaymentLine } from './expense.entity';

export const expenseItemSchema = z.object({
	group: z.enum(['production', 'operational'], {
		error: 'Pilih grup pengeluaran (Produksi atau Operasional)'
	}),
	categoryId: z.string().min(1, 'Kategori pengeluaran wajib dipilih'),
	categoryName: z.string().min(1, 'Nama kategori wajib diisi'),
	productCategoryName: z.string().nullable().optional(),
	description: z
		.string()
		.trim()
		.min(3, 'Keterangan item minimal 3 karakter')
		.max(200, 'Keterangan item maksimal 200 karakter'),
	amount: z.number().min(100, 'Nominal item minimal Rp 100'),
	notes: z.string().max(200, 'Catatan item maksimal 200 karakter').nullable().optional()
}) satisfies z.ZodType<ExpenseItemInput>;

export const expensePaymentLineSchema = z.object({
	accountName: z.string().min(1, 'Sumber dana wajib dipilih'),
	amount: z.number().min(1, 'Nominal sumber dana harus lebih besar dari 0')
}) satisfies z.ZodType<ExpensePaymentLine>;

export const createExpenseSchema = z
	.object({
		expenseDate: z.string().optional(),
		items: z.array(expenseItemSchema).min(1, 'Tambahkan minimal 1 item pengeluaran ke keranjang'),
		discountAmount: z.number().min(0, 'Potongan / diskon tidak boleh negatif').optional(),
		vendorId: z.string().nullable().optional(),
		vendorName: z
			.string()
			.max(100, 'Nama vendor/supplier maksimal 100 karakter')
			.nullable()
			.optional(),
		paymentLines: z.array(expensePaymentLineSchema),
		status: z.enum(['APPROVED', 'PENDING', 'CANCELLED']).optional(),
		referenceNumber: z
			.string()
			.max(80, 'Nomor referensi maksimal 80 karakter')
			.nullable()
			.optional(),
		notes: z.string().max(300, 'Catatan maksimal 300 karakter').nullable().optional()
	})
	.superRefine((data, ctx) => {
		const subtotal = data.items.reduce((sum, item) => sum + item.amount, 0);
		const discount = data.discountAmount ?? 0;

		if (discount > subtotal) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: 'Potongan / diskon tidak boleh melebihi subtotal item',
				path: ['discountAmount']
			});
			return;
		}

		const grandTotal = Math.max(0, subtotal - discount);
		const paymentsTotal = data.paymentLines.reduce((sum, line) => sum + line.amount, 0);
		if (paymentsTotal > grandTotal) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: 'Nominal pembayaran tidak boleh melebihi total akhir nota',
				path: ['paymentLines']
			});
		}
	}) satisfies z.ZodType<ExpenseInput>;

export type ExpenseItemSchema = z.infer<typeof expenseItemSchema>;
export type CreateExpenseSchema = z.infer<typeof createExpenseSchema>;
