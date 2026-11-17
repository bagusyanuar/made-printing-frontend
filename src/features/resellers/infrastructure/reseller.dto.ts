export interface ResellerDto {
	id: string;
	code: string;
	name: string;
	owner_name: string;
	phone: string;
	email?: string | null;
	address?: string | null;
	tier: 'silver' | 'gold' | 'platinum';
	credit_limit: number;
	used_credit?: number | null;
	deposit_balance?: number | null;
	term_of_payment_days: number;
	status: 'active' | 'near_limit' | 'auto_hold' | 'inactive';
	notes?: string | null;
	is_active: boolean;
	display_order?: number | null;
	created_at: string;
	updated_at: string;
}

export interface ResellerInputDto {
	code?: string;
	name: string;
	owner_name: string;
	phone: string;
	email?: string | null;
	address?: string | null;
	tier: 'silver' | 'gold' | 'platinum';
	credit_limit: number;
	used_credit?: number;
	deposit_balance?: number;
	term_of_payment_days: number;
	status?: 'active' | 'near_limit' | 'auto_hold' | 'inactive';
	notes?: string | null;
	is_active?: boolean;
	display_order?: number;
}
