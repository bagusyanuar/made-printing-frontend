export interface ProductAttributeVariantDto {
	id: string | number;
	attribute_id: string | number;
	name: string;
	code: string;
	description?: string | null;
	display_order?: number;
	is_active: boolean;
	created_at: string;
	updated_at: string;
}

export interface ProductAttributeDto {
	id: string | number;
	name: string;
	code: string;
	description?: string | null;
	is_required?: boolean;
	display_order?: number;
	is_active: boolean;
	variants?: ProductAttributeVariantDto[];
	created_at: string;
	updated_at: string;
}

export interface ProductAttributeVariantBatchDto {
	name: string;
	display_order: number;
}

export interface ProductAttributeRequestDto {
	name: string;
	code: string;
	description: string | null;
	is_required: boolean;
	display_order: number;
	is_active: boolean;
	variants?: ProductAttributeVariantBatchDto[];
}

export interface ProductAttributeVariantRequestDto {
	attribute_id: string;
	name: string;
	code: string;
	description: string | null;
	display_order: number;
	is_active: boolean;
}
