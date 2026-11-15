import { describe, it, expect } from 'vitest';
import {
	mapAttributeDtoToEntity,
	mapVariantDtoToEntity,
	mapAttributeInputToDto,
	mapVariantInputToDto
} from './attribute-variant.mapper';
import type { ProductAttributeDto, ProductAttributeVariantDto } from './attribute-variant.dto';
import type {
	ProductAttributeInput,
	ProductAttributeVariantInput
} from '../domain/attribute-variant.entity';

describe('AttributeVariantMapper', () => {
	it('maps ProductAttributeVariantDto to ProductAttributeVariant entity', () => {
		const dto: ProductAttributeVariantDto = {
			id: 10,
			attribute_id: 1,
			name: '1 Sisi (4/0)',
			code: '1_sisi',
			description: 'Cetak satu muka',
			display_order: 1,
			is_active: true,
			created_at: '2026-01-01T00:00:00.000Z',
			updated_at: '2026-01-01T00:00:00.000Z'
		};

		const entity = mapVariantDtoToEntity(dto);

		expect(entity.id).toBe('10');
		expect(entity.attributeId).toBe('1');
		expect(entity.name).toBe('1 Sisi (4/0)');
		expect(entity.code).toBe('1_sisi');
		expect(entity.description).toBe('Cetak satu muka');
		expect(entity.displayOrder).toBe(1);
		expect(entity.isActive).toBe(true);
	});

	it('maps ProductAttributeDto with nested variants to ProductAttribute entity', () => {
		const dto: ProductAttributeDto = {
			id: 1,
			name: 'Sisi Cetak',
			code: 'sisi_cetak',
			description: 'Muka cetak bahan',
			is_required: true,
			display_order: 1,
			is_active: true,
			variants: [
				{
					id: 10,
					attribute_id: 1,
					name: '1 Sisi (4/0)',
					code: '1_sisi',
					description: null,
					display_order: 1,
					is_active: true,
					created_at: '2026-01-01T00:00:00.000Z',
					updated_at: '2026-01-01T00:00:00.000Z'
				}
			],
			created_at: '2026-01-01T00:00:00.000Z',
			updated_at: '2026-01-01T00:00:00.000Z'
		};

		const entity = mapAttributeDtoToEntity(dto);

		expect(entity.id).toBe('1');
		expect(entity.name).toBe('Sisi Cetak');
		expect(entity.code).toBe('sisi_cetak');
		expect(entity.isRequired).toBe(true);
		expect(entity.variants).toHaveLength(1);
		expect(entity.variants[0].name).toBe('1 Sisi (4/0)');
	});

	it('maps ProductAttributeInput to request DTO with slug generation and batch variants', () => {
		const input: ProductAttributeInput = {
			name: 'Pilihan Laminasi',
			description: 'Lapisan pelindung cetak',
			variants: [
				{ name: 'Doff 1 Sisi', displayOrder: 1 },
				{ name: 'Glossy 1 Sisi', displayOrder: 2 }
			]
		};

		const requestDto = mapAttributeInputToDto(input);

		expect(requestDto.name).toBe('Pilihan Laminasi');
		expect(requestDto.code).toBe('pilihan_laminasi');
		expect(requestDto.is_required).toBe(false);
		expect(requestDto.display_order).toBe(1);
		expect(requestDto.is_active).toBe(true);
		expect(requestDto.variants).toEqual([
			{ name: 'Doff 1 Sisi', display_order: 1 },
			{ name: 'Glossy 1 Sisi', display_order: 2 }
		]);
	});

	it('maps ProductAttributeVariantInput to request DTO', () => {
		const input: ProductAttributeVariantInput = {
			attributeId: 'attr-1',
			name: 'Doff 1 Sisi',
			displayOrder: 2
		};

		const requestDto = mapVariantInputToDto(input);

		expect(requestDto.attribute_id).toBe('attr-1');
		expect(requestDto.name).toBe('Doff 1 Sisi');
		expect(requestDto.code).toBe('doff_1_sisi');
		expect(requestDto.display_order).toBe(2);
		expect(requestDto.is_active).toBe(true);
	});
});
