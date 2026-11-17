import { describe, it, expect } from 'vitest';
import type { ResellerDto } from './reseller.dto';
import type { ResellerInput } from '../domain/reseller.entity';
import { mapResellerDtoToEntity, mapResellerInputToDto } from './reseller.mapper';

describe('Reseller Mapper', () => {
	it('harus memetakan ResellerDto lengkap ke Reseller entity dengan benar', () => {
		const dto: ResellerDto = {
			id: 'rsl-1',
			code: 'RSL-MAHA-101',
			name: 'Biro Iklan Mahakarya',
			owner_name: 'Hendra Setiawan',
			phone: '081298765432',
			email: 'hendra@mahakarya.id',
			address: 'Jl. Sudirman No. 45, Padang',
			tier: 'gold',
			credit_limit: 15000000,
			used_credit: 6200000,
			deposit_balance: 2500000,
			term_of_payment_days: 30,
			status: 'active',
			notes: 'Mitra rekanan pemda & event organizer',
			is_active: true,
			display_order: 1,
			created_at: '2026-01-01T00:00:00.000Z',
			updated_at: '2026-01-02T00:00:00.000Z'
		};

		const entity = mapResellerDtoToEntity(dto);

		expect(entity.id).toBe('rsl-1');
		expect(entity.code).toBe('RSL-MAHA-101');
		expect(entity.name).toBe('Biro Iklan Mahakarya');
		expect(entity.ownerName).toBe('Hendra Setiawan');
		expect(entity.phone).toBe('081298765432');
		expect(entity.email).toBe('hendra@mahakarya.id');
		expect(entity.address).toBe('Jl. Sudirman No. 45, Padang');
		expect(entity.tier).toBe('gold');
		expect(entity.creditLimit).toBe(15000000);
		expect(entity.usedCredit).toBe(6200000);
		expect(entity.depositBalance).toBe(2500000);
		expect(entity.termOfPaymentDays).toBe(30);
		expect(entity.status).toBe('active');
		expect(entity.notes).toBe('Mitra rekanan pemda & event organizer');
		expect(entity.isActive).toBe(true);
		expect(entity.displayOrder).toBe(1);
	});

	it('harus menangani field opsional/null saat memetakan ResellerDto ke entity', () => {
		const dto: ResellerDto = {
			id: 'rsl-2',
			code: 'RSL-SUMB-102',
			name: 'Percetakan Sumber Rejeki',
			owner_name: 'Ahmad Fauzi',
			phone: '081345678901',
			email: null,
			address: null,
			tier: 'silver',
			credit_limit: 5000000,
			used_credit: null,
			deposit_balance: null,
			term_of_payment_days: 14,
			status: 'near_limit',
			notes: null,
			is_active: true,
			display_order: null,
			created_at: '2026-01-01T00:00:00.000Z',
			updated_at: '2026-01-01T00:00:00.000Z'
		};

		const entity = mapResellerDtoToEntity(dto);

		expect(entity.email).toBeNull();
		expect(entity.address).toBeNull();
		expect(entity.usedCredit).toBe(0);
		expect(entity.depositBalance).toBe(0);
		expect(entity.displayOrder).toBe(0);
		expect(entity.notes).toBeNull();
	});

	it('harus memetakan ResellerInput ke ResellerInputDto dengan benar', () => {
		const input: ResellerInput = {
			code: 'RSL-KREA-103',
			name: 'Kreatif Visual Media',
			ownerName: 'Dian Anggraini',
			phone: '081122334455',
			email: 'dian@kreatifvisual.com',
			address: 'Jl. Khatib Sulaiman No. 12',
			tier: 'platinum',
			creditLimit: 25000000,
			usedCredit: 7500000,
			depositBalance: 5000000,
			termOfPaymentDays: 45,
			status: 'active',
			notes: 'Prioritas cetak malam',
			isActive: true,
			displayOrder: 2
		};

		const dto = mapResellerInputToDto(input);

		expect(dto.code).toBe('RSL-KREA-103');
		expect(dto.name).toBe('Kreatif Visual Media');
		expect(dto.owner_name).toBe('Dian Anggraini');
		expect(dto.phone).toBe('081122334455');
		expect(dto.email).toBe('dian@kreatifvisual.com');
		expect(dto.address).toBe('Jl. Khatib Sulaiman No. 12');
		expect(dto.tier).toBe('platinum');
		expect(dto.credit_limit).toBe(25000000);
		expect(dto.used_credit).toBe(7500000);
		expect(dto.deposit_balance).toBe(5000000);
		expect(dto.term_of_payment_days).toBe(45);
		expect(dto.status).toBe('active');
		expect(dto.notes).toBe('Prioritas cetak malam');
		expect(dto.is_active).toBe(true);
		expect(dto.display_order).toBe(2);
	});
});
