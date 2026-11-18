import { describe, it, expect } from 'vitest';
import {
	mapExpenseCategoryDtoToEntity,
	mapExpenseCategoryInputToDto
} from './expense-category.mapper';
import type { ExpenseCategoryDto } from './expense-category.dto';
import type { ExpenseCategoryInput } from '../domain/expense-category.entity';

describe('expenseCategoryMapper', () => {
	it('harus memetakan ExpenseCategoryDto ke Entity dengan benar untuk grup produksi', () => {
		expect.assertions(6);
		const dto: ExpenseCategoryDto = {
			id: 'exp-1',
			code: 'EXP-PRD-001',
			name: 'Bahan Baku Flexy',
			group: 'production',
			product_category_id: 'cat-1',
			product_category_name: 'Large Format Outdoor',
			display_order: 1,
			is_active: true,
			created_at: '2026-01-01T00:00:00.000Z',
			updated_at: '2026-01-01T00:00:00.000Z'
		};

		const entity = mapExpenseCategoryDtoToEntity(dto);
		expect(entity.id).toBe('exp-1');
		expect(entity.name).toBe('Bahan Baku Flexy');
		expect(entity.group).toBe('production');
		expect(entity.productCategoryId).toBe('cat-1');
		expect(entity.productCategoryName).toBe('Large Format Outdoor');
		expect(entity.displayOrder).toBe(1);
	});

	it('harus memetakan ExpenseCategoryDto ke Entity dengan benar untuk grup operasional', () => {
		expect.assertions(5);
		const dto: ExpenseCategoryDto = {
			id: 'exp-2',
			code: 'EXP-OPS-001',
			name: 'Listrik & Air Workshop',
			group: 'operational',
			product_category_id: null,
			product_category_name: null,
			display_order: 2,
			is_active: true
		};

		const entity = mapExpenseCategoryDtoToEntity(dto);
		expect(entity.id).toBe('exp-2');
		expect(entity.name).toBe('Listrik & Air Workshop');
		expect(entity.group).toBe('operational');
		expect(entity.productCategoryId).toBeNull();
		expect(entity.displayOrder).toBe(2);
	});

	it('harus mengonversi ExpenseCategoryInput ke CreatePayload dengan trim dan nulling productCategoryId untuk operasional', () => {
		expect.assertions(4);
		const input: ExpenseCategoryInput = {
			code: 'EXP-OPS-002',
			name: '  Gaji Karyawan  ',
			group: 'operational',
			productCategoryId: 'cat-1', // harus di-nullkan karena operasional
			displayOrder: 3,
			isActive: true
		};

		const payload = mapExpenseCategoryInputToDto(input);
		expect(payload.name).toBe('Gaji Karyawan');
		expect(payload.group).toBe('operational');
		expect(payload.product_category_id).toBeNull();
		expect(payload.display_order).toBe(3);
	});
});
