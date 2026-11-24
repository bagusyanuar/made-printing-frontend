import { z } from 'zod';
import type {
	OrderItemDto,
	OrderPaymentRecordDto,
	OrderDto,
	OrderStatsDto,
	OrderSettlePaymentInputDto
} from './order.dto';

export const orderItemDtoSchema = z.object({
	id: z.string(),
	product_id: z.string().optional(),
	product_name: z.string(),
	variant_name: z.string().optional(),
	is_production: z.boolean(),
	uom: z.string(),
	dimension_text: z.string().optional(),
	finishing_text: z.string().optional(),
	quantity: z.number(),
	price_per_unit: z.number(),
	subtotal: z.number()
}) satisfies z.ZodType<OrderItemDto>;

export const orderPaymentRecordDtoSchema = z.object({
	id: z.string(),
	payment_date: z.string(),
	method: z.enum(['CASH', 'TRANSFER', 'QRIS', 'PIUTANG']),
	amount: z.number(),
	reference_number: z.string().optional(),
	note: z.string().optional(),
	cashier_name: z.string().optional()
}) satisfies z.ZodType<OrderPaymentRecordDto>;

export const orderDtoSchema = z.object({
	id: z.string(),
	invoice_number: z.string(),
	order_id: z.string(),
	job_number: z.string(),
	order_type: z.enum(['PRODUCTION', 'RETAIL']),
	status: z.enum(['LUNAS', 'PARTIAL_PAID', 'UNPAID', 'OVERDUE', 'CANCELLED']),
	fulfillment_status: z.enum(['CREATED', 'QUEUED', 'PROCESSING', 'READY_FOR_PICKUP', 'PICKED_UP']).optional(),
	rack_location: z.string().nullable().optional(),
	picked_up_at: z.string().nullable().optional(),
	picked_up_by: z.string().nullable().optional(),
	customer_type: z.enum(['end_user', 'reseller']),
	customer_name: z.string(),
	customer_phone: z.string(),
	reseller_id: z.string().nullable().optional(),
	reseller_name: z.string().nullable().optional(),
	items: z.array(orderItemDtoSchema),
	subtotal: z.number(),
	total_paid: z.number(),
	remaining_amount: z.number(),
	due_date: z.string().nullable().optional(),
	payment_history: z.array(orderPaymentRecordDtoSchema),
	notes: z.string().optional(),
	cancel_reason: z.string().nullable().optional(),
	cancelled_at: z.string().nullable().optional(),
	issued_at: z.string(),
	updated_at: z.string()
}) satisfies z.ZodType<OrderDto>;

export const orderListResponseDtoSchema = z.array(orderDtoSchema);

export const orderStatsDtoSchema = z.object({
	total_invoiced: z.number(),
	total_paid: z.number(),
	total_remaining: z.number(),
	overdue_count: z.number(),
	partial_count: z.number(),
	paid_count: z.number()
}) satisfies z.ZodType<OrderStatsDto>;

export const orderSettlePaymentInputDtoSchema = z.object({
	amount: z.number(),
	method: z.enum(['CASH', 'TRANSFER', 'QRIS', 'PIUTANG']),
	reference_number: z.string().optional(),
	note: z.string().optional()
}) satisfies z.ZodType<OrderSettlePaymentInputDto>;
