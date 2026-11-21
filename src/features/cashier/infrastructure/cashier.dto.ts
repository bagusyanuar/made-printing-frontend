export interface CashierOrderItemDto {
	id: string;
	product_id?: string;
	product_variant_id?: string;
	product_name: string;
	variant_name?: string;
	is_production: boolean;
	uom: string;
	length_m?: number | null;
	width_m?: number | null;
	dimension_text?: string;
	finishing_text?: string;
	quantity: number;
	price_per_unit: number;
	subtotal: number;
	design_file_url?: string | null;
	production_notes?: string | null;
}

export interface CashierSplitPaymentDetailDto {
	method: 'CASH' | 'TRANSFER' | 'QRIS' | 'PIUTANG';
	amount: number;
	reference_number?: string;
}

export interface CashierOrderDto {
	id: string;
	job_number: string;
	invoice_number?: string | null;
	order_type: 'PRODUCTION' | 'RETAIL';
	status: 'DRAFT' | 'PENDING_PAYMENT' | 'PARTIAL_PAID' | 'LUNAS' | 'CANCELLED';
	customer_type: 'end_user' | 'reseller';
	customer_name: string;
	customer_phone: string;
	reseller_id?: string | null;
	reseller_name?: string | null;
	designer_id?: string | null;
	designer_name?: string | null;
	items: CashierOrderItemDto[];
	subtotal: number;
	total_paid: number;
	remaining_amount: number;
	change_amount: number;
	payment_method?: string | null;
	payment_details?: CashierSplitPaymentDetailDto[];
	notes?: string;
	cancel_reason?: string | null;
	cancelled_at?: string | null;
	paid_at?: string | null;
	created_at: string;
	updated_at: string;
}

export interface CashierRetailCatalogItemDto {
	id: string;
	variant_id?: string;
	name: string;
	category_name: string;
	price: number;
	uom: string;
	stock: number;
	is_production: boolean;
}
