import { z } from 'zod';

export const orderItemResponseDtoSchema = z.object({
	id: z.string(),
	product_variant_id: z.string(),
	product_name: z.string(),
	variant_name: z.string().optional(),
	category_id: z.string().optional(),
	category_name: z.string().optional(),
	uom: z.string(),
	quantity: z.number(),
	design_file_url: z.string().nullable().optional(),
	production_notes: z.string().nullable().optional(),
	length_m: z.number().nullable().optional(),
	width_m: z.number().nullable().optional(),
	price_per_unit: z.number().optional(),
	additional_cost: z.number().optional(),
	subtotal: z.number().optional(),
	finishing_ids: z.array(z.string()).optional()
});

export const orderResponseDtoSchema = z.object({
	id: z.string(),
	job_number: z.string(),
	invoice_number: z.string().nullable().optional(),
	designer_id: z.string().optional().default(''),
	designer_name: z.string().optional().default('Desainer'),
	status: z.string(),
	payment_status: z.string().optional(),
	customer_name: z.string().nullable().optional(),
	customer_phone: z.string().nullable().optional(),
	reseller_id: z.string().nullable().optional(),
	reseller_name: z.string().nullable().optional(),
	notes: z.string().optional().default(''),
	deadline: z.string().nullable().optional(),
	cancel_reason: z.string().nullable().optional(),
	cancelled_at: z.string().nullable().optional(),
	invoiced_at: z.string().nullable().optional(),
	order_items: z.array(orderItemResponseDtoSchema).optional().default([]),
	created_at: z.string(),
	updated_at: z.string()
});

export const orderListResponseDtoSchema = z.array(orderResponseDtoSchema);
