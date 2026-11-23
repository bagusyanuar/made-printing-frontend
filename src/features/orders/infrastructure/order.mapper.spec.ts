import { describe, it, expect } from 'vitest';
import {
	mapOrderItemDtoToEntity,
	mapOrderDtoToEntity,
	mapOrderStatsDtoToEntity
} from './order.mapper';
import type { OrderDto, OrderItemDto, OrderStatsDto } from './order.dto';

describe('OrderMapper', () => {
	it('maps OrderItemDto to OrderItem entity correctly', () => {
		const dto: OrderItemDto = {
			id: 'item-1',
			product_id: 'prod-1',
			product_name: 'Brosur A4',
			is_production: true,
			uom: 'rim',
			dimension_text: '1 rim (500 lembar)',
			finishing_text: 'Lipat 3',
			quantity: 2,
			price_per_unit: 100000,
			subtotal: 200000
		};

		const entity = mapOrderItemDtoToEntity(dto);
		expect(entity.id).toBe('item-1');
		expect(entity.productName).toBe('Brosur A4');
		expect(entity.subtotal).toBe(200000);
	});

	it('maps OrderDto to Order entity correctly', () => {
		const dto: OrderDto = {
			id: 'ord-1',
			invoice_number: 'INV/202611/0001',
			order_id: 'ord-1',
			job_number: 'TKT/20261119/0001',
			order_type: 'PRODUCTION',
			status: 'LUNAS',
			fulfillment_status: 'READY_FOR_PICKUP',
			rack_location: 'Rak A-01',
			customer_type: 'end_user',
			customer_name: 'Pak Budi',
			customer_phone: '08123456789',
			reseller_id: null,
			reseller_name: null,
			items: [
				{
					id: 'item-1',
					product_name: 'Banner',
					is_production: true,
					uom: 'pcs',
					quantity: 1,
					price_per_unit: 50000,
					subtotal: 50000
				}
			],
			subtotal: 50000,
			total_paid: 50000,
			remaining_amount: 0,
			due_date: null,
			payment_history: [],
			notes: 'Selesai',
			issued_at: '2026-11-20T10:00:00.000Z',
			updated_at: '2026-11-20T10:00:00.000Z'
		};

		const entity = mapOrderDtoToEntity(dto);
		expect(entity.id).toBe('ord-1');
		expect(entity.invoiceNumber).toBe('INV/202611/0001');
		expect(entity.status).toBe('LUNAS');
		expect(entity.fulfillmentStatus).toBe('READY_FOR_PICKUP');
		expect(entity.rackLocation).toBe('Rak A-01');
		expect(entity.totalPaid).toBe(50000);
		expect(entity.items.length).toBe(1);
	});

	it('maps OrderStatsDto to OrderStats entity correctly', () => {
		const dto: OrderStatsDto = {
			total_invoiced: 1000000,
			total_paid: 700000,
			total_remaining: 300000,
			overdue_count: 1,
			partial_count: 2,
			paid_count: 5
		};

		const entity = mapOrderStatsDtoToEntity(dto);
		expect(entity.totalInvoiced).toBe(1000000);
		expect(entity.totalRemaining).toBe(300000);
		expect(entity.overdueCount).toBe(1);
	});
});
