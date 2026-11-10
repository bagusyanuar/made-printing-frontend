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
		expect(entity.calculationType).toBe('square_meter');
		expect(entity.description).toBe('Banner Flexy');
		expect(entity.isActive).toBe(true);
		expect(entity.createdAt).toBe('2026-01-01T00:00:00.000Z');
	});

	it('maps ProductCategoryInput to ProductCategoryRequestDto correctly', () => {
		const input: ProductCategoryInput = {
			code: '  a3-sheet ',
			name: '  Digital Press A3+  ',
			calculationType: 'sheet',
			description: '  Kertas Art Carton  ',
			isActive: true
		};

		const requestDto = mapProductCategoryInputToDto(input);

		expect(requestDto.code).toBe('A3-SHEET');
		expect(requestDto.name).toBe('Digital Press A3+');
		expect(requestDto.calculation_type).toBe('sheet');
		expect(requestDto.description).toBe('Kertas Art Carton');
		expect(requestDto.is_active).toBe(true);
	});
});
