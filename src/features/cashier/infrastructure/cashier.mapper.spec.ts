import { describe, it, expect } from 'vitest';
import {
	mapCashierOrderDtoToEntity,
	mapCashierOrderItemDtoToEntity,
	mapCashierRetailCatalogItemDtoToEntity
} from './cashier.mapper';
import type { CashierOrderDto, CashierOrderItemDto, CashierRetailCatalogItemDto } from './cashier.dto';

describe('Cashier Mapper', () => {
	it('maps CashierOrderItemDto to CashierOrderItem entity correctly', () => {
		const dto: CashierOrderItemDto = {
			id: 'item-1',
			product_id: 'prod-1',
			product_name: 'Banner Flexy 280g',
			is_production: true,
			uom: 'm2',
			length_m: 3,
			width_m: 1,
			dimension_text: '3 x 1 m (3.00 m²)',
			finishing_text: 'Mata ayam 4 sudut',
			quantity: 2,
			price_per_unit: 20000,
			subtotal: 120000
		};

		const entity = mapCashierOrderItemDtoToEntity(dto);

		expect(entity.id).toBe('item-1');
		expect(entity.productName).toBe('Banner Flexy 280g');
		expect(entity.isProduction).toBe(true);
		expect(entity.lengthM).toBe(3);
		expect(entity.widthM).toBe(1);
		expect(entity.quantity).toBe(2);
		expect(entity.pricePerUnit).toBe(20000);
		expect(entity.subtotal).toBe(120000);
	});

	it('maps CashierOrderDto to CashierOrder entity correctly', () => {
		const dto: CashierOrderDto = {
			id: 'ord-1',
			job_number: 'JOB/20261119/0001',
			invoice_number: 'INV-001',
			order_type: 'PRODUCTION',
			status: 'PENDING_PAYMENT',
			customer_type: 'end_user',
			customer_name: 'budi',
			customer_phone: '081234567890',
			designer_name: 'administrator',
			items: [],
			subtotal: 50000,
			total_paid: 0,
			remaining_amount: 50000,
			change_amount: 0,
			created_at: '2026-11-19 12:00:18',
			updated_at: '2026-11-19 12:00:18'
		};

		const entity = mapCashierOrderDtoToEntity(dto);

		expect(entity.id).toBe('ord-1');
		expect(entity.jobNumber).toBe('JOB/20261119/0001');
		expect(entity.orderType).toBe('PRODUCTION');
		expect(entity.status).toBe('PENDING_PAYMENT');
		expect(entity.customerName).toBe('budi');
		expect(entity.subtotal).toBe(50000);
	});

	it('maps CashierRetailCatalogItemDto to entity correctly', () => {
		const dto: CashierRetailCatalogItemDto = {
			id: 'cat-1',
			name: 'Air Mineral Le Minerale',
			category_name: 'Minuman Dingin',
			price: 4000,
			uom: 'pcs',
			stock: 48,
			is_production: false
		};

		const entity = mapCashierRetailCatalogItemDtoToEntity(dto);

		expect(entity.id).toBe('cat-1');
		expect(entity.name).toBe('Air Mineral Le Minerale');
		expect(entity.price).toBe(4000);
		expect(entity.isProduction).toBe(false);
	});
});
