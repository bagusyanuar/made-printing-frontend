export interface PriceTierItemDto {
	min_qty: number;
	max_qty: number;
	price: number;
}

export interface VariantTierPricingDto {
	variant_id: string;
	variant_name: string;
	reseller_tiers: PriceTierItemDto[];
	end_user_tiers: PriceTierItemDto[];
}

export interface ProductTierPricingDto {
	retail_price: number;
	reseller_price?: number | null;
	silver_price?: number | null;
	gold_price?: number | null;
	variant_tiers?: VariantTierPricingDto[] | null;
}

export interface ProductAttributeSelectionDto {
	attribute_id: string;
	attribute_name: string;
	selected_variant_ids: string[];
	is_required?: boolean;
}

export interface ProductDto {
	id: string;
	code: string;
	name: string;
	category_id: string;
	category_name?: string | null;
	base_material?: string | null;
	calculation_type: 'square_meter' | 'sheet' | 'meter_run' | 'piece';
	base_price: number;
	tier_pricing?: ProductTierPricingDto | null;
	assigned_attributes?: ProductAttributeSelectionDto[] | null;
	min_order_qty?: number | null;
	lead_time_hours?: number | null;
	description?: string | null;
	is_active: boolean;
	display_order?: number | null;
	created_at: string;
	updated_at: string;
}

export interface ProductInputDto {
	code?: string;
	name: string;
	category_id: string;
	category_name?: string | null;
	base_material?: string | null;
	calculation_type: 'square_meter' | 'sheet' | 'meter_run' | 'piece';
	base_price: number;
	tier_pricing?: ProductTierPricingDto | null;
	assigned_attributes?: ProductAttributeSelectionDto[] | null;
	min_order_qty?: number;
	lead_time_hours?: number | null;
	description?: string | null;
	is_active?: boolean;
	display_order?: number;
}
