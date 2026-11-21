import { describe, it, expect, beforeEach } from 'vitest';
import { MockCashierRepository } from './cashier.repository.mock';

describe('MockCashierRepository', () => {
	let repo: MockCashierRepository;

	beforeEach(() => {
		repo = new MockCashierRepository();
	});

	it('returns initial orders queue', async () => {
		const res = await repo.getCashierOrders();
		expect(res.success).toBe(true);
		if (!res.success) return;
		const orders = res.data;
		expect(orders.length).toBeGreaterThan(0);
		expect(orders.some((o) => o.jobNumber === 'JOB/20261119/0001')).toBe(true);
	});

	it('filters orders by order type (PRODUCTION vs RETAIL)', async () => {
		const prodRes = await repo.getCashierOrders({ type: 'PRODUCTION' });
		expect(prodRes.success).toBe(true);
		if (prodRes.success) {
			expect(prodRes.data.every((o) => o.orderType === 'PRODUCTION')).toBe(true);
		}

		const retRes = await repo.getCashierOrders({ type: 'RETAIL' });
		expect(retRes.success).toBe(true);
		if (retRes.success) {
			expect(retRes.data.every((o) => o.orderType === 'RETAIL')).toBe(true);
		}
	});

	it('updates item price and recalculates subtotal and remainingAmount', async () => {
		const orderRes = await repo.getCashierOrderById('ord-prod-001');
		expect(orderRes.success).toBe(true);
		if (!orderRes.success) return;
		const order = orderRes.data;

		// Update price of first item (AP120 1 pcs) from 6000 to 10000
		const updateRes = await repo.updateItemPrice(order.id, 'ord-item-01', 10000);
		expect(updateRes.success).toBe(true);
		if (!updateRes.success) return;
		const updated = updateRes.data;

		const updatedItem = updated.items.find((i) => i.id === 'ord-item-01');
		expect(updatedItem?.pricePerUnit).toBe(10000);
		expect(updatedItem?.subtotal).toBe(10000);
		// Previous subtotal was 6000 + 68000 = 74000. Now 10000 + 68000 = 78000
		expect(updated.subtotal).toBe(78000);
		expect(updated.remainingAmount).toBe(78000);
	});

	it('adds a retail item into an active production ticket', async () => {
		const addRes = await repo.addRetailItem('ord-prod-001', {
			name: 'Air Mineral Le Minerale',
			price: 4000,
			quantity: 2,
			uom: 'pcs'
		});

		expect(addRes.success).toBe(true);
		if (!addRes.success) return;
		const updated = addRes.data;
		expect(updated.items.some((i) => i.productName === 'Air Mineral Le Minerale')).toBe(true);
		// 74000 + 8000 = 82000
		expect(updated.subtotal).toBe(82000);
	});

	it('processes full single cash payment and sets status to LUNAS with kembalian', async () => {
		const payRes = await repo.processPayment('ord-prod-001', {
			isSplit: false,
			method: 'CASH',
			singleAmount: 100000 // paying 100.000 for 74.000 tagihan
		});

		expect(payRes.success).toBe(true);
		if (!payRes.success) return;
		const paidOrder = payRes.data;
		expect(paidOrder.status).toBe('LUNAS');
		expect(paidOrder.totalPaid).toBe(100000);
		expect(paidOrder.remainingAmount).toBe(0);
		expect(paidOrder.changeAmount).toBe(26000);
		expect(paidOrder.invoiceNumber).toBeDefined();
	});

	it('processes partial payment (DP) and keeps remainingAmount', async () => {
		const payRes = await repo.processPayment('ord-prod-001', {
			isSplit: false,
			method: 'TRANSFER',
			singleAmount: 40000 // DP 40.000 dari 74.000
		});

		expect(payRes.success).toBe(true);
		if (!payRes.success) return;
		const partialOrder = payRes.data;
		expect(partialOrder.status).toBe('PARTIAL_PAID');
		expect(partialOrder.totalPaid).toBe(40000);
		expect(partialOrder.remainingAmount).toBe(34000);
		expect(partialOrder.changeAmount).toBe(0);
	});

	it('processes split payment with combined CASH, TRANSFER, and QRIS', async () => {
		const payRes = await repo.processPayment('ord-prod-001', {
			isSplit: true,
			splitAmounts: {
				cash: 24000,
				transfer: 50000,
				qris: 0
			}
		});

		expect(payRes.success).toBe(true);
		if (!payRes.success) return;
		const splitOrder = payRes.data;
		expect(splitOrder.status).toBe('LUNAS');
		expect(splitOrder.totalPaid).toBe(74000);
		expect(splitOrder.paymentMethod).toBe('SPLIT');
		expect(splitOrder.paymentDetails?.length).toBe(2);
	});

	it('sends order back to designer draft', async () => {
		const draftRes = await repo.sendToDraft('ord-prod-001');
		expect(draftRes.success).toBe(true);
		if (draftRes.success) {
			expect(draftRes.data.status).toBe('DRAFT');
		}
	});

	it('cancels order with reason', async () => {
		const cancelRes = await repo.cancelOrder('ord-prod-001', 'Pelanggan berubah pikiran');
		expect(cancelRes.success).toBe(true);
		if (!cancelRes.success) return;
		const cancelled = cancelRes.data;
		expect(cancelled.status).toBe('CANCELLED');
		expect(cancelled.cancelReason).toBe('Pelanggan berubah pikiran');
		expect(cancelled.cancelledAt).toBeDefined();
	});

	it('creates a standalone direct retail order', async () => {
		const createRes = await repo.createRetailOrder({
			customerName: 'Pak Joko Walk-in',
			customerPhone: '0812345678',
			items: [
				{
					name: 'Frame A3 Kayu Hitam',
					price: 45000,
					quantity: 1,
					uom: 'pcs'
				}
			]
		});

		expect(createRes.success).toBe(true);
		if (!createRes.success) return;
		const newRetail = createRes.data;
		expect(newRetail.orderType).toBe('RETAIL');
		expect(newRetail.customerName).toBe('Pak Joko Walk-in');
		expect(newRetail.subtotal).toBe(45000);
		expect(newRetail.status).toBe('PENDING_PAYMENT');
	});

	it('merges retail order into target production ticket', async () => {
		const mergeRes = await repo.mergeToProductionTicket('ord-ret-001', 'ord-prod-001');
		expect(mergeRes.success).toBe(true);
		if (!mergeRes.success) return;
		const merged = mergeRes.data;

		// Target production order now contains retail order items
		expect(merged.items.length).toBe(4);
		// Retail order ord-ret-001 is deleted
		const getRetail = await repo.getCashierOrderById('ord-ret-001');
		expect(getRetail.success).toBe(false);
	});

	it('splits multiple retail items in batch from production ticket into single new retail order', async () => {
		// First add 2 retail items to ord-prod-001
		await repo.addRetailItem('ord-prod-001', {
			name: 'Air Mineral Le Minerale',
			price: 4000,
			quantity: 1,
			uom: 'pcs'
		});
		await repo.addRetailItem('ord-prod-001', {
			name: 'Kopi Good Day Botol',
			price: 7000,
			quantity: 1,
			uom: 'pcs'
		});

		const splitRes = await repo.splitRetailItemsBatch('ord-prod-001');
		expect(splitRes.success).toBe(true);
		if (!splitRes.success) return;

		const { sourceOrder, newRetailOrder } = splitRes.data;
		// Source order now has only production items
		expect(sourceOrder.items.every((i) => i.isProduction)).toBe(true);
		expect(sourceOrder.subtotal).toBe(74000);

		// New retail order contains both retail items
		expect(newRetailOrder.orderType).toBe('RETAIL');
		expect(newRetailOrder.items.length).toBe(2);
		expect(newRetailOrder.subtotal).toBe(11000);
		expect(newRetailOrder.remainingAmount).toBe(11000);
	});
});
