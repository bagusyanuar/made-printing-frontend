import { z } from 'zod';

export const resellerTierSchema = z.enum(['silver', 'gold', 'platinum'], {
	error: 'Tier reseller tidak valid'
});

export const resellerStatusSchema = z.enum(['active', 'near_limit', 'auto_hold', 'inactive'], {
	error: 'Status reseller tidak valid'
});

export const resellerSchema = z.object({
	code: z.string().optional(),
	name: z
		.string()
		.min(2, 'Nama reseller minimal 2 karakter')
		.max(100, 'Nama reseller maksimal 100 karakter'),
	ownerName: z
		.string()
		.min(2, 'Nama reseller minimal 2 karakter')
		.max(100, 'Nama reseller maksimal 100 karakter'),
	phone: z
		.string()
		.max(30, 'Nomor telepon maksimal 30 digit')
		.or(z.literal(''))
		.nullable()
		.optional(),
	email: z
		.string()
		.email('Format email tidak valid')
		.or(z.literal(''))
		.nullable()
		.optional(),
	address: z.string().nullable().optional(),
	tier: resellerTierSchema.optional(),
	creditLimit: z.number().min(0, 'Limit kredit tidak boleh negatif').optional(),
	depositBalance: z.number().min(0, 'Saldo deposit tidak boleh negatif').optional(),
	termOfPaymentDays: z
		.number()
		.min(0, 'Jatuh tempo tidak boleh negatif')
		.max(365, 'Jatuh tempo maksimal 365 hari')
		.optional(),
	status: resellerStatusSchema.optional(),
	notes: z.string().nullable().optional(),
	isActive: z.boolean().optional(),
	displayOrder: z.number().optional()
});

export type ResellerFormSchema = z.infer<typeof resellerSchema>;

export const resellerDepositSchema = z.object({
	amount: z.number().min(1, 'Jumlah saldo deposit minimal Rp 1'),
	note: z.string().max(255, 'Catatan maksimal 255 karakter').optional()
});

export type ResellerDepositFormSchema = z.infer<typeof resellerDepositSchema>;
