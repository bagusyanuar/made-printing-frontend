import { describe, it, expect, beforeEach } from 'vitest';
import { SupplierRepositoryMock } from './supplier.repository.mock';

describe('SupplierRepositoryMock', () => {
	let repo: SupplierRepositoryMock;

	beforeEach(() => {
		repo = new SupplierRepositoryMock();
	});

	it('harus mengembalikan daftar supplier yang terurut berdasarkan displayOrder', async () => {
		const result = await repo.list();
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.length).toBeGreaterThanOrEqual(8);
			expect(result.data[0].displayOrder).toBe(1);
			expect(result.data[0].name).toBe('PT Surya Kencana Grafika');
		}
	});

	it('harus menemukan supplier berdasarkan ID yang valid dan mengembalikan error jika tidak ada', async () => {
		const found = await repo.getById('spl-001');
		expect(found.success).toBe(true);
		if (found.success) {
			expect(found.data.name).toBe('PT Surya Kencana Grafika');
		}

		const notFound = await repo.getById('spl-999-tidak-ada');
		expect(notFound.success).toBe(false);
	});

	it('harus berhasil menambahkan supplier baru dan menolak duplikasi nama', async () => {
		const createResult = await repo.create({
			name: 'PT Percetakan Jaya Abadi',
			contactPerson: 'Anton Wijaya',
			phone: '081234567899',
			email: 'anton@jayaabadi.com',
			address: 'Jl. Merdeka No. 10',
			notes: 'Vendor plat CTP offset'
		});

		expect(createResult.success).toBe(true);
		if (createResult.success) {
			expect(createResult.data.name).toBe('PT Percetakan Jaya Abadi');
			expect(createResult.data.code).toContain('SPL-');
		}

		// Percobaan kedua dengan nama yang sama harus gagal
		const dupResult = await repo.create({
			name: 'PT Percetakan Jaya Abadi',
			phone: '081200000000'
		});
		expect(dupResult.success).toBe(false);
	});

	it('harus memperbarui data supplier yang ada', async () => {
		const updateResult = await repo.update('spl-001', {
			name: 'PT Surya Kencana Grafika Utama',
			phone: '081299998888',
			notes: 'Update info kontak'
		});

		expect(updateResult.success).toBe(true);
		if (updateResult.success) {
			expect(updateResult.data.name).toBe('PT Surya Kencana Grafika Utama');
			expect(updateResult.data.phone).toBe('081299998888');
		}
	});

	it('harus berhasil menghapus data supplier', async () => {
		const deleteResult = await repo.delete('spl-008');
		expect(deleteResult.success).toBe(true);

		const check = await repo.getById('spl-008');
		expect(check.success).toBe(false);
	});

	it('harus berhasil mengubah urutan (reorder) supplier', async () => {
		const reorderResult = await repo.reorder([
			{ id: 'spl-001', displayOrder: 2 },
			{ id: 'spl-002', displayOrder: 1 }
		]);

		expect(reorderResult.success).toBe(true);

		const listResult = await repo.list();
		if (listResult.success) {
			const first = listResult.data[0];
			expect(first.id).toBe('spl-002');
			expect(first.displayOrder).toBe(1);
		}
	});
});
