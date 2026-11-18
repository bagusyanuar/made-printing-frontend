import { describe, it, expect, beforeEach } from 'vitest';
import { TicketOrderRepositoryMock } from './ticket-order.repository.mock';
import type { SaveDraftTicketOrderInput } from '../domain/ticket-order.entity';

describe('TicketOrderRepositoryMock', () => {
	let repo: TicketOrderRepositoryMock;

	beforeEach(() => {
		repo = new TicketOrderRepositoryMock();
	});

	it('harus berhasil memuat daftar tiket pesanan dengan paginasi', async () => {
		expect.assertions(4);
		const result = await repo.list({ page: 1, limit: 3 });
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.items).toHaveLength(3);
			expect(result.data.meta.page).toBe(1);
			expect(result.data.meta.total_data).toBeGreaterThanOrEqual(5);
		}
	});

	it('harus memfilter daftar tiket berdasarkan status DRAFT', async () => {
		expect.assertions(3);
		const result = await repo.list({ status: 'DRAFT' });
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.items.length).toBeGreaterThan(0);
			expect(result.data.items.every((item) => item.status === 'DRAFT')).toBe(true);
		}
	});

	it('harus berhasil menyimpan draft tiket pesanan baru', async () => {
		expect.assertions(5);
		const input: SaveDraftTicketOrderInput = {
			customerType: 'end_user',
			customerName: 'Asep Saepudin',
			customerPhone: '081234567890',
			notes: 'Cetak cepat',
			deadline: '2026-11-20T10:00:00Z',
			items: [
				{
					productVariantId: 'var-1',
					productName: 'Flexy 340g',
					uom: 'm2',
					quantity: 1,
					lengthM: 2,
					widthM: 1,
					productionNotes: 'Mata ayam 4 sudut'
				}
			]
		};

		const result = await repo.saveDraft(input);
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.customerName).toBe('Asep Saepudin');
			expect(result.data.status).toBe('DRAFT');
			expect(result.data.jobNumber).toContain('TKT-');
			expect(result.data.items).toHaveLength(1);
		}
	});

	it('harus berhasil mengirimkan tiket ke kasir (mengubah status menjadi PENDING_PAYMENT)', async () => {
		expect.assertions(2);
		const submitResult = await repo.submitToCashier('tkt-001');
		expect(submitResult.success).toBe(true);
		if (submitResult.success) {
			expect(submitResult.data.status).toBe('PENDING_PAYMENT');
		}
	});

	it('harus berhasil membatalkan tiket dengan alasan pembatalan', async () => {
		expect.assertions(3);
		const cancelResult = await repo.cancel('tkt-001', 'Customer membatalkan via WA');
		expect(cancelResult.success).toBe(true);
		if (cancelResult.success) {
			expect(cancelResult.data.status).toBe('CANCELLED');
			expect(cancelResult.data.cancelReason).toBe('Customer membatalkan via WA');
		}
	});
});
