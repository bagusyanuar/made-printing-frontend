import { describe, it, expect } from 'vitest';
import type { SupplierDto } from './supplier.dto';
import type { SupplierInput } from '../domain/supplier.entity';
import { mapSupplierDtoToEntity, mapSupplierInputToDto } from './supplier.mapper';

describe('Supplier Mapper', () => {
	it('harus memetakan SupplierDto lengkap ke Supplier entity dengan benar', () => {
		const dto: SupplierDto = {
			id: 'spl-1',
			code: 'SPL-001',
			name: 'PT Surya Kencana Grafika',
			contact_person: 'Bambang Sutrisno',
			phone: '081234567890',
			email: 'sales@suryakencana.co.id',
			address: 'Kawasan Industri Pulo Gadung Blok B2 No. 8, Jakarta Timur',
			notes: 'Distributor bahan flexy banner & albatros',
			is_active: true,
			display_order: 1,
			created_at: '2026-01-01T00:00:00.000Z',
			updated_at: '2026-01-02T00:00:00.000Z'
		};

		const entity = mapSupplierDtoToEntity(dto);

		expect(entity.id).toBe('spl-1');
		expect(entity.code).toBe('SPL-001');
		expect(entity.name).toBe('PT Surya Kencana Grafika');
		expect(entity.contactPerson).toBe('Bambang Sutrisno');
		expect(entity.phone).toBe('081234567890');
		expect(entity.email).toBe('sales@suryakencana.co.id');
		expect(entity.address).toBe('Kawasan Industri Pulo Gadung Blok B2 No. 8, Jakarta Timur');
		expect(entity.notes).toBe('Distributor bahan flexy banner & albatros');
		expect(entity.isActive).toBe(true);
		expect(entity.displayOrder).toBe(1);
	});

	it('harus menangani field opsional/null saat memetakan SupplierDto ke entity', () => {
		const dto: SupplierDto = {
			id: 'spl-2',
			code: 'SPL-002',
			name: 'CV Mitra Sukses',
			contact_person: null,
			phone: null,
			email: null,
			address: null,
			notes: null,
			is_active: undefined,
			display_order: undefined
		};

		const entity = mapSupplierDtoToEntity(dto);

		expect(entity.id).toBe('spl-2');
		expect(entity.contactPerson).toBeNull();
		expect(entity.phone).toBe('-');
		expect(entity.email).toBeNull();
		expect(entity.address).toBeNull();
		expect(entity.notes).toBeNull();
		expect(entity.isActive).toBe(true);
		expect(entity.displayOrder).toBe(1);
	});

	it('harus memetakan SupplierInput ke payload DTO dan melakukan trim string', () => {
		const input: SupplierInput = {
			code: 'SPL-003',
			name: '  CV Bintang Tinta  ',
			contactPerson: '  Agus Pratama  ',
			phone: '  081398765432  ',
			email: '  order@bintangtinta.com  ',
			address: '  Jl. Raya Industri Cibitung  ',
			notes: '  Suplier tinta  ',
			isActive: true,
			displayOrder: 3
		};

		const payload = mapSupplierInputToDto(input);

		expect(payload.code).toBe('SPL-003');
		expect(payload.name).toBe('CV Bintang Tinta');
		expect(payload.contact_person).toBe('Agus Pratama');
		expect(payload.phone).toBe('081398765432');
		expect(payload.email).toBe('order@bintangtinta.com');
		expect(payload.address).toBe('Jl. Raya Industri Cibitung');
		expect(payload.notes).toBe('Suplier tinta');
		expect(payload.is_active).toBe(true);
		expect(payload.display_order).toBe(3);
	});
});
