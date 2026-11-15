import type {
	ProductAttribute,
	ProductAttributeInput,
	ProductAttributeVariant,
	ProductAttributeVariantInput
} from '../domain/attribute-variant.entity';
import { generateSlug } from '../domain/attribute-variant.entity';
import type {
	ProductAttributeDto,
	ProductAttributeRequestDto,
	ProductAttributeVariantDto,
	ProductAttributeVariantRequestDto
} from './attribute-variant.dto';

export function mapVariantDtoToEntity(dto: ProductAttributeVariantDto): ProductAttributeVariant {
	return {
		id: String(dto.id),
		attributeId: String(dto.attribute_id),
		name: dto.name,
		code: dto.code,
		description: dto.description ?? null,
		displayOrder: dto.display_order ?? 1,
		isActive: dto.is_active,
		createdAt: dto.created_at,
		updatedAt: dto.updated_at
	};
}

export function mapAttributeDtoToEntity(dto: ProductAttributeDto): ProductAttribute {
	return {
		id: String(dto.id),
		name: dto.name,
		code: dto.code,
		description: dto.description ?? null,
		isRequired: dto.is_required ?? false,
		displayOrder: dto.display_order ?? 1,
		isActive: dto.is_active,
		variants: (dto.variants ?? []).map(mapVariantDtoToEntity),
		createdAt: dto.created_at,
		updatedAt: dto.updated_at
	};
}

export function mapAttributeInputToDto(input: ProductAttributeInput): ProductAttributeRequestDto {
	const code = input.code?.trim() || generateSlug(input.name);
	return {
		name: input.name.trim(),
		code,
		description: input.description?.trim() || null,
		is_required: input.isRequired ?? false,
		display_order: input.displayOrder ?? 1,
		is_active: input.isActive ?? true,
		variants: input.variants?.map((v) => ({
			name: v.name.trim(),
			display_order: v.displayOrder
		}))
	};
}

export function mapVariantInputToDto(
	input: ProductAttributeVariantInput
): ProductAttributeVariantRequestDto {
	const code = input.code?.trim() || generateSlug(input.name);
	return {
		attribute_id: input.attributeId,
		name: input.name.trim(),
		code,
		description: input.description?.trim() || null,
		display_order: input.displayOrder ?? 1,
		is_active: input.isActive ?? true
	};
}
