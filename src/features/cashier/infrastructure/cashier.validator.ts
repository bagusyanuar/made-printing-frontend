import { z } from 'zod';

export const cashierOrderItemDtoSchema = z.object({
	id: z.string(),
	product_id: z.string().optional(),
	product_variant_id: z.string().optional(),
	product_name: z.string(),
	variant_name: z.string().optional(),
	is_production: z.boolean().default(true),
	uom: z.string().default('pcs'),
	length_m: z.number().nullable().optional(),
	width_m: z.number().nullable().optional(),
	dimension_text: z.string().optional(),
	finishing_text: z.string().optional(),
	quantity: z.number().min(0),
	price_per_unit: z.number().min(0),
	subtotal: z.number().min(0),
	design_file_url: z.string().nullable().optional(),
	production_notes: z.string().nullable().optional()
});

export const cashierSplitPaymentDetailDtoSchema = z.object({
	method: z.enum(['CASH', 'TRANSFER', 'QRIS', 'PIUTANG']),
	amount: z.number().min(0),
	reference_number: z.string().optional()
});

export const cashierOrderDtoSchema = z.object({
	id: z.string(),
	job_number: z.string(),
	invoice_number: z.string().nullable().optional(),
	order_type: z.enum(['PRODUCTION', 'RETAIL']).default('PRODUCTION'),
	status: z.enum(['DRAFT', 'PENDING_PAYMENT', 'PARTIAL_PAID', 'LUNAS', 'CANCELLED']),
	customer_type: z.enum(['end_user', 'reseller']).default('end_user'),
	customer_name: z.string(),
	customer_phone: z.string().default(''),
	reseller_id: z.string().nullable().optional(),
	reseller_name: z.string().nullable().optional(),
	designer_id: z.string().nullable().optional(),
	designer_name: z.string().nullable().optional(),
	items: z.array(cashierOrderItemDtoSchema).default([]),
	subtotal: z.number().min(0).default(0),
	total_paid: z.number().min(0).default(0),
	remaining_amount: z.number().min(0).default(0),
	change_amount: z.number().min(0).default(0),
	payment_method: z.string().nullable().optional(),
	payment_details: z.array(cashierSplitPaymentDetailDtoSchema).optional(),
	notes: z.string().optional(),
	cancel_reason: z.string().nullable().optional(),
	cancelled_at: z.string().nullable().optional(),
	paid_at: z.string().nullable().optional(),
	created_at: z.string(),
	updated_at: z.string()
});

export const cashierRetailCatalogItemDtoSchema = z.object({
	id: z.string(),
	variant_id: z.string().optional(),
	name: z.string(),
	category_name: z.string(),
	price: z.number().min(0),
	uom: z.string().default('pcs'),
	stock: z.number().default(0),
	is_production: z.boolean().default(false)
});
