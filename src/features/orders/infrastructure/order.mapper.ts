import type {
	Order,
	OrderItem,
	OrderPaymentRecord,
	OrderStats,
	OrderFulfillmentStatus
} from '../domain/order.entity';
import type {
	OrderDto,
	OrderItemDto,
	OrderPaymentRecordDto,
	OrderStatsDto
} from './order.dto';

export function mapOrderItemDtoToEntity(dto: OrderItemDto): OrderItem {
	return {
		id: dto.id,
		productId: dto.product_id,
		productName: dto.product_name,
		variantName: dto.variant_name,
		isProduction: dto.is_production,
		uom: dto.uom,
		dimensionText: dto.dimension_text || '',
		finishingText: dto.finishing_text,
		quantity: dto.quantity,
		pricePerUnit: dto.price_per_unit,
		subtotal: dto.subtotal
	};
}

export function mapOrderPaymentRecordDtoToEntity(dto: OrderPaymentRecordDto): OrderPaymentRecord {
	return {
		id: dto.id,
		paymentDate: dto.payment_date,
		method: dto.method,
		amount: dto.amount,
		referenceNumber: dto.reference_number,
		note: dto.note,
		cashierName: dto.cashier_name
	};
}

export function mapOrderDtoToEntity(dto: OrderDto): Order {
	return {
		id: dto.id,
		invoiceNumber: dto.invoice_number,
		orderId: dto.order_id,
		jobNumber: dto.job_number,
		orderType: dto.order_type,
		status: dto.status,
		fulfillmentStatus: (dto.fulfillment_status as OrderFulfillmentStatus) || 'PROCESSING',
		rackLocation: dto.rack_location ?? null,
		pickedUpAt: dto.picked_up_at ?? null,
		pickedUpBy: dto.picked_up_by ?? null,
		customerType: dto.customer_type,
		customerName: dto.customer_name,
		customerPhone: dto.customer_phone,
		resellerId: dto.reseller_id ?? null,
		resellerName: dto.reseller_name ?? null,
		items: dto.items.map(mapOrderItemDtoToEntity),
		subtotal: dto.subtotal,
		totalPaid: dto.total_paid,
		remainingAmount: dto.remaining_amount,
		dueDate: dto.due_date ?? null,
		paymentHistory: dto.payment_history.map(mapOrderPaymentRecordDtoToEntity),
		notes: dto.notes,
		cancelReason: dto.cancel_reason ?? null,
		cancelledAt: dto.cancelled_at ?? null,
		issuedAt: dto.issued_at,
		updatedAt: dto.updated_at
	};
}

export function mapOrderStatsDtoToEntity(dto: OrderStatsDto): OrderStats {
	return {
		totalInvoiced: dto.total_invoiced,
		totalPaid: dto.total_paid,
		totalRemaining: dto.total_remaining,
		overdueCount: dto.overdue_count,
		partialCount: dto.partial_count,
		paidCount: dto.paid_count
	};
}
