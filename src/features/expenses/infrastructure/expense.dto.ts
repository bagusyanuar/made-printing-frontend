export interface ExpensePaymentLineDto {
	account_name: string;
	amount: number;
}

export interface ExpensePaymentRecordDto {
	id: string;
	payment_date: string;
	account_name: string;
	amount: number;
	reference_number?: string | null;
	note?: string | null;
	recorded_by?: string | null;
}

export interface ExpenseItemDto {
	id: string;
	group: 'production' | 'operational';
	category_id: string;
	category_name: string;
	product_category_name?: string | null;
	description: string;
	amount: number;
	notes?: string | null;
}

export interface CreateExpenseItemRequestDto {
	group: 'production' | 'operational';
	category_id: string;
	category_name: string;
	product_category_name?: string | null;
	description: string;
	amount: number;
	notes?: string | null;
}

export interface ExpenseDto {
	id: string;
	code: string;
	expense_date: string;
	group: 'production' | 'operational' | 'mixed';
	items: ExpenseItemDto[];
	vendor_id?: string | null;
	vendor_name?: string | null;
	account_name: string;
	payment_lines: ExpensePaymentLineDto[];
	payment_history: ExpensePaymentRecordDto[];
	subtotal: number;
	discount_amount: number;
	amount: number;
	total_paid: number;
	remaining_amount: number;
	payment_status: 'LUNAS' | 'PARTIAL_PAID' | 'UNPAID' | 'CANCELLED';
	status: 'APPROVED' | 'PENDING' | 'CANCELLED';
	recorded_by: string;
	approved_by?: string | null;
	approved_at?: string | null;
	cancel_reason?: string | null;
	cancelled_at?: string | null;
	reference_number?: string | null;
	notes?: string | null;
	created_at: string;
	updated_at: string;
}

export interface CreateExpenseRequestDto {
	expense_date?: string;
	items: CreateExpenseItemRequestDto[];
	discount_amount: number;
	vendor_id?: string | null;
	vendor_name?: string | null;
	account_name: string;
	payment_lines: ExpensePaymentLineDto[];
	status?: 'APPROVED' | 'PENDING' | 'CANCELLED';
	reference_number?: string | null;
	notes?: string | null;
}

export interface ExpenseSettlePaymentInputDto {
	amount: number;
	account_name: string;
	reference_number?: string;
	note?: string;
}
