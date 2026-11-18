import { describe, it, expect } from 'vitest';
import {
	mapOrderItemDtoToEntity,
	mapOrderDtoToEntity,
	mapSaveDraftInputToDto
} from './ticket-order.mapper';
import type { OrderResponseDto, OrderItemResponseDto } from './ticket-order.dto';
import type { SaveDraftTicketOrderInput } from '../domain/ticket-order.entity';

describe('ticketOrderMapper', () => {
	it('harus memetakan OrderItemResponseDto ke TicketOrderItem dengan format dimensi yang tepat', () => {
		expect.assertions(6);
		const dto: OrderItemResponseDto = {
			id: 'item-1',
			product_variant_id: 'var-1',
			product_name: 'Banner Flexy 340g',
			variant_name: 'Outdoor Standar',
			uom: 'm2',
			quantity: 2,
			length_m: 3,
			width_m: 1,
			production_notes: 'Mata ayam 4 sudut'
		};

		const entity = mapOrderItemDtoToEntity(dto);
		expect(entity.id).toBe('item-1');
		expect(entity.productName).toBe('Banner Flexy 340g');
		expect(entity.uom).toBe('m2');
		expect(entity.quantity).toBe(2);
		expect(entity.dimensionText).toBe('3 × 1 m (3.00 m²)');
		expect(entity.productionNotes).toBe('Mata ayam 4 sudut');
	});

	it('harus memetakan OrderResponseDto ke TicketOrder entity dengan aman', () => {
		expect.assertions(7);
		const dto: OrderResponseDto = {
			id: 'order-101',
			job_number: 'TKT-202611-001',
			status: 'DRAFT',
			customer_name: 'Budi Santoso',
			customer_phone: '08123456789',
			reseller_id: null,
			notes: 'Tolong diselesaikan segera',
			deadline: '2026-11-20T17:00:00Z',
			order_items: [
				{
					id: 'item-1',
					product_variant_id: 'var-1',
					product_name: 'Sticker Vinyl A3+',
					uom: 'lembar',
					quantity: 10,
					production_notes: 'Laminasi doff & kiss cut'
				}
			],
			created_at: '2026-11-18T10:00:00Z',
			updated_at: '2026-11-18T10:00:00Z'
		};

		const entity = mapOrderDtoToEntity(dto);
		expect(entity.id).toBe('order-101');
		expect(entity.jobNumber).toBe('TKT-202611-001');
		expect(entity.status).toBe('DRAFT');
		expect(entity.customerType).toBe('end_user');
		expect(entity.customerName).toBe('Budi Santoso');
		expect(entity.items).toHaveLength(1);
		expect(entity.totalItems).toBe(10);
	});

	it('harus mengonversi SaveDraftTicketOrderInput ke DraftOrderRequestDto dengan benar', () => {
		expect.assertions(5);
		const input: SaveDraftTicketOrderInput = {
			customerType: 'reseller',
			customerName: 'Percetakan Mitra Jaya',
			customerPhone: '08781234567',
			resellerId: 'reseller-55',
			notes: 'Order reseller berkala',
			deadline: '2026-11-22T12:00:00Z',
			items: [
				{
					productVariantId: 'var-12',
					productName: 'Flexy Korcin 440g',
					uom: 'm2',
					quantity: 1,
					lengthM: 4,
					widthM: 2,
					productionNotes: 'Seaming keliling'
				}
			]
		};

		const dto = mapSaveDraftInputToDto(input);
		expect(dto.customer_name).toBe('Percetakan Mitra Jaya');
		expect(dto.reseller_id).toBe('reseller-55');
		expect(dto.items).toHaveLength(1);
		expect(dto.items[0].length_m).toBe(4);
		expect(dto.items[0].width_m).toBe(2);
	});
});
