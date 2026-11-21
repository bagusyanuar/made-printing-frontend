import type {
	CashierOrder,
	CashierOrderItem,
	CashierPaymentMethod,
	CashierRetailCatalogItem,
	CashierSplitPaymentDetail
} from '../domain/cashier.entity';
import type {
	CashierOrderDto,
	CashierOrderItemDto,
	CashierRetailCatalogItemDto,
	CashierSplitPaymentDetailDto
} from './cashier.dto';

export function mapCashierOrderItemDtoToEntity(dto: CashierOrderItemDto): CashierOrderItem {
	return {
		id: dto.id,
		productId: dto.product_id,
		productVariantId: dto.product_variant_id,
		productName: dto.product_name,
		variantName: dto.variant_name,
		isProduction: dto.is_production,
		uom: dto.uom,
		lengthM: dto.length_m ?? null,
		widthM: dto.width_m ?? null,
		dimensionText:
			dto.dimension_text ||
			(dto.uom === 'm2' && dto.length_m && dto.width_m
				? `${dto.length_m} x ${dto.width_m} m (${(dto.length_m * dto.width_m).toFixed(2)} m²)`
				: `${dto.quantity} ${dto.uom}`),
		finishingText: dto.finishing_text || '-',
		quantity: dto.quantity,
		pricePerUnit: dto.price_per_unit,
		subtotal: dto.subtotal,
		designFileUrl: dto.design_file_url ?? null,
		productionNotes: dto.production_notes ?? null
	};
}

export function mapCashierSplitPaymentDetailDtoToEntity(
	dto: CashierSplitPaymentDetailDto
): CashierSplitPaymentDetail {
	return {
		method: dto.method,
		amount: dto.amount,
		referenceNumber: dto.reference_number
	};
}

export function mapCashierOrderDtoToEntity(dto: CashierOrderDto): CashierOrder {
	return {
		id: dto.id,
		jobNumber: dto.job_number,
		invoiceNumber: dto.invoice_number ?? null,
		orderType: dto.order_type,
		status: dto.status,
		customerType: dto.customer_type,
		customerName: dto.customer_name,
		customerPhone: dto.customer_phone,
		resellerId: dto.reseller_id ?? null,
		resellerName: dto.reseller_name ?? null,
		designerId: dto.designer_id ?? null,
		designerName: dto.designer_name ?? null,
		items: dto.items.map(mapCashierOrderItemDtoToEntity),
		subtotal: dto.subtotal,
		totalPaid: dto.total_paid,
		remainingAmount: dto.remaining_amount,
		changeAmount: dto.change_amount,
		paymentMethod: (dto.payment_method as CashierPaymentMethod) || null,
		paymentDetails: dto.payment_details
			? dto.payment_details.map(mapCashierSplitPaymentDetailDtoToEntity)
			: undefined,
		notes: dto.notes,
		cancelReason: dto.cancel_reason ?? null,
		cancelledAt: dto.cancelled_at ?? null,
		paidAt: dto.paid_at ?? null,
		createdAt: dto.created_at,
		updatedAt: dto.updated_at
	};
}

export function mapCashierRetailCatalogItemDtoToEntity(
	dto: CashierRetailCatalogItemDto
): CashierRetailCatalogItem {
	return {
		id: dto.id,
		variantId: dto.variant_id,
		name: dto.name,
		categoryName: dto.category_name,
		price: dto.price,
		uom: dto.uom,
		stock: dto.stock,
		isProduction: dto.is_production
	};
}
