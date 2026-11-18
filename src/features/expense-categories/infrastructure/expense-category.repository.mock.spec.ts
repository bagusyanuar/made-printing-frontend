import { describe, it, expect, beforeEach } from 'vitest';
import { ExpenseCategoryRepositoryMock } from './expense-category.repository.mock';
import type { ExpenseCategoryInput } from '../domain/expense-category.entity';

describe('ExpenseCategoryRepositoryMock', () => {
	let repo: ExpenseCategoryRepositoryMock;

	beforeEach(() => {
		repo = new ExpenseCategoryRepositoryMock();
	});

	it('harus memuat daftar kategori pengeluaran terurut displayOrder', async () => {
		expect.assertions(3);
		const result = await repo.list();
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.length).toBeGreaterThanOrEqual(10);
			expect(result.data[0].displayOrder).toBeLessThanOrEqual(result.data[1].displayOrder);
		}
	});

	it('harus berhasil menambahkan kategori pengeluaran baru dan menolak duplikasi nama', async () => {
		expect.assertions(4);
		const input: ExpenseCategoryInput = {
			name: 'Pembelian Kertas HVS 70g',
			group: 'production',
			productCategoryId: 'cat-3',
			productCategoryName: 'Digital Printing A3+ Lembaran'
		};

		const createResult = await repo.create(input);
		expect(createResult.success).toBe(true);
		if (createResult.success) {
			expect(createResult.data.name).toBe('Pembelian Kertas HVS 70g');
			expect(createResult.data.group).toBe('production');
		}

		// Menolak duplikasi nama
		const duplicateResult = await repo.create(input);
		expect(duplicateResult.success).toBe(false);
	});

	it('harus berhasil mengupdate kategori pengeluaran', async () => {
		expect.assertions(3);
		const listResult = await repo.list();
		expect(listResult.success).toBe(true);
		if (listResult.success) {
			const target = listResult.data[0];
			const updateResult = await repo.update(target.id, {
				name: 'Pembelian Bahan Flexy Super White',
				group: 'production',
				productCategoryId: 'cat-1',
				productCategoryName: 'Large Format Outdoor'
			});
			expect(updateResult.success).toBe(true);
			if (updateResult.success) {
				expect(updateResult.data.name).toBe('Pembelian Bahan Flexy Super White');
			}
		}
	});

	it('harus berhasil menghapus kategori pengeluaran', async () => {
		expect.assertions(4);
		const listResult = await repo.list();
		expect(listResult.success).toBe(true);
		if (listResult.success) {
			const target = listResult.data[0];
			const deleteResult = await repo.delete(target.id);
			expect(deleteResult.success).toBe(true);

			const getResult = await repo.getById(target.id);
			expect(getResult.success).toBe(false);
			if (!getResult.success) {
				expect(getResult.error.name).toBe('NotFoundError');
			}
		}
	});
});
