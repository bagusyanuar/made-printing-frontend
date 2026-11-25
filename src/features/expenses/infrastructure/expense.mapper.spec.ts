import { describe, expect, it } from 'vitest';
import { mapExpenseDtoToEntity, mapExpenseInputToDto } from './expense.mapper';
import type { ExpenseDto } from './expense.dto';

describe('expense.mapper', () => {
	it('memetakan ExpenseDto multi-item beserta diskon dan hutang usaha ke Entity', () => {
		const dto: ExpenseDto = {
			id: 'exp-1',
			code: 'EXP-202611-0099',
			expense_date: '2026-11-25T10:00:00.000Z',
			group: 'mixed',
			items: [
				{
					id: 'item-1',
					group: 'production',
					category_id: 'exp-cat-001',
					category_name: 'Bahan Baku Flexy',
					product_category_name: 'Large Format Outdoor',
					description: '1 Roll Flexy 280g',
					amount: 1500000,
					notes: 'Roll 3.2m'
				},
				{
					id: 'item-2',
					group: 'operational',
					category_id: 'exp-cat-009',
					category_name: 'Konsumsi Toko',
					product_category_name: null,
					description: 'Air galon & kopi workshop',
					amount: 200000,
					notes: null
				}
			],
			vendor_id: 'sup-001',
			vendor_name: 'Toko Sinar',
			account_name: 'Split (Transfer + Kas Kecil)',
			payment_lines: [
				{ account_name: 'Transfer', amount: 1000000 },
				{ account_name: 'Kas Kecil', amount: 200000 }
			],
			payment_history: [
				{
					id: 'pay-1',
					payment_date: '2026-11-25T10:00:00.000Z',
					account_name: 'Transfer',
					amount: 1000000,
					reference_number: 'INV-99',
					note: 'DP awal',
					recorded_by: 'Admin'
				}
			],
			subtotal: 1700000,
			discount_amount: 100000,
			amount: 1600000,
			total_paid: 1200000,
			remaining_amount: 400000,
			payment_status: 'PARTIAL_PAID',
			status: 'APPROVED',
			recorded_by: 'Admin Percetakan',
			approved_by: 'Owner',
			approved_at: '2026-11-25T10:05:00.000Z',
			cancel_reason: null,
			cancelled_at: null,
			reference_number: 'INV-99',
			notes: 'Belanja mingguan',
			created_at: '2026-11-25T10:00:00.000Z',
			updated_at: '2026-11-25T10:05:00.000Z'
		};

		const entity = mapExpenseDtoToEntity(dto);

		expect(entity.group).toBe('mixed');
		expect(entity.subtotal).toBe(1700000);
		expect(entity.discountAmount).toBe(100000);
		expect(entity.amount).toBe(1600000);
		expect(entity.totalPaid).toBe(1200000);
		expect(entity.remainingAmount).toBe(400000);
		expect(entity.paymentStatus).toBe('PARTIAL_PAID');
		expect(entity.paymentHistory).toHaveLength(1);
	});

	it('memetakan ExpenseInput beserta diskon dan tempo ke CreateExpenseRequestDto', () => {
		const requestDto = mapExpenseInputToDto({
			expenseDate: '2026-11-25T12:00:00.000Z',
			discountAmount: 50000,
			vendorId: null,
			vendorName: '  Toko Jaya  ',
			referenceNumber: '',
			notes: '  Catatan nota  ',
			paymentLines: [],
			items: [
				{
					group: 'production',
					categoryId: 'exp-cat-003',
					categoryName: 'Tinta Cetak',
					description: '  Tinta Cyan 1L  ',
					amount: 450000,
					notes: '  Untuk printer outdoor  '
				}
			]
		});

		expect(requestDto.discount_amount).toBe(50000);
		expect(requestDto.reference_number).toBe('-');
		expect(requestDto.account_name).toBe('Tempo (Hutang Usaha)');
		expect(requestDto.payment_lines).toHaveLength(0);
	});
});
