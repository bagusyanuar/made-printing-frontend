export interface SupplierDto {
	id: string;
	code: string;
	name: string;
	contact_person?: string | null;
	phone?: string | null;
	email?: string | null;
	address?: string | null;
	notes?: string | null;
	is_active?: boolean;
	display_order?: number;
	created_at?: string;
	updated_at?: string;
}

export interface SupplierCreatePayload {
	code?: string;
	name: string;
	contact_person?: string | null;
	phone?: string | null;
	email?: string | null;
	address?: string | null;
	notes?: string | null;
	is_active?: boolean;
	display_order?: number;
}

export type SupplierUpdatePayload = Partial<SupplierCreatePayload>;
