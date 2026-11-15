export interface ProductAttributeVariant {
	id: string;
	attributeId: string;
	name: string;
	code: string;
	description: string | null;
	displayOrder: number;
	isActive: boolean;
	createdAt: string;
	updatedAt: string;
}

export interface ProductAttribute {
	id: string;
	name: string;
	code: string;
	description: string | null;
	isRequired: boolean;
	displayOrder: number;
	isActive: boolean;
	variants: ProductAttributeVariant[];
	createdAt: string;
	updatedAt: string;
}

export interface ProductAttributeVariantBatchItem {
	name: string;
	displayOrder: number;
}

export interface ProductAttributeInput {
	name: string;
	code?: string;
	description?: string | null;
	isRequired?: boolean;
	displayOrder?: number;
	isActive?: boolean;
	variants?: ProductAttributeVariantBatchItem[];
}

export interface ProductAttributeVariantInput {
	attributeId: string;
	name: string;
	code?: string;
	description?: string | null;
	displayOrder?: number;
	isActive?: boolean;
}

export function generateSlug(text: string): string {
	return text
		.toLowerCase()
		.trim()
		.replace(/[^a-z0-9]+/g, '_')
		.replace(/^_+|_+$/g, '');
}
