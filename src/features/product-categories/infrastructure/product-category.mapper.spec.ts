import { describe, it, expect } from 'vitest';
import {
	mapProductCategoryDtoToEntity,
	mapProductCategoryInputToDto
} from './product-category.mapper';
import type { ProductCategoryDto } from './product-category.dto';
import type { ProductCategoryInput } from '../domain/product-category.entity';

describe('ProductCategoryMapper', () => {
	it('maps ProductCategoryDto to domain ProductCategory entity', () => {
		const dto: ProductCategoryDto = {
			id: 101,
			code: 'LF-OUT',
			name: 'Large Format Outdoor',
			type: 'production',
			spk_category: null,
			display_order: 1,
			calculation_type: 'square_meter',
			description: 'Banner Flexy',
			is_active: true,
			created_at: '2026-01-01T00:00:00.000Z',
			updated_at: '2026-01-02T00:00:00.000Z'
		};

		const entity = mapProductCategoryDtoToEntity(dto);

		expect(entity.id).toBe('101');
		expect(entity.code).toBe('LF-OUT');
		expect(entity.name).toBe('Large Format Outdoor');
		expect(entity.type).toBe('production');
		expect(entity.spkCategory).toBeNull();
		expect(entity.displayOrder).toBe(1);
		expect(entity.calculationType).toBe('square_meter');
		expect(entity.description).toBe('Banner Flexy');
		expect(entity.isActive).toBe(true);
		expect(entity.createdAt).toBe('2026-01-01T00:00:00.000Z');
	});

	it('maps ProductCategoryInput to ProductCategoryRequestDto correctly', () => {
		const input: ProductCategoryInput = {
			code: '  a3-sheet ',
			name: '  Digital Press A3+  ',
			type: 'production',
			spkCategory: 'Digital Printing A3+',
			displayOrder: 2,
			calculationType: 'sheet',
			description: '  Kertas Art Carton  ',
			isActive: true
		};

		const requestDto = mapProductCategoryInputToDto(input);

		expect(requestDto.code).toBe('A3-SHEET');
		expect(requestDto.name).toBe('Digital Press A3+');
		expect(requestDto.type).toBe('production');
		expect(requestDto.spk_category).toBe('Digital Printing A3+');
		expect(requestDto.display_order).toBe(2);
		expect(requestDto.calculation_type).toBe('sheet');
		expect(requestDto.description).toBe('Kertas Art Carton');
		expect(requestDto.is_active).toBe(true);
	});
});
