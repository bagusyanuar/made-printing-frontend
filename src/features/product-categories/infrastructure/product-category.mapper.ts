import type { ProductCategory, ProductCategoryInput } from '../domain/product-category.entity';
import { generateCategoryCode } from '../domain/product-category.entity';
import type { ProductCategoryDto, ProductCategoryRequestDto } from './product-category.dto';

export function mapProductCategoryDtoToEntity(dto: ProductCategoryDto): ProductCategory {
	return {
		id: String(dto.id),
		code: dto.code,
		name: dto.name,
		type: dto.type ?? 'production',
		spkCategory: dto.spk_category ?? null,
		displayOrder: dto.display_order ?? 1,
		calculationType: dto.calculation_type,
		description: dto.description,
		isActive: dto.is_active,
		createdAt: dto.created_at,
		updatedAt: dto.updated_at
	};
}

export function mapProductCategoryInputToDto(
	input: ProductCategoryInput
): ProductCategoryRequestDto {
	const code = (input.code?.trim() || generateCategoryCode(input.name)).toUpperCase();
	return {
		code,
		name: input.name.trim(),
		type: input.type,
		spk_category: input.spkCategory?.trim() || null,
		display_order: input.displayOrder ?? 1,
		calculation_type: input.calculationType,
		description: input.description?.trim() || null,
		is_active: input.isActive ?? true
	};
}
