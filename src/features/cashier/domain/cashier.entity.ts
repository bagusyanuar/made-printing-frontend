export type CashierOrderStatus =
	| 'DRAFT'
	| 'PENDING_PAYMENT'
	| 'PARTIAL_PAID'
	| 'LUNAS'
	| 'CANCELLED';

export type CashierOrderType = 'PRODUCTION' | 'RETAIL';

export type CashierCustomerType = 'end_user' | 'reseller';

export type CashierPaymentMethod = 'CASH' | 'TRANSFER' | 'QRIS' | 'PIUTANG';

export interface CashierOrderItem {
	id: string;
	productId?: string;
	productVariantId?: string;
	productName: string;
	variantName?: string;
	isProduction: boolean;
	uom: string; // 'm2' | 'm_lari' | 'pcs' | 'lembar' | 'box'
	lengthM?: number | null;
	widthM?: number | null;
	dimensionText: string;
	finishingText?: string;
	quantity: number;
	pricePerUnit: number;
	subtotal: number;
	designFileUrl?: string | null;
	productionNotes?: string | null;
}

export interface CashierSplitPaymentDetail {
	method: CashierPaymentMethod;
	amount: number;
	referenceNumber?: string;
}

export interface CashierOrder {
	id: string;
	jobNumber: string;
	invoiceNumber?: string | null;
	orderType: CashierOrderType;
	status: CashierOrderStatus;
	customerType: CashierCustomerType;
	customerName: string;
	customerPhone: string;
	resellerId?: string | null;
	resellerName?: string | null;
	designerId?: string | null;
	designerName?: string | null;
	items: CashierOrderItem[];
	subtotal: number;
	totalPaid: number;
	remainingAmount: number;
	changeAmount: number;
	paymentMethod?: CashierPaymentMethod | string | null;
	paymentDetails?: CashierSplitPaymentDetail[];
	notes?: string;
	cancelReason?: string | null;
	cancelledAt?: string | null;
	paidAt?: string | null;
	createdAt: string;
	updatedAt: string;
}

export interface CashierRetailCatalogItem {
	id: string;
	variantId?: string;
	name: string;
	categoryName: string;
	price: number;
	uom: string;
	stock: number;
	isProduction: boolean;
}

export interface CashierProcessPaymentInput {
	isSplit: boolean;
	method?: CashierPaymentMethod;
	singleAmount?: number;
	splitAmounts?: {
		cash: number;
		transfer: number;
		qris: number;
	};
	notes?: string;
}

export interface CashierCreateRetailOrderInput {
	customerName: string;
	customerPhone?: string;
	items: Array<{
		catalogItemId?: string;
		name: string;
		price: number;
		quantity: number;
		uom: string;
	}>;
}

export function formatCurrency(amount: number): string {
	return new Intl.NumberFormat('id-ID', {
		style: 'currency',
		currency: 'IDR',
		maximumFractionDigits: 0
	}).format(amount);
}

export function calculateCashierSubtotal(items: CashierOrderItem[]): number {
	return items.reduce((acc, item) => acc + item.subtotal, 0);
}

export function calculateCashierItemSubtotal(
	pricePerUnit: number,
	quantity: number,
	uom: string,
	lengthM?: number | null,
	widthM?: number | null
): number {
	const normalizedUom = uom.toLowerCase();
	if (normalizedUom === 'm2' || normalizedUom === 'square_meter') {
		const area = (lengthM ?? 0) * (widthM ?? 0);
		return Math.round(pricePerUnit * area * quantity);
	}
	if (normalizedUom === 'm_lari' || normalizedUom === 'meter_run') {
		const length = lengthM ?? 0;
		return Math.round(pricePerUnit * length * quantity);
	}
	return Math.round(pricePerUnit * quantity);
}

export function formatCashierItemsSummary(items: CashierOrderItem[]): string {
	if (!items || items.length === 0) return '-';
	return items.map((item) => `${item.productName} (${item.quantity}x)`).join(', ');
}

export function formatCashierDateTime(rawDate?: string | null): string {
	if (!rawDate) return '-';
	const normalized = rawDate.includes('T') ? rawDate : rawDate.replace(' ', 'T');
	const d = new Date(normalized);
	if (isNaN(d.getTime())) {
		const match = rawDate.match(/(\d{4})-(\d{2})-(\d{2})(?:[ T](\d{2}):(\d{2}))?/);
		if (match) {
			const [, y, m, day, h = '00', min = '00'] = match;
			return `${day}/${m}/${y} ${h}:${min}`;
		}
		return rawDate;
	}
	const day = String(d.getDate()).padStart(2, '0');
	const month = String(d.getMonth() + 1).padStart(2, '0');
	const year = d.getFullYear();
	const hours = String(d.getHours()).padStart(2, '0');
	const minutes = String(d.getMinutes()).padStart(2, '0');
	return `${day}/${month}/${year} ${hours}:${minutes}`;
}
