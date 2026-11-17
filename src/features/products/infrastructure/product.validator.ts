import { z } from 'zod';
import type {
	ProductDto,
	ProductTierPricingDto,
	ProductAttributeSelectionDto,
	PriceTierItemDto,
	VariantTierPricingDto
} from './product.dto';

export const priceTierItemDtoSchema = z.object({
	min_qty: z.number(),
	max_qty: z.number(),
	price: z.number()
}) satisfies z.ZodType<PriceTierItemDto>;

export const variantTierPricingDtoSchema = z.object({
	variant_id: z.string(),
	variant_name: z.string(),
	reseller_tiers: z.array(priceTierItemDtoSchema),
	end_user_tiers: z.array(priceTierItemDtoSchema)
}) satisfies z.ZodType<VariantTierPricingDto>;

export const productTierPricingDtoSchema = z.object({
	retail_price: z.number(),
	reseller_price: z.number().nullable().optional(),
	silver_price: z.number().nullable().optional(),
	gold_price: z.number().nullable().optional(),
	variant_tiers: z.array(variantTierPricingDtoSchema).nullable().optional()
}) satisfies z.ZodType<ProductTierPricingDto>;

export const productAttributeSelectionDtoSchema = z.object({
	attribute_id: z.string(),
	attribute_name: z.string(),
	selected_variant_ids: z.array(z.string()),
	is_required: z.boolean().optional()
}) satisfies z.ZodType<ProductAttributeSelectionDto>;

export const productDtoSchema = z.object({
	id: z.string(),
	code: z.string(),
	name: z.string(),
	category_id: z.string(),
	category_name: z.string().nullable().optional(),
	base_material: z.string().nullable().optional(),
	calculation_type: z.enum(['square_meter', 'sheet', 'meter_run', 'piece']),
	base_price: z.number(),
	tier_pricing: productTierPricingDtoSchema.nullable().optional(),
	assigned_attributes: z.array(productAttributeSelectionDtoSchema).nullable().optional(),
	min_order_qty: z.number().nullable().optional(),
	lead_time_hours: z.number().nullable().optional(),
	description: z.string().nullable().optional(),
	is_active: z.boolean(),
	display_order: z.number().nullable().optional(),
	created_at: z.string(),
	updated_at: z.string()
}) satisfies z.ZodType<ProductDto>;
