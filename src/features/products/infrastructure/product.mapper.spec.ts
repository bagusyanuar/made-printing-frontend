import { describe, it, expect } from 'vitest';
import { mapProductDtoToEntity, mapProductInputToDto } from './product.mapper';
import type { ProductDto } from './product.dto';
import type { ProductInput } from '../domain/product.entity';

describe('product.mapper', () => {
	it('maps ProductDto to Product entity accurately with tier pricing and attributes', () => {
		const dto: ProductDto = {
			id: 'prod-001',
			code: 'PRD-LGF-001',
			name: 'Banner Flexy 280g',
			category_id: 'cat-lgf',
			category_name: 'Large Format',
			base_material: 'Flexy 280 gsm',
			calculation_type: 'square_meter',
			base_price: 18000,
			tier_pricing: {
				retail_price: 18000,
				reseller_price: 15000,
				silver_price: 17000,
				gold_price: 16000
			},
			assigned_attributes: [
				{
					attribute_id: 'attr-sisi',
					attribute_name: 'Sisi Cetak',
					selected_variant_ids: ['var-1-sisi'],
					is_required: true
				}
			],
			min_order_qty: 1,
			lead_time_hours: 2,
			description: 'Outdoor standard banner',
			is_active: true,
			created_at: '2026-01-01T00:00:00.000Z',
			updated_at: '2026-01-01T00:00:00.000Z'
		};

		const entity = mapProductDtoToEntity(dto);

		expect(entity.id).toBe('prod-001');
		expect(entity.code).toBe('PRD-LGF-001');
		expect(entity.name).toBe('Banner Flexy 280g');
		expect(entity.categoryId).toBe('cat-lgf');
		expect(entity.categoryName).toBe('Large Format');
		expect(entity.baseMaterial).toBe('Flexy 280 gsm');
		expect(entity.calculationType).toBe('square_meter');
		expect(entity.basePrice).toBe(18000);
		expect(entity.tierPricing?.resellerPrice).toBe(15000);
		expect(entity.tierPricing?.silverPrice).toBe(17000);
		expect(entity.assignedAttributes).toHaveLength(1);
		expect(entity.assignedAttributes?.[0].attributeName).toBe('Sisi Cetak');
		expect(entity.minOrderQty).toBe(1);
		expect(entity.leadTimeHours).toBe(2);
		expect(entity.isActive).toBe(true);
	});

	it('handles null and optional fields during DTO to entity mapping', () => {
		const dto: ProductDto = {
			id: 'prod-002',
			code: 'PRD-ITEM-002',
			name: 'Simple Item',
			category_id: 'cat-001',
			calculation_type: 'piece',
			base_price: 5000,
			tier_pricing: null,
			assigned_attributes: null,
			is_active: false,
			created_at: '2026-01-01T00:00:00.000Z',
			updated_at: '2026-01-01T00:00:00.000Z'
		};

		const entity = mapProductDtoToEntity(dto);

		expect(entity.categoryName).toBe('Tanpa Kategori');
		expect(entity.baseMaterial).toBeNull();
		expect(entity.tierPricing).toBeNull();
		expect(entity.assignedAttributes).toBeNull();
		expect(entity.minOrderQty).toBe(1);
		expect(entity.leadTimeHours).toBeNull();
		expect(entity.description).toBeNull();
		expect(entity.isActive).toBe(false);
	});

	it('maps ProductInput to ProductInputDto correctly', () => {
		const input: ProductInput = {
			code: 'PRD-NEW-001',
			name: 'Sticker Vinyl Glossy',
			categoryId: 'cat-a3',
			categoryName: 'Digital A3+',
			baseMaterial: 'Vinyl Putih A3+',
			calculationType: 'sheet',
			basePrice: 12500,
			tierPricing: {
				retailPrice: 12500,
				resellerPrice: 10000,
				silverPrice: 11500,
				goldPrice: 11000
			},
			assignedAttributes: [
				{
					attributeId: 'attr-lam',
					attributeName: 'Laminasi',
					selectedVariantIds: ['var-glossy', 'var-doff'],
					isRequired: false
				}
			],
			minOrderQty: 5,
			leadTimeHours: 1,
			description: 'Kiss cut sheet',
			isActive: true
		};

		const dto = mapProductInputToDto(input);

		expect(dto.code).toBe('PRD-NEW-001');
		expect(dto.name).toBe('Sticker Vinyl Glossy');
		expect(dto.category_id).toBe('cat-a3');
		expect(dto.category_name).toBe('Digital A3+');
		expect(dto.base_material).toBe('Vinyl Putih A3+');
		expect(dto.calculation_type).toBe('sheet');
		expect(dto.base_price).toBe(12500);
		expect(dto.tier_pricing?.reseller_price).toBe(10000);
		expect(dto.assigned_attributes?.[0].attribute_id).toBe('attr-lam');
		expect(dto.min_order_qty).toBe(5);
		expect(dto.lead_time_hours).toBe(1);
		expect(dto.is_active).toBe(true);
	});
});
