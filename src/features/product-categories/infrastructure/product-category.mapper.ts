import type { ProductCategory, ProductCategoryInput } from '../domain/product-category.entity';
import type { ProductCategoryDto, ProductCategoryRequestDto } from './product-category.dto';

export function mapProductCategoryDtoToEntity(dto: ProductCategoryDto): ProductCategory {
	return {
		id: String(dto.id),
		code: dto.code,
		name: dto.name,
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
	return {
		code: input.code.trim().toUpperCase(),
		name: input.name.trim(),
		calculation_type: input.calculationType,
		description: input.description?.trim() || null,
		is_active: input.isActive
	};
}
