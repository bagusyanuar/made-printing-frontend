import { describe, it, expect, beforeEach } from 'vitest';
import { MockOrderRepository } from './order.repository.mock';

describe('MockOrderRepository', () => {
	let repo: MockOrderRepository;

	beforeEach(() => {
		repo = new MockOrderRepository();
	});

	it('returns initial orders list successfully', async () => {
		const res = await repo.getOrders();
		expect(res.success).toBe(true);
		if (res.success) {
			expect(res.data.length).toBeGreaterThan(0);
			expect(res.data[0].invoiceNumber).toBeDefined();
		}
	});

	it('filters orders by payment status', async () => {
		const res = await repo.getOrders({ status: 'LUNAS' });
		expect(res.success).toBe(true);
		if (res.success) {
			expect(res.data.every((o) => o.status === 'LUNAS')).toBe(true);
		}
	});

	it('calculates order stats accurately', async () => {
		const res = await repo.getOrderStats();
		expect(res.success).toBe(true);
		if (res.success) {
			expect(res.data.totalInvoiced).toBeGreaterThan(0);
			expect(res.data.paidCount).toBeGreaterThanOrEqual(1);
		}
	});

	it('updates fulfillment status of active order', async () => {
		const updateRes = await repo.updateFulfillmentStatus('ord-202611-001', 'READY_FOR_PICKUP');
		expect(updateRes.success).toBe(true);
		if (updateRes.success) {
			expect(updateRes.data.fulfillmentStatus).toBe('READY_FOR_PICKUP');
		}
	});

	it('settles remaining payment on partial order', async () => {
		const settleRes = await repo.settlePayment('ord-202611-002', {
			amount: 175000,
			method: 'CASH',
			note: 'Pelunasan sisa di kasir'
		});

		expect(settleRes.success).toBe(true);
		if (settleRes.success) {
			expect(settleRes.data.remainingAmount).toBe(0);
			expect(settleRes.data.status).toBe('LUNAS');
			expect(settleRes.data.paymentHistory.length).toBe(2);
		}
	});

	it('marks order as picked up with settlement', async () => {
		const pickupRes = await repo.markAsPickedUp('ord-202611-002', {
			settlePayment: {
				amount: 175000,
				method: 'CASH'
			},
			pickedUpBy: 'Kasir 1'
		});

		expect(pickupRes.success).toBe(true);
		if (pickupRes.success) {
			expect(pickupRes.data.fulfillmentStatus).toBe('PICKED_UP');
			expect(pickupRes.data.status).toBe('LUNAS');
			expect(pickupRes.data.pickedUpAt).toBeDefined();
		}
	});

	it('cancels an active order with reason', async () => {
		const cancelRes = await repo.cancelOrder('ord-202611-006', 'Salah ukuran bahan');
		expect(cancelRes.success).toBe(true);
		if (cancelRes.success) {
			expect(cancelRes.data.status).toBe('CANCELLED');
			expect(cancelRes.data.cancelReason).toBe('Salah ukuran bahan');
		}
	});
});
