import { z } from 'zod';
import { dateStringSchema } from '$lib/shared/infrastructure/api/api-schema';
import type {
	ExpenseDto,
	ExpenseItemDto,
	ExpensePaymentLineDto,
	ExpensePaymentRecordDto,
	ExpenseSettlePaymentInputDto
} from './expense.dto';

export const expensePaymentLineDtoSchema = z.object({
	account_name: z.string(),
	amount: z.number()
}) satisfies z.ZodType<ExpensePaymentLineDto>;

export const expensePaymentRecordDtoSchema = z.object({
	id: z.string(),
	payment_date: dateStringSchema,
	account_name: z.string(),
	amount: z.number(),
	reference_number: z.string().nullable().optional(),
	note: z.string().nullable().optional(),
	recorded_by: z.string().nullable().optional()
}) satisfies z.ZodType<ExpensePaymentRecordDto>;

export const expenseItemDtoSchema = z.object({
	id: z.string(),
	group: z.enum(['production', 'operational']),
	category_id: z.string(),
	category_name: z.string(),
	product_category_name: z.string().nullable().optional(),
	description: z.string(),
	amount: z.number(),
	notes: z.string().nullable().optional()
}) satisfies z.ZodType<ExpenseItemDto>;

export const expenseDtoSchema = z.object({
	id: z.string(),
	code: z.string(),
	expense_date: dateStringSchema,
	group: z.enum(['production', 'operational', 'mixed']),
	items: z.array(expenseItemDtoSchema),
	vendor_id: z.string().nullable().optional(),
	vendor_name: z.string().nullable().optional(),
	account_name: z.string(),
	payment_lines: z.array(expensePaymentLineDtoSchema),
	payment_history: z.array(expensePaymentRecordDtoSchema),
	subtotal: z.number(),
	discount_amount: z.number(),
	amount: z.number(),
	total_paid: z.number(),
	remaining_amount: z.number(),
	payment_status: z.enum(['LUNAS', 'PARTIAL_PAID', 'UNPAID', 'CANCELLED']),
	status: z.enum(['APPROVED', 'PENDING', 'CANCELLED']),
	recorded_by: z.string(),
	approved_by: z.string().nullable().optional(),
	approved_at: dateStringSchema.nullable().optional(),
	cancel_reason: z.string().nullable().optional(),
	cancelled_at: dateStringSchema.nullable().optional(),
	reference_number: z.string().nullable().optional(),
	notes: z.string().nullable().optional(),
	created_at: dateStringSchema,
	updated_at: dateStringSchema
}) satisfies z.ZodType<ExpenseDto>;

export const expenseListResponseDtoSchema = z.array(expenseDtoSchema);

export const expenseSettlePaymentInputDtoSchema = z.object({
	amount: z.number(),
	account_name: z.string(),
	reference_number: z.string().optional(),
	note: z.string().optional()
}) satisfies z.ZodType<ExpenseSettlePaymentInputDto>;
