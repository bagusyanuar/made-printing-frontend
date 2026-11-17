import type { Product, ProductInput } from '../domain/product.entity';
import type { ProductDto, ProductInputDto } from './product.dto';

export function mapProductDtoToEntity(dto: ProductDto): Product {
	return {
		id: dto.id,
		code: dto.code,
		name: dto.name,
		categoryId: dto.category_id,
		categoryName: dto.category_name ?? 'Tanpa Kategori',
		baseMaterial: dto.base_material ?? null,
		calculationType: dto.calculation_type,
		basePrice: Number(dto.base_price) || 0,
		tierPricing: dto.tier_pricing
			? {
					retailPrice: Number(dto.tier_pricing.retail_price) || 0,
					resellerPrice:
						dto.tier_pricing.reseller_price != null
							? Number(dto.tier_pricing.reseller_price)
							: null,
					silverPrice:
						dto.tier_pricing.silver_price != null ? Number(dto.tier_pricing.silver_price) : null,
					goldPrice:
						dto.tier_pricing.gold_price != null ? Number(dto.tier_pricing.gold_price) : null,
					variantTiers: dto.tier_pricing.variant_tiers
						? dto.tier_pricing.variant_tiers.map((vt) => ({
								variantId: vt.variant_id,
								variantName: vt.variant_name,
								resellerTiers: vt.reseller_tiers.map((t) => ({
									minQty: Number(t.min_qty) || 1,
									maxQty: Number(t.max_qty) || 999999,
									price: Number(t.price) || 0
								})),
								endUserTiers: vt.end_user_tiers.map((t) => ({
									minQty: Number(t.min_qty) || 1,
									maxQty: Number(t.max_qty) || 999999,
									price: Number(t.price) || 0
								}))
							}))
						: null
				}
			: null,
		assignedAttributes: dto.assigned_attributes
			? dto.assigned_attributes.map((a) => ({
					attributeId: a.attribute_id,
					attributeName: a.attribute_name,
					selectedVariantIds: a.selected_variant_ids ?? [],
					isRequired: a.is_required ?? false
				}))
			: null,
		minOrderQty: dto.min_order_qty != null ? Number(dto.min_order_qty) : 1,
		leadTimeHours: dto.lead_time_hours != null ? Number(dto.lead_time_hours) : null,
		description: dto.description ?? null,
		isActive: Boolean(dto.is_active),
		displayOrder: Number(dto.display_order) || 0,
		createdAt: dto.created_at,
		updatedAt: dto.updated_at
	};
}

export function mapProductInputToDto(input: ProductInput): ProductInputDto {
	return {
		code: input.code,
		name: input.name,
		category_id: input.categoryId,
		category_name: input.categoryName ?? null,
		base_material: input.baseMaterial ?? null,
		calculation_type: input.calculationType,
		base_price: input.basePrice,
		tier_pricing: input.tierPricing
			? {
					retail_price: input.tierPricing.retailPrice,
					reseller_price: input.tierPricing.resellerPrice ?? null,
					silver_price: input.tierPricing.silverPrice ?? null,
					gold_price: input.tierPricing.goldPrice ?? null,
					variant_tiers: input.tierPricing.variantTiers
						? input.tierPricing.variantTiers.map((vt) => ({
								variant_id: vt.variantId,
								variant_name: vt.variantName,
								reseller_tiers: vt.resellerTiers.map((t) => ({
									min_qty: t.minQty,
									max_qty: t.maxQty,
									price: t.price
								})),
								end_user_tiers: vt.endUserTiers.map((t) => ({
									min_qty: t.minQty,
									max_qty: t.maxQty,
									price: t.price
								}))
							}))
						: null
				}
			: null,
		assigned_attributes: input.assignedAttributes
			? input.assignedAttributes.map((a) => ({
					attribute_id: a.attributeId,
					attribute_name: a.attributeName,
					selected_variant_ids: a.selectedVariantIds,
					is_required: a.isRequired ?? false
				}))
			: null,
		min_order_qty: input.minOrderQty ?? 1,
		lead_time_hours: input.leadTimeHours ?? null,
		description: input.description ?? null,
		is_active: input.isActive ?? true,
		display_order: input.displayOrder ?? 0
	};
}
