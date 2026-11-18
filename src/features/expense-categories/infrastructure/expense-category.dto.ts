export interface ExpenseCategoryDto {
	id: string;
	code: string;
	name: string;
	group: 'production' | 'operational';
	product_category_id?: string | null;
	product_category_name?: string | null;
	display_order?: number;
	is_active?: boolean;
	created_at?: string;
	updated_at?: string;
}

export interface ExpenseCategoryCreatePayload {
	code?: string;
	name: string;
	group: 'production' | 'operational';
	product_category_id?: string | null;
	display_order?: number;
	is_active?: boolean;
}

export type ExpenseCategoryUpdatePayload = Partial<ExpenseCategoryCreatePayload>;
