export type TicketOrderStatus =
	| 'DRAFT'
	| 'PENDING_PAYMENT'
	| 'IN_PRODUCTION'
	| 'READY_FOR_PICKUP'
	| 'COMPLETED'
	| 'CANCELLED';

export type TicketOrderCustomerType = 'end_user' | 'reseller';

export interface TicketOrderItem {
	id: string;
	productVariantId: string;
	productName: string;
	variantName?: string;
	categoryId?: string;
	categoryName?: string;
	uom: string; // 'm2' | 'm_lari' | 'pcs' | 'lembar' | 'box'
	quantity: number;
	lengthM?: number | null;
	widthM?: number | null;
	dimensionText: string;
	designFileUrl?: string | null;
	productionNotes?: string | null;
	finishingIds?: string[];
	finishingNames?: string[];
}

export interface TicketOrder {
	id: string;
	jobNumber: string;
	invoiceNumber?: string | null;
	designerId: string;
	designerName: string;
	status: TicketOrderStatus;
	customerType: TicketOrderCustomerType;
	customerName: string;
	customerPhone: string;
	resellerId?: string | null;
	resellerName?: string | null;
	notes: string;
	deadline?: string | null;
	cancelReason?: string | null;
	cancelledAt?: string | null;
	invoicedAt?: string | null;
	items: TicketOrderItem[];
	totalItems: number;
	totalAreaM2: number;
	createdAt: string;
	updatedAt: string;
}

export interface TicketOrderItemInput {
	productVariantId: string;
	productName: string;
	variantName?: string;
	categoryId?: string;
	categoryName?: string;
	uom: string;
	quantity: number;
	lengthM?: number | null;
	widthM?: number | null;
	designFileUrl?: string | null;
	productionNotes?: string | null;
	finishingIds?: string[];
	finishingNames?: string[];
}

export interface SaveDraftTicketOrderInput {
	designerId?: string;
	customerType: TicketOrderCustomerType;
	customerName: string;
	customerPhone: string;
	resellerId?: string | null;
	notes: string;
	deadline?: string | null;
	items: TicketOrderItemInput[];
}

export interface TicketOrderListParams {
	page?: number;
	limit?: number;
	status?: string;
	search?: string;
}

export function formatDimensionText(
	uom: string,
	lengthM?: number | null,
	widthM?: number | null,
	qty = 1
): string {
	const normalizedUom = uom.toLowerCase();
	if (normalizedUom === 'm2' || normalizedUom === 'square_meter') {
		const l = lengthM ?? 0;
		const w = widthM ?? 0;
		const area = (l * w).toFixed(2);
		return `${l} × ${w} m (${area} m²)`;
	}
	if (normalizedUom === 'm_lari' || normalizedUom === 'meter_run') {
		return `${lengthM ?? 0} m lari`;
	}
	if (normalizedUom === 'lembar' || normalizedUom === 'sheet') {
		return `${qty} Lembar (A3+)`;
	}
	if (normalizedUom === 'box') {
		return `${qty} Box`;
	}
	return `${qty} Pcs`;
}

export function calculateTotalArea(items: TicketOrderItem[]): number {
	return items.reduce((acc, item) => {
		const uom = item.uom.toLowerCase();
		if (uom === 'm2' || uom === 'square_meter') {
			const l = item.lengthM ?? 0;
			const w = item.widthM ?? 0;
			return acc + l * w * item.quantity;
		}
		return acc;
	}, 0);
}

export function getStatusBadgeVariant(
	status: TicketOrderStatus
): 'default' | 'secondary' | 'outline' | 'danger' {
	switch (status) {
		case 'DRAFT':
			return 'secondary';
		case 'PENDING_PAYMENT':
			return 'outline';
		case 'IN_PRODUCTION':
			return 'default';
		case 'READY_FOR_PICKUP':
			return 'default';
		case 'COMPLETED':
			return 'secondary';
		case 'CANCELLED':
			return 'danger';
		default:
			return 'secondary';
	}
}

export function getStatusLabel(status: TicketOrderStatus): string {
	switch (status) {
		case 'DRAFT':
			return 'Draft Desainer';
		case 'PENDING_PAYMENT':
			return 'Dikirim ke Kasir';
		case 'IN_PRODUCTION':
			return 'Sedang Produksi';
		case 'READY_FOR_PICKUP':
			return 'Siap Diambil';
		case 'COMPLETED':
			return 'Selesai';
		case 'CANCELLED':
			return 'Dibatalkan';
		default:
			return status;
	}
}
