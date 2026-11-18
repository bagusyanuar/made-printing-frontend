import type {
	TicketOrder,
	TicketOrderItem,
	TicketOrderStatus,
	SaveDraftTicketOrderInput
} from '../domain/ticket-order.entity';
import { formatDimensionText, calculateTotalArea } from '../domain/ticket-order.entity';
import type {
	OrderResponseDto,
	OrderItemResponseDto,
	DraftOrderRequestDto,
	DraftOrderItemRequestDto
} from './ticket-order.dto';

const VALID_STATUSES: Set<TicketOrderStatus> = new Set([
	'DRAFT',
	'PENDING_PAYMENT',
	'IN_PRODUCTION',
	'READY_FOR_PICKUP',
	'COMPLETED',
	'CANCELLED'
]);

export function mapOrderItemDtoToEntity(dto: OrderItemResponseDto): TicketOrderItem {
	const lengthM = dto.length_m ?? null;
	const widthM = dto.width_m ?? null;
	const dimensionText = formatDimensionText(dto.uom, lengthM, widthM, dto.quantity);

	return {
		id: dto.id,
		productVariantId: dto.product_variant_id,
		productName: dto.product_name,
		variantName: dto.variant_name,
		categoryId: dto.category_id,
		categoryName: dto.category_name,
		uom: dto.uom,
		quantity: dto.quantity,
		lengthM,
		widthM,
		dimensionText,
		designFileUrl: dto.design_file_url ?? null,
		productionNotes: dto.production_notes ?? null,
		finishingIds: dto.finishing_ids ?? []
	};
}

export function mapOrderDtoToEntity(dto: OrderResponseDto): TicketOrder {
	const rawStatus = (dto.status || 'DRAFT').toUpperCase();
	const status: TicketOrderStatus = VALID_STATUSES.has(rawStatus as TicketOrderStatus)
		? (rawStatus as TicketOrderStatus)
		: 'DRAFT';

	const items = (dto.order_items ?? []).map(mapOrderItemDtoToEntity);
	const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);
	const totalAreaM2 = calculateTotalArea(items);

	return {
		id: dto.id,
		jobNumber: dto.job_number,
		invoiceNumber: dto.invoice_number ?? null,
		designerId: dto.designer_id ?? '',
		designerName: dto.designer_name ?? 'Desainer',
		status,
		customerType: dto.reseller_id ? 'reseller' : 'end_user',
		customerName: dto.customer_name || 'Customer Walk-in',
		customerPhone: dto.customer_phone || '-',
		resellerId: dto.reseller_id ?? null,
		resellerName: dto.reseller_name ?? null,
		notes: dto.notes ?? '',
		deadline: dto.deadline ?? null,
		cancelReason: dto.cancel_reason ?? null,
		cancelledAt: dto.cancelled_at ?? null,
		invoicedAt: dto.invoiced_at ?? null,
		items,
		totalItems,
		totalAreaM2,
		createdAt: dto.created_at,
		updatedAt: dto.updated_at
	};
}

export function mapSaveDraftInputToDto(input: SaveDraftTicketOrderInput): DraftOrderRequestDto {
	const items: DraftOrderItemRequestDto[] = input.items.map((item) => ({
		product_variant_id: item.productVariantId,
		uom: item.uom,
		quantity: item.quantity,
		length_m: item.lengthM ?? null,
		width_m: item.widthM ?? null,
		design_file_url: item.designFileUrl ?? null,
		production_notes: item.productionNotes ?? null,
		finishing_ids: item.finishingIds ?? []
	}));

	return {
		designer_id: input.designerId,
		reseller_id: input.customerType === 'reseller' ? input.resellerId ?? null : null,
		customer_name: input.customerName,
		customer_phone: input.customerPhone,
		notes: input.notes,
		deadline: input.deadline ?? null,
		items
	};
}
