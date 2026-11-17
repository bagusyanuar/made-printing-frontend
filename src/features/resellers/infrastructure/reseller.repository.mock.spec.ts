import { describe, it, expect, beforeEach } from 'vitest';
import { ResellerRepositoryMock } from './reseller.repository.mock';
import type { ResellerInput } from '../domain/reseller.entity';

describe('ResellerRepositoryMock', () => {
	let repo: ResellerRepositoryMock;

	beforeEach(() => {
		repo = new ResellerRepositoryMock();
	});

	it('harus mengembalikan daftar reseller terurut berdasarkan displayOrder', async () => {
		const result = await repo.list();
		expect(result.success).toBe(true);
		if (!result.success) return;

		expect(result.data.length).toBeGreaterThan(0);
		for (let i = 0; i < result.data.length - 1; i++) {
			expect(result.data[i].displayOrder).toBeLessThanOrEqual(result.data[i + 1].displayOrder);
		}
	});

	it('harus dapat mengambil detail reseller berdasarkan ID', async () => {
		const listResult = await repo.list();
		expect(listResult.success).toBe(true);
		if (!listResult.success) return;

		const target = listResult.data[0];
		const getResult = await repo.getById(target.id);

		expect(getResult.success).toBe(true);
		if (!getResult.success) return;
		expect(getResult.data.id).toBe(target.id);
		expect(getResult.data.name).toBe(target.name);
	});

	it('harus membuat reseller baru dan memasukkannya ke awal daftar', async () => {
		const input: ResellerInput = {
			name: 'Biro Barokah Grafika',
			ownerName: 'Umar Bakri',
			phone: '081234567899',
			email: 'barokah@gmail.com',
			tier: 'gold',
			creditLimit: 12000000,
			depositBalance: 1500000,
			termOfPaymentDays: 14
		};

		const createResult = await repo.create(input);
		expect(createResult.success).toBe(true);
		if (!createResult.success) return;

		expect(createResult.data.name).toBe('Biro Barokah Grafika');
		expect(createResult.data.code).toContain('RSL-');
		expect(createResult.data.creditLimit).toBe(12000000);
		expect(createResult.data.depositBalance).toBe(1500000);
	});

	it('harus memperbarui profil reseller yang ada', async () => {
		const listResult = await repo.list();
		expect(listResult.success).toBe(true);
		if (!listResult.success) return;

		const target = listResult.data[0];
		const updateInput: ResellerInput = {
			name: `${target.name} Updated`,
			ownerName: target.ownerName,
			phone: target.phone,
			tier: 'platinum',
			creditLimit: 35000000,
			termOfPaymentDays: 30
		};

		const updateResult = await repo.update(target.id, updateInput);
		expect(updateResult.success).toBe(true);
		if (!updateResult.success) return;

		expect(updateResult.data.name).toBe(`${target.name} Updated`);
		expect(updateResult.data.tier).toBe('platinum');
		expect(updateResult.data.creditLimit).toBe(35000000);
	});

	it('harus menambah dan mengurangi saldo deposit dengan benar', async () => {
		const listResult = await repo.list();
		expect(listResult.success).toBe(true);
		if (!listResult.success) return;

		const target = listResult.data[0];
		const initialDeposit = target.depositBalance;

		// Top-Up
		const topUpResult = await repo.adjustDeposit(target.id, 1000000, 'Top up transfer BCA');
		expect(topUpResult.success).toBe(true);
		if (!topUpResult.success) return;
		expect(topUpResult.data.depositBalance).toBe(initialDeposit + 1000000);

		// Koreksi
		const deductResult = await repo.adjustDeposit(target.id, -500000, 'Koreksi nota');
		expect(deductResult.success).toBe(true);
		if (!deductResult.success) return;
		expect(deductResult.data.depositBalance).toBe(initialDeposit + 500000);
	});

	it('harus menolak menghapus mitra jika masih memiliki piutang berjalan', async () => {
		const listResult = await repo.list();
		expect(listResult.success).toBe(true);
		if (!listResult.success) return;

		const withCredit = listResult.data.find((r) => r.usedCredit > 0);
		expect(withCredit).toBeDefined();
		if (!withCredit) return;

		const deleteResult = await repo.delete(withCredit.id);
		expect(deleteResult.success).toBe(false);
	});
});
