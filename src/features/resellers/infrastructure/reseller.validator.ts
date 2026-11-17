import { z } from 'zod';
import type { ResellerDto } from './reseller.dto';

export const resellerDtoSchema = z.object({
	id: z.string(),
	code: z.string(),
	name: z.string(),
	owner_name: z.string(),
	phone: z.string(),
	email: z.string().nullable().optional(),
	address: z.string().nullable().optional(),
	tier: z.enum(['silver', 'gold', 'platinum']),
	credit_limit: z.number(),
	used_credit: z.number().nullable().optional(),
	deposit_balance: z.number().nullable().optional(),
	term_of_payment_days: z.number(),
	status: z.enum(['active', 'near_limit', 'auto_hold', 'inactive']),
	notes: z.string().nullable().optional(),
	is_active: z.boolean(),
	display_order: z.number().nullable().optional(),
	created_at: z.string(),
	updated_at: z.string()
}) satisfies z.ZodType<ResellerDto>;
