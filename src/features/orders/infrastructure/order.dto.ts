export interface OrderItemDto {
	id: string;
	product_id?: string;
	product_name: string;
	variant_name?: string;
	is_production: boolean;
	uom: string;
	dimension_text?: string;
	finishing_text?: string;
	quantity: number;
	price_per_unit: number;
	subtotal: number;
}

export interface OrderPaymentRecordDto {
	id: string;
	payment_date: string;
	method: 'CASH' | 'TRANSFER' | 'QRIS' | 'PIUTANG';
	amount: number;
	reference_number?: string;
	note?: string;
	cashier_name?: string;
}

export interface OrderDto {
	id: string;
	invoice_number: string;
	order_id: string;
	job_number: string;
	order_type: 'PRODUCTION' | 'RETAIL';
	status: 'LUNAS' | 'PARTIAL_PAID' | 'UNPAID' | 'OVERDUE' | 'CANCELLED';
	fulfillment_status?: 'QUEUED' | 'PROCESSING' | 'READY_FOR_PICKUP' | 'PICKED_UP';
	rack_location?: string | null;
	picked_up_at?: string | null;
	picked_up_by?: string | null;
	customer_type: 'end_user' | 'reseller';
	customer_name: string;
	customer_phone: string;
	reseller_id?: string | null;
	reseller_name?: string | null;
	items: OrderItemDto[];
	subtotal: number;
	total_paid: number;
	remaining_amount: number;
	due_date?: string | null;
	payment_history: OrderPaymentRecordDto[];
	notes?: string;
	cancel_reason?: string | null;
	cancelled_at?: string | null;
	issued_at: string;
	updated_at: string;
}

export interface OrderStatsDto {
	total_invoiced: number;
	total_paid: number;
	total_remaining: number;
	overdue_count: number;
	partial_count: number;
	paid_count: number;
}

export interface OrderSettlePaymentInputDto {
	amount: number;
	method: 'CASH' | 'TRANSFER' | 'QRIS' | 'PIUTANG';
	reference_number?: string;
	note?: string;
}
