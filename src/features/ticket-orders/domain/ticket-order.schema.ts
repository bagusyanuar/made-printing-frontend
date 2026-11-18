import { z } from 'zod';

export const ticketOrderItemSchema = z
	.object({
		productVariantId: z.string().min(1, 'Varian produk wajib dipilih'),
		productName: z.string().min(1, 'Nama produk wajib diisi'),
		variantName: z.string().optional(),
		categoryId: z.string().optional(),
		categoryName: z.string().optional(),
		uom: z.string().min(1, 'Satuan hitung wajib dipilih'),
		quantity: z.number().min(1, 'Jumlah minimal 1'),
		lengthM: z.number().nullable().optional(),
		widthM: z.number().nullable().optional(),
		designFileUrl: z.string().nullable().optional(),
		productionNotes: z.string().nullable().optional(),
		finishingIds: z.array(z.string()).optional(),
		finishingNames: z.array(z.string()).optional()
	})
	.superRefine((data, ctx) => {
		const uom = data.uom.toLowerCase();
		if (uom === 'm2' || uom === 'square_meter') {
			if (!data.lengthM || data.lengthM <= 0) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message: 'Panjang (meter) harus lebih dari 0 untuk luas m²',
					path: ['lengthM']
				});
			}
			if (!data.widthM || data.widthM <= 0) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message: 'Lebar (meter) harus lebih dari 0 untuk luas m²',
					path: ['widthM']
				});
			}
		} else if (uom === 'm_lari' || uom === 'meter_run') {
			if (!data.lengthM || data.lengthM <= 0) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message: 'Panjang (meter) harus lebih dari 0 untuk meter lari',
					path: ['lengthM']
				});
			}
		}
	});

export const saveDraftTicketOrderSchema = z
	.object({
		customerType: z.enum(['end_user', 'reseller'], {
			error: 'Pilih jenis pelanggan'
		}),
		customerName: z.string().min(2, 'Nama pelanggan minimal 2 karakter'),
		customerPhone: z.string().min(6, 'Nomor telepon minimal 6 digit'),
		resellerId: z.string().nullable().optional(),
		notes: z.string().optional().default(''),
		deadline: z.string().nullable().optional(),
		items: z.array(ticketOrderItemSchema).min(1, 'Minimal harus ada 1 item pesanan di keranjang')
	})
	.superRefine((data, ctx) => {
		if (data.customerType === 'reseller' && (!data.resellerId || data.resellerId.trim() === '')) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: 'Pilih data reseller rekanan',
				path: ['resellerId']
			});
		}
	});

export const cancelTicketOrderSchema = z.object({
	reason: z.string().min(3, 'Alasan pembatalan minimal 3 karakter')
});

export type TicketOrderItemFormSchema = z.infer<typeof ticketOrderItemSchema>;
export type SaveDraftTicketOrderFormSchema = z.infer<typeof saveDraftTicketOrderSchema>;
export type CancelTicketOrderFormSchema = z.infer<typeof cancelTicketOrderSchema>;
