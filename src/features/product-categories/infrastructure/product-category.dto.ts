/** Request DTO sent to backend API */
export interface ProductCategoryRequestDto {
	code: string;
	name: string;
	type: 'production' | 'non_production';
	spk_category: string | null;
	display_order: number;
	calculation_type: 'square_meter' | 'sheet' | 'meter_run' | 'piece';
	description: string | null;
	is_active: boolean;
}

/** Response DTO received from backend API */
export interface ProductCategoryDto {
	id: string | number;
	code: string;
	name: string;
	type?: 'production' | 'non_production';
	spk_category?: string | null;
	display_order?: number;
	calculation_type: 'square_meter' | 'sheet' | 'meter_run' | 'piece';
	description: string | null;
	is_active: boolean;
	created_at: string;
	updated_at: string;
}
