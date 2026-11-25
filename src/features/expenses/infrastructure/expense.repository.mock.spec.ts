import { describe, expect, it } from 'vitest';
import { MockExpenseRepository } from './expense.repository.mock';

describe('MockExpenseRepository', () => {
	it('membuat nota multi-item dengan diskon dan pembayaran sebagian menjadi hutang usaha lalu melunasinya', async () => {
		const repo = new MockExpenseRepository();

		const created = await repo.create({
			vendorId: 'sup-001',
			vendorName: 'PT Sinar Grafika Material',
			discountAmount: 50000,
			paymentLines: [{ accountName: 'Transfer', amount: 100000 }],
			items: [
				{
					group: 'production',
					categoryId: 'exp-cat-001',
					categoryName: 'Pembelian Bahan Baku Flexy & Spanduk',
					description: 'Mata ayam 10mm 3 pack',
					amount: 90000
				},
				{
					group: 'operational',
					categoryId: 'exp-cat-009',
					categoryName: 'Konsumsi & Perlengkapan Operasional Toko',
					description: 'Makan siang operator lembur',
					amount: 160000
				}
			]
		});

		expect(created.success).toBe(true);
		if (!created.success) return;

		expect(created.data.group).toBe('mixed');
		expect(created.data.subtotal).toBe(250000);
		expect(created.data.discountAmount).toBe(50000);
		expect(created.data.amount).toBe(200000);
		expect(created.data.totalPaid).toBe(100000);
		expect(created.data.remainingAmount).toBe(100000);
		expect(created.data.paymentStatus).toBe('PARTIAL_PAID');
		expect(created.data.referenceNumber).toBe('-');

		const settled = await repo.settlePayment(created.data.id, {
			amount: 100000,
			accountName: 'Kas Kecil',
			note: 'Pelunasan sisa hutang'
		});

		expect(settled.success).toBe(true);
		if (settled.success) {
			expect(settled.data.totalPaid).toBe(200000);
			expect(settled.data.remainingAmount).toBe(0);
			expect(settled.data.paymentStatus).toBe('LUNAS');
			expect(settled.data.paymentHistory).toHaveLength(2);
			expect(settled.data.accountName).toBe('Split (Transfer + Kas Kecil)');
		}
	});

	it('menyetujui dan membatalkan transaksi pengeluaran dengan alasan yang valid', async () => {
		const repo = new MockExpenseRepository();
		const listRes = await repo.list();
		expect(listRes.success).toBe(true);
		if (!listRes.success) return;

		const pendingItem = listRes.data.find((e) => e.status === 'PENDING');
		expect(pendingItem).toBeDefined();
		if (!pendingItem) return;

		const approved = await repo.approve(pendingItem.id);
		expect(approved.success).toBe(true);
		if (approved.success) {
			expect(approved.data.status).toBe('APPROVED');
		}

		const cancelled = await repo.cancel(pendingItem.id, 'Salah nominal nota');
		expect(cancelled.success).toBe(true);
		if (cancelled.success) {
			expect(cancelled.data.status).toBe('CANCELLED');
			expect(cancelled.data.paymentStatus).toBe('CANCELLED');
			expect(cancelled.data.cancelReason).toBe('Salah nominal nota');
		}
	});
});
