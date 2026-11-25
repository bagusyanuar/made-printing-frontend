export type OrderPaymentStatus =
	'LUNAS' | 'PARTIAL_PAID' | 'UNPAID' | 'OVERDUE' | 'CANCELLED' | 'REFUND';

export type OrderFulfillmentStatus =
	'CREATED' | 'QUEUED' | 'PROCESSING' | 'READY_FOR_PICKUP' | 'PICKED_UP';

export type OrderType = 'PRODUCTION' | 'RETAIL';

export type OrderCustomerType = 'end_user' | 'reseller';

export type OrderPaymentMethod = 'CASH' | 'TRANSFER' | 'QRIS' | 'PIUTANG';

export interface OrderItem {
	id: string;
	productId?: string;
	productName: string;
	variantName?: string;
	isProduction: boolean;
	uom: string;
	dimensionText: string;
	finishingText?: string;
	quantity: number;
	pricePerUnit: number;
	subtotal: number;
}

export interface OrderPaymentRecord {
	id: string;
	paymentDate: string;
	method: OrderPaymentMethod;
	amount: number;
	referenceNumber?: string;
	note?: string;
	cashierName?: string;
}

export interface Order {
	id: string;
	invoiceNumber: string;
	orderId: string;
	jobNumber: string;
	orderType: OrderType;
	status: OrderPaymentStatus;
	fulfillmentStatus: OrderFulfillmentStatus;
	rackLocation?: string | null;
	pickedUpAt?: string | null;
	pickedUpBy?: string | null;
	customerType: OrderCustomerType;
	customerName: string;
	customerPhone: string;
	resellerId?: string | null;
	resellerName?: string | null;
	items: OrderItem[];
	subtotal: number;
	totalPaid: number;
	remainingAmount: number;
	dueDate?: string | null;
	paymentHistory: OrderPaymentRecord[];
	notes?: string;
	cancelReason?: string | null;
	cancelledAt?: string | null;
	issuedAt: string;
	updatedAt: string;
}

export interface OrderStats {
	totalInvoiced: number;
	totalPaid: number;
	totalRemaining: number;
	overdueCount: number;
	partialCount: number;
	paidCount: number;
}

export interface OrderSettlePaymentInput {
	amount: number;
	method: OrderPaymentMethod;
	referenceNumber?: string;
	note?: string;
}

export interface OrderPickupInput {
	settlePayment?: OrderSettlePaymentInput;
	pickedUpBy?: string;
}

export function formatCurrency(amount: number): string {
	return `Rp ${amount.toLocaleString('id-ID')}`;
}

export function formatOrderDateTime(isoString: string): string {
	if (!isoString) return '-';
	const d = new Date(isoString);
	if (isNaN(d.getTime())) return isoString;
	return new Intl.DateTimeFormat('id-ID', {
		day: '2-digit',
		month: 'short',
		year: 'numeric',
		hour: '2-digit',
		minute: '2-digit'
	}).format(d);
}
