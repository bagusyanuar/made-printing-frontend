export interface OrderItemResponseDto {
	id: string;
	product_variant_id: string;
	product_name: string;
	variant_name?: string;
	category_id?: string;
	category_name?: string;
	uom: string;
	quantity: number;
	design_file_url?: string | null;
	production_notes?: string | null;
	length_m?: number | null;
	width_m?: number | null;
	price_per_unit?: number;
	additional_cost?: number;
	subtotal?: number;
	finishing_ids?: string[];
}

export interface OrderResponseDto {
	id: string;
	job_number: string;
	invoice_number?: string | null;
	designer_id?: string;
	designer_name?: string;
	status: string;
	payment_status?: string;
	customer_name?: string | null;
	customer_phone?: string | null;
	reseller_id?: string | null;
	reseller_name?: string | null;
	notes?: string;
	deadline?: string | null;
	cancel_reason?: string | null;
	cancelled_at?: string | null;
	invoiced_at?: string | null;
	order_items?: OrderItemResponseDto[];
	created_at: string;
	updated_at: string;
}

export interface DraftOrderItemRequestDto {
	product_variant_id: string;
	uom: string;
	quantity: number;
	design_file_url?: string | null;
	production_notes?: string | null;
	finishing_ids?: string[];
	length_m?: number | null;
	width_m?: number | null;
}

export interface DraftOrderRequestDto {
	designer_id?: string;
	reseller_id?: string | null;
	customer_name: string;
	customer_phone: string;
	notes: string;
	deadline?: string | null;
	items: DraftOrderItemRequestDto[];
}
