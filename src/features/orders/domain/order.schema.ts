import { z } from 'zod';

export const orderPaymentStatusSchema = z.enum([
	'LUNAS',
	'PARTIAL_PAID',
	'UNPAID',
	'OVERDUE',
	'CANCELLED',
	'REFUND'
]);

export const orderFulfillmentStatusSchema = z.enum([
	'CREATED',
	'QUEUED',
	'PROCESSING',
	'READY_FOR_PICKUP',
	'PICKED_UP'
]);

export const orderTypeSchema = z.enum(['PRODUCTION', 'RETAIL']);

export const orderCustomerTypeSchema = z.enum(['end_user', 'reseller']);

export const orderPaymentMethodSchema = z.enum(['CASH', 'TRANSFER', 'QRIS', 'PIUTANG']);

export const orderItemSchema = z.object({
	id: z.string().min(1),
	productId: z.string().optional(),
	productName: z.string().min(1),
	variantName: z.string().optional(),
	isProduction: z.boolean(),
	uom: z.string(),
	dimensionText: z.string(),
	finishingText: z.string().optional(),
	quantity: z.number().int().positive(),
	pricePerUnit: z.number().nonnegative(),
	subtotal: z.number().nonnegative()
});

export const orderPaymentRecordSchema = z.object({
	id: z.string().min(1),
	paymentDate: z.string(),
	method: orderPaymentMethodSchema,
	amount: z.number().nonnegative(),
	referenceNumber: z.string().optional(),
	note: z.string().optional(),
	cashierName: z.string().optional()
});

export const orderSchema = z.object({
	id: z.string().min(1),
	invoiceNumber: z.string().min(1),
	orderId: z.string().min(1),
	jobNumber: z.string().min(1),
	orderType: orderTypeSchema,
	status: orderPaymentStatusSchema,
	fulfillmentStatus: orderFulfillmentStatusSchema,
	rackLocation: z.string().nullable().optional(),
	pickedUpAt: z.string().nullable().optional(),
	pickedUpBy: z.string().nullable().optional(),
	customerType: orderCustomerTypeSchema,
	customerName: z.string().min(1),
	customerPhone: z.string(),
	resellerId: z.string().nullable().optional(),
	resellerName: z.string().nullable().optional(),
	items: z.array(orderItemSchema),
	subtotal: z.number().nonnegative(),
	totalPaid: z.number().nonnegative(),
	remainingAmount: z.number().nonnegative(),
	dueDate: z.string().nullable().optional(),
	paymentHistory: z.array(orderPaymentRecordSchema),
	notes: z.string().optional(),
	cancelReason: z.string().nullable().optional(),
	cancelledAt: z.string().nullable().optional(),
	issuedAt: z.string(),
	updatedAt: z.string()
});

export const orderStatsSchema = z.object({
	totalInvoiced: z.number().nonnegative(),
	totalPaid: z.number().nonnegative(),
	totalRemaining: z.number().nonnegative(),
	overdueCount: z.number().int().nonnegative(),
	partialCount: z.number().int().nonnegative(),
	paidCount: z.number().int().nonnegative()
});

export const orderSettlePaymentInputSchema = z.object({
	amount: z.number().positive('Nominal pembayaran harus lebih dari 0'),
	method: orderPaymentMethodSchema,
	referenceNumber: z.string().optional(),
	note: z.string().optional()
});
