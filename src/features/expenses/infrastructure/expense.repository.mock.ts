import { Result } from '$lib/shared/domain/types/result';
import { NotFoundError, ValidationError, type AppError } from '$lib/shared/domain/errors/app-error';
import {
	formatExpenseAccountsSummary,
	resolveExpensePaymentStatus,
	resolveExpenseReceiptGroup,
	type Expense,
	type ExpenseInput,
	type ExpenseItem,
	type ExpensePaymentRecord,
	type ExpenseSettlePaymentInput
} from '../domain/expense.entity';
import type { ExpenseRepository } from '../domain/expense.repository';

const INITIAL_EXPENSES: Expense[] = [
	{
		id: 'exp-202611-021',
		code: 'EXP-202611-0021',
		expenseDate: '2026-11-25T14:20:00.000Z',
		group: 'production',
		items: [
			{
				id: 'exp-item-021-1',
				group: 'production',
				categoryId: 'exp-cat-001',
				categoryName: 'Pembelian Bahan Baku Flexy & Spanduk',
				productCategoryName: 'Large Format Outdoor',
				description: '2 Roll Flexy Korea 440g lebar 3.2m',
				amount: 3500000,
				notes: 'Stok utama cetak spanduk akhir bulan'
			},
			{
				id: 'exp-item-021-2',
				group: 'production',
				categoryId: 'exp-cat-003',
				categoryName: 'Tinta Cetak Solvent & Ecosolvent',
				productCategoryName: 'Large Format Outdoor',
				description: 'Tinta Solvent Black 1L & Cyan 1L',
				amount: 800000
			}
		],
		vendorId: 'sup-001',
		vendorName: 'PT Sinar Grafika Material',
		accountName: 'Split (Transfer + Kas Besar)',
		paymentLines: [
			{ accountName: 'Transfer', amount: 3500000 },
			{ accountName: 'Kas Besar', amount: 700000 }
		],
		paymentHistory: [
			{
				id: 'exp-pay-021-1',
				paymentDate: '2026-11-25T14:20:00.000Z',
				accountName: 'Transfer',
				amount: 3500000,
				referenceNumber: 'INV-SGM-8821',
				note: 'Pembayaran bahan via transfer bank',
				recordedBy: 'Admin Percetakan'
			},
			{
				id: 'exp-pay-021-2',
				paymentDate: '2026-11-25T14:20:00.000Z',
				accountName: 'Kas Besar',
				amount: 700000,
				referenceNumber: 'INV-SGM-8821',
				note: 'Pembayaran sisa tunai kas besar',
				recordedBy: 'Admin Percetakan'
			}
		],
		subtotal: 4300000,
		discountAmount: 100000,
		amount: 4200000,
		totalPaid: 4200000,
		remainingAmount: 0,
		paymentStatus: 'LUNAS',
		status: 'APPROVED',
		recordedBy: 'Admin Percetakan',
		approvedBy: 'Owner (Bagus Yanuar)',
		approvedAt: '2026-11-25T14:25:00.000Z',
		referenceNumber: 'INV-SGM-8821',
		notes: 'Diskon langganan Rp 100.000 dari PT Sinar Grafika Material',
		createdAt: '2026-11-25T14:20:00.000Z',
		updatedAt: '2026-11-25T14:25:00.000Z'
	},
	{
		id: 'exp-202611-020',
		code: 'EXP-202611-0020',
		expenseDate: '2026-11-25T10:15:00.000Z',
		group: 'operational',
		items: [
			{
				id: 'exp-item-020-1',
				group: 'operational',
				categoryId: 'exp-cat-008',
				categoryName: 'Perawatan Berkala Mesin Cetak & Sparepart',
				productCategoryName: null,
				description: 'Service rutin mesin cetak Konica Minolta A3+ & ganti fuser film',
				amount: 750000
			}
		],
		vendorId: null,
		vendorName: 'Teknisi Mitra Print',
		accountName: 'Kas Besar',
		paymentLines: [{ accountName: 'Kas Besar', amount: 750000 }],
		paymentHistory: [
			{
				id: 'exp-pay-020-1',
				paymentDate: '2026-11-25T10:15:00.000Z',
				accountName: 'Kas Besar',
				amount: 750000,
				referenceNumber: 'SRV-KM-1102',
				note: 'Pembayaran jasa teknisi',
				recordedBy: 'Operator Produksi 1'
			}
		],
		subtotal: 750000,
		discountAmount: 0,
		amount: 750000,
		totalPaid: 750000,
		remainingAmount: 0,
		paymentStatus: 'LUNAS',
		status: 'PENDING',
		recordedBy: 'Operator Produksi 1',
		referenceNumber: 'SRV-KM-1102',
		notes: 'Menunggu nota resmi dari teknisi untuk arsip',
		createdAt: '2026-11-25T10:15:00.000Z',
		updatedAt: '2026-11-25T10:15:00.000Z'
	},
	{
		id: 'exp-202611-019',
		code: 'EXP-202611-0019',
		expenseDate: '2026-11-24T16:45:00.000Z',
		group: 'mixed',
		items: [
			{
				id: 'exp-item-019-1',
				group: 'operational',
				categoryId: 'exp-cat-009',
				categoryName: 'Konsumsi & Perlengkapan Operasional Toko',
				productCategoryName: null,
				description: 'Konsumsi lembur operator SPK cetak banner event',
				amount: 250000
			},
			{
				id: 'exp-item-019-2',
				group: 'production',
				categoryId: 'exp-cat-001',
				categoryName: 'Pembelian Bahan Baku Flexy & Spanduk',
				productCategoryName: 'Large Format Outdoor',
				description: 'Mata Ayam 10mm (2 Pack) & Lem G darurat',
				amount: 145000
			}
		],
		vendorId: null,
		vendorName: 'Belanja Petty Cash Sore',
		accountName: 'Kas Kecil',
		paymentLines: [{ accountName: 'Kas Kecil', amount: 395000 }],
		paymentHistory: [
			{
				id: 'exp-pay-019-1',
				paymentDate: '2026-11-24T16:45:00.000Z',
				accountName: 'Kas Kecil',
				amount: 395000,
				referenceNumber: '-',
				note: 'Pengeluaran kas kecil harian',
				recordedBy: 'Kasir Utama'
			}
		],
		subtotal: 395000,
		discountAmount: 0,
		amount: 395000,
		totalPaid: 395000,
		remainingAmount: 0,
		paymentStatus: 'LUNAS',
		status: 'APPROVED',
		recordedBy: 'Kasir Utama',
		approvedBy: 'Admin Percetakan',
		approvedAt: '2026-11-24T17:00:00.000Z',
		referenceNumber: '-',
		notes: 'Lembur 4 operator shift malam hingga pukul 23:00',
		createdAt: '2026-11-24T16:45:00.000Z',
		updatedAt: '2026-11-24T17:00:00.000Z'
	},
	{
		id: 'exp-202611-018',
		code: 'EXP-202611-0018',
		expenseDate: '2026-11-23T11:30:00.000Z',
		group: 'production',
		items: [
			{
				id: 'exp-item-018-1',
				group: 'production',
				categoryId: 'exp-cat-003',
				categoryName: 'Tinta Cetak Solvent & Ecosolvent',
				productCategoryName: 'Large Format Outdoor',
				description: 'Isi ulang Tinta Ecosolvent CMYK 4 x 1 Liter & Cleaning Solution',
				amount: 2800000
			}
		],
		vendorId: 'sup-003',
		vendorName: 'CV Warna Prima Ink',
		accountName: 'Transfer',
		paymentLines: [{ accountName: 'Transfer', amount: 1500000 }],
		paymentHistory: [
			{
				id: 'exp-pay-018-1',
				paymentDate: '2026-11-23T11:30:00.000Z',
				accountName: 'Transfer',
				amount: 1500000,
				referenceNumber: 'TRF-BCA-09112',
				note: 'DP pembayaran tinta ke supplier, sisa masuk hutang usaha',
				recordedBy: 'Admin Percetakan'
			}
		],
		subtotal: 2800000,
		discountAmount: 0,
		amount: 2800000,
		totalPaid: 1500000,
		remainingAmount: 1300000,
		paymentStatus: 'PARTIAL_PAID',
		status: 'APPROVED',
		recordedBy: 'Admin Percetakan',
		approvedBy: 'Owner (Bagus Yanuar)',
		approvedAt: '2026-11-23T11:45:00.000Z',
		referenceNumber: 'TRF-BCA-09112',
		notes: 'Sisa Rp 1.300.000 dicatat sebagai hutang usaha ke CV Warna Prima Ink',
		createdAt: '2026-11-23T11:30:00.000Z',
		updatedAt: '2026-11-23T11:45:00.000Z'
	},
	{
		id: 'exp-202611-017',
		code: 'EXP-202611-0017',
		expenseDate: '2026-11-22T09:10:00.000Z',
		group: 'production',
		items: [
			{
				id: 'exp-item-017-1',
				group: 'production',
				categoryId: 'exp-cat-002',
				categoryName: 'Pembelian Kertas A3+ & Plano',
				productCategoryName: 'Digital Printing A3+ Lembaran',
				description: 'Art Carton 260g (5 Rim)',
				amount: 2100000
			},
			{
				id: 'exp-item-017-2',
				group: 'production',
				categoryId: 'exp-cat-002',
				categoryName: 'Pembelian Kertas A3+ & Plano',
				productCategoryName: 'Digital Printing A3+ Lembaran',
				description: 'Sticker Chromo A3+ (3 Pack) & Vinyl Matte (2 Pack)',
				amount: 1400000
			}
		],
		vendorId: 'sup-002',
		vendorName: 'Toko Kertas Nusantara',
		accountName: 'Transfer',
		paymentLines: [{ accountName: 'Transfer', amount: 3450000 }],
		paymentHistory: [
			{
				id: 'exp-pay-017-1',
				paymentDate: '2026-11-22T09:10:00.000Z',
				accountName: 'Transfer',
				amount: 3450000,
				referenceNumber: 'INV-TKN-4410',
				note: 'Pelunasan pembelian kertas plano & stiker',
				recordedBy: 'Admin Percetakan'
			}
		],
		subtotal: 3500000,
		discountAmount: 50000,
		amount: 3450000,
		totalPaid: 3450000,
		remainingAmount: 0,
		paymentStatus: 'LUNAS',
		status: 'APPROVED',
		recordedBy: 'Admin Percetakan',
		approvedBy: 'Admin Percetakan',
		approvedAt: '2026-11-22T09:20:00.000Z',
		referenceNumber: 'INV-TKN-4410',
		createdAt: '2026-11-22T09:10:00.000Z',
		updatedAt: '2026-11-22T09:20:00.000Z'
	},
	{
		id: 'exp-202611-016',
		code: 'EXP-202611-0016',
		expenseDate: '2026-11-21T15:00:00.000Z',
		group: 'operational',
		items: [
			{
				id: 'exp-item-016-1',
				group: 'operational',
				categoryId: 'exp-cat-006',
				categoryName: 'Tagihan Listrik Daya 3-Phase Workshop',
				productCategoryName: null,
				description: 'Pembayaran tagihan listrik PLN 3-Phase workshop & AC ruang RIP',
				amount: 3850000
			}
		],
		vendorId: null,
		vendorName: 'PLN Pascabayar',
		accountName: 'Transfer',
		paymentLines: [{ accountName: 'Transfer', amount: 3850000 }],
		paymentHistory: [
			{
				id: 'exp-pay-016-1',
				paymentDate: '2026-11-21T15:00:00.000Z',
				accountName: 'Transfer',
				amount: 3850000,
				referenceNumber: 'PLN-202611-5521',
				note: 'Transfer virtual account PLN',
				recordedBy: 'Admin Percetakan'
			}
		],
		subtotal: 3850000,
		discountAmount: 0,
		amount: 3850000,
		totalPaid: 3850000,
		remainingAmount: 0,
		paymentStatus: 'LUNAS',
		status: 'APPROVED',
		recordedBy: 'Admin Percetakan',
		approvedBy: 'Owner (Bagus Yanuar)',
		approvedAt: '2026-11-21T15:05:00.000Z',
		referenceNumber: 'PLN-202611-5521',
		createdAt: '2026-11-21T15:00:00.000Z',
		updatedAt: '2026-11-21T15:05:00.000Z'
	},
	{
		id: 'exp-202611-015',
		code: 'EXP-202611-0015',
		expenseDate: '2026-11-20T13:40:00.000Z',
		group: 'production',
		items: [
			{
				id: 'exp-item-015-1',
				group: 'production',
				categoryId: 'exp-cat-004',
				categoryName: 'Bahan DTF & Bubuk Lem Kristal Powder',
				productCategoryName: 'Sablon Digital DTF & Sublimasi',
				description: 'PET Film DTF 60cm (2 Roll) + Hot Melt Powder Putih 5kg',
				amount: 1950000
			}
		],
		vendorId: null,
		vendorName: 'DTF Supply Indonesia',
		accountName: 'Tempo (Hutang Usaha)',
		paymentLines: [],
		paymentHistory: [],
		subtotal: 1950000,
		discountAmount: 0,
		amount: 1950000,
		totalPaid: 0,
		remainingAmount: 1950000,
		paymentStatus: 'UNPAID',
		status: 'APPROVED',
		recordedBy: 'Operator DTF',
		approvedBy: 'Admin Percetakan',
		approvedAt: '2026-11-20T13:45:00.000Z',
		referenceNumber: 'PO-DTF-229',
		notes: 'Pembelian tempo supplier DTF (masuk hutang usaha)',
		createdAt: '2026-11-20T13:40:00.000Z',
		updatedAt: '2026-11-20T13:45:00.000Z'
	},
	{
		id: 'exp-202611-014',
		code: 'EXP-202611-0014',
		expenseDate: '2026-11-19T10:00:00.000Z',
		group: 'production',
		items: [
			{
				id: 'exp-item-014-1',
				group: 'production',
				categoryId: 'exp-cat-005',
				categoryName: 'Bahan Display Indoor (Albatros, Luster, X-Banner)',
				productCategoryName: 'Large Format Indoor & Display',
				description: 'Rangka Standing X-Banner Aluminium 60x160 (20 Unit) & Roll Banner',
				amount: 2150000
			}
		],
		vendorId: null,
		vendorName: 'Display Pro Jakarta',
		accountName: 'Transfer',
		paymentLines: [{ accountName: 'Transfer', amount: 2150000 }],
		paymentHistory: [
			{
				id: 'exp-pay-014-1',
				paymentDate: '2026-11-19T10:00:00.000Z',
				accountName: 'Transfer',
				amount: 2150000,
				referenceNumber: 'DPJ-1190',
				note: 'Pelunasan PO Display Pro',
				recordedBy: 'Admin Percetakan'
			}
		],
		subtotal: 2150000,
		discountAmount: 0,
		amount: 2150000,
		totalPaid: 2150000,
		remainingAmount: 0,
		paymentStatus: 'LUNAS',
		status: 'APPROVED',
		recordedBy: 'Admin Percetakan',
		approvedBy: 'Owner (Bagus Yanuar)',
		approvedAt: '2026-11-19T10:30:00.000Z',
		referenceNumber: 'DPJ-1190',
		createdAt: '2026-11-19T10:00:00.000Z',
		updatedAt: '2026-11-19T10:30:00.000Z'
	},
	{
		id: 'exp-202611-013',
		code: 'EXP-202611-0013',
		expenseDate: '2026-11-18T17:10:00.000Z',
		group: 'operational',
		items: [
			{
				id: 'exp-item-013-1',
				group: 'operational',
				categoryId: 'exp-cat-008',
				categoryName: 'Perawatan Berkala Mesin Cetak & Sparepart',
				productCategoryName: null,
				description: 'Pembelian pisau plotter cutting Roland 45° (1 Box) & mat cutting',
				amount: 420000
			}
		],
		vendorId: null,
		vendorName: 'Toko Sparepart Plotter',
		accountName: 'Kas Kecil',
		paymentLines: [{ accountName: 'Kas Kecil', amount: 420000 }],
		paymentHistory: [
			{
				id: 'exp-pay-013-1',
				paymentDate: '2026-11-18T17:10:00.000Z',
				accountName: 'Kas Kecil',
				amount: 420000,
				referenceNumber: '-',
				note: 'Pembelian sparepart plotter',
				recordedBy: 'Operator Finishing'
			}
		],
		subtotal: 420000,
		discountAmount: 0,
		amount: 420000,
		totalPaid: 420000,
		remainingAmount: 0,
		paymentStatus: 'LUNAS',
		status: 'APPROVED',
		recordedBy: 'Operator Finishing',
		approvedBy: 'Admin Percetakan',
		approvedAt: '2026-11-18T17:30:00.000Z',
		referenceNumber: '-',
		createdAt: '2026-11-18T17:10:00.000Z',
		updatedAt: '2026-11-18T17:30:00.000Z'
	},
	{
		id: 'exp-202611-012',
		code: 'EXP-202611-0012',
		expenseDate: '2026-11-15T09:00:00.000Z',
		group: 'operational',
		items: [
			{
				id: 'exp-item-012-1',
				group: 'operational',
				categoryId: 'exp-cat-007',
				categoryName: 'Gaji & Uang Lembur Operator Produksi',
				productCategoryName: null,
				description: 'Uang makan & insentif shift tengah bulan tim operator cetak',
				amount: 1650000
			}
		],
		vendorId: null,
		accountName: 'Kas Besar',
		paymentLines: [{ accountName: 'Kas Besar', amount: 1650000 }],
		paymentHistory: [
			{
				id: 'exp-pay-012-1',
				paymentDate: '2026-11-15T09:00:00.000Z',
				accountName: 'Kas Besar',
				amount: 1650000,
				referenceNumber: '-',
				note: 'Pembagian insentif operator',
				recordedBy: 'Admin Percetakan'
			}
		],
		subtotal: 1650000,
		discountAmount: 0,
		amount: 1650000,
		totalPaid: 1650000,
		remainingAmount: 0,
		paymentStatus: 'LUNAS',
		status: 'APPROVED',
		recordedBy: 'Admin Percetakan',
		approvedBy: 'Owner (Bagus Yanuar)',
		approvedAt: '2026-11-15T09:15:00.000Z',
		referenceNumber: '-',
		createdAt: '2026-11-15T09:00:00.000Z',
		updatedAt: '2026-11-15T09:15:00.000Z'
	},
	{
		id: 'exp-202611-011',
		code: 'EXP-202611-0011',
		expenseDate: '2026-11-12T14:00:00.000Z',
		group: 'production',
		items: [
			{
				id: 'exp-item-011-1',
				group: 'production',
				categoryId: 'exp-cat-001',
				categoryName: 'Pembelian Bahan Baku Flexy & Spanduk',
				productCategoryName: 'Large Format Outdoor',
				description: 'Order darurat Mata Ayam 10mm (5 Pack) & Lem Banner',
				amount: 325000
			}
		],
		vendorId: null,
		vendorName: 'UD Jaya Finishing',
		accountName: 'Kas Kecil',
		paymentLines: [{ accountName: 'Kas Kecil', amount: 325000 }],
		paymentHistory: [],
		subtotal: 325000,
		discountAmount: 0,
		amount: 325000,
		totalPaid: 0,
		remainingAmount: 0,
		paymentStatus: 'CANCELLED',
		status: 'CANCELLED',
		recordedBy: 'Kasir 1',
		referenceNumber: '-',
		cancelReason: 'Duplikasi pencatatan dengan nota pembelian bahan finishing minggu lalu.',
		cancelledAt: '2026-11-12T15:10:00.000Z',
		createdAt: '2026-11-12T14:00:00.000Z',
		updatedAt: '2026-11-12T15:10:00.000Z'
	}
];

export class MockExpenseRepository implements ExpenseRepository {
	private items: Expense[] = JSON.parse(JSON.stringify(INITIAL_EXPENSES));

	async list(): Promise<Result<Expense[], AppError>> {
		await new Promise((resolve) => setTimeout(resolve, 180));
		const sorted = [...this.items].sort(
			(a, b) => new Date(b.expenseDate).getTime() - new Date(a.expenseDate).getTime()
		);
		return Result.ok(sorted);
	}

	async getById(id: string): Promise<Result<Expense, AppError>> {
		await new Promise((resolve) => setTimeout(resolve, 100));
		const found = this.items.find((item) => item.id === id);
		if (!found) {
			return Result.error(new NotFoundError(`Pengeluaran dengan ID "${id}" tidak ditemukan.`));
		}
		return Result.ok({ ...found });
	}

	async create(input: ExpenseInput): Promise<Result<Expense, AppError>> {
		await new Promise((resolve) => setTimeout(resolve, 220));
		if (input.items.length === 0) {
			return Result.error(new ValidationError('Minimal harus ada 1 item pengeluaran.'));
		}

		const mappedItems: ExpenseItem[] = input.items.map((item, idx) => ({
			id: `exp-item-${Date.now()}-${idx}`,
			group: item.group,
			categoryId: item.categoryId,
			categoryName: item.categoryName,
			productCategoryName: item.productCategoryName ?? null,
			description: item.description.trim(),
			amount: item.amount,
			notes: item.notes?.trim() || null
		}));

		const subtotal = mappedItems.reduce((sum, item) => sum + item.amount, 0);
		const discountAmount = Math.max(0, input.discountAmount ?? 0);
		if (discountAmount > subtotal) {
			return Result.error(
				new ValidationError('Potongan / diskon tidak boleh melebihi subtotal item.')
			);
		}

		const totalAmount = Math.max(0, subtotal - discountAmount);
		if (totalAmount <= 0) {
			return Result.error(new ValidationError('Total akhir nota harus lebih besar dari 0.'));
		}

		const paymentLines = input.paymentLines.filter((line) => line.amount > 0);
		const totalPaid = paymentLines.reduce((sum, line) => sum + line.amount, 0);
		if (totalPaid > totalAmount) {
			return Result.error(
				new ValidationError('Nominal pembayaran tidak boleh melebihi total akhir nota.')
			);
		}

		const now = new Date().toISOString();
		const seq = String(this.items.length + 11).padStart(4, '0');
		const status = input.status ?? 'APPROVED';
		const remainingAmount = Math.max(0, totalAmount - totalPaid);
		const paymentStatus = resolveExpensePaymentStatus(status, totalPaid, totalAmount);
		const referenceNumber = input.referenceNumber?.trim() || '-';

		const paymentHistory: ExpensePaymentRecord[] = paymentLines.map((line, idx) => ({
			id: `exp-pay-${Date.now()}-${idx}`,
			paymentDate: input.expenseDate || now,
			accountName: line.accountName,
			amount: line.amount,
			referenceNumber,
			note: remainingAmount > 0 ? 'Pembayaran awal / DP nota pengeluaran' : 'Pembayaran nota',
			recordedBy: 'Admin Percetakan'
		}));

		const newItem: Expense = {
			id: `exp-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
			code: `EXP-202611-${seq}`,
			expenseDate: input.expenseDate || now,
			group: resolveExpenseReceiptGroup(mappedItems),
			items: mappedItems,
			vendorId: input.vendorId ?? null,
			vendorName: input.vendorName?.trim() || null,
			accountName: formatExpenseAccountsSummary(paymentLines),
			paymentLines,
			paymentHistory,
			subtotal,
			discountAmount,
			amount: totalAmount,
			totalPaid,
			remainingAmount,
			paymentStatus,
			status,
			recordedBy: 'Admin Percetakan',
			approvedBy: status === 'APPROVED' ? 'Admin Percetakan' : null,
			approvedAt: status === 'APPROVED' ? now : null,
			referenceNumber,
			notes: input.notes?.trim() || null,
			createdAt: now,
			updatedAt: now
		};

		this.items = [newItem, ...this.items];
		return Result.ok({ ...newItem });
	}

	async settlePayment(
		id: string,
		input: ExpenseSettlePaymentInput
	): Promise<Result<Expense, AppError>> {
		await new Promise((resolve) => setTimeout(resolve, 200));
		const index = this.items.findIndex((item) => item.id === id);
		if (index === -1) {
			return Result.error(new NotFoundError('Data pengeluaran tidak ditemukan.'));
		}

		const target = this.items[index];
		if (target.status === 'CANCELLED') {
			return Result.error(
				new ValidationError('Pengeluaran yang sudah dibatalkan tidak dapat dilunasi.')
			);
		}
		if (input.amount <= 0) {
			return Result.error(new ValidationError('Nominal pelunasan harus lebih besar dari 0.'));
		}
		if (input.amount > target.remainingAmount) {
			return Result.error(
				new ValidationError('Nominal pelunasan tidak boleh melebihi sisa hutang usaha.')
			);
		}

		const now = new Date().toISOString();
		const newTotalPaid = target.totalPaid + input.amount;
		const newRemaining = Math.max(0, target.amount - newTotalPaid);
		const nextPaymentStatus = resolveExpensePaymentStatus(
			target.status,
			newTotalPaid,
			target.amount
		);

		const newRecord: ExpensePaymentRecord = {
			id: `exp-pay-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
			paymentDate: now,
			accountName: input.accountName,
			amount: input.amount,
			referenceNumber: input.referenceNumber?.trim() || '-',
			note: input.note?.trim() || 'Pelunasan hutang usaha pengeluaran',
			recordedBy: 'Admin Percetakan'
		};

		const existingLineIdx = target.paymentLines.findIndex(
			(line) => line.accountName === input.accountName
		);
		const updatedPaymentLines =
			existingLineIdx >= 0
				? target.paymentLines.map((line, i) =>
						i === existingLineIdx ? { ...line, amount: line.amount + input.amount } : line
					)
				: [...target.paymentLines, { accountName: input.accountName, amount: input.amount }];

		const updated: Expense = {
			...target,
			paymentLines: updatedPaymentLines,
			accountName: formatExpenseAccountsSummary(updatedPaymentLines),
			paymentHistory: [...target.paymentHistory, newRecord],
			totalPaid: newTotalPaid,
			remainingAmount: newRemaining,
			paymentStatus: nextPaymentStatus,
			updatedAt: now
		};

		this.items[index] = updated;
		return Result.ok({ ...updated });
	}

	async approve(id: string): Promise<Result<Expense, AppError>> {
		await new Promise((resolve) => setTimeout(resolve, 180));
		const index = this.items.findIndex((item) => item.id === id);
		if (index === -1) {
			return Result.error(new NotFoundError('Data pengeluaran tidak ditemukan.'));
		}
		const target = this.items[index];
		if (target.status === 'CANCELLED') {
			return Result.error(
				new ValidationError('Pengeluaran yang sudah dibatalkan tidak dapat disetujui.')
			);
		}
		const now = new Date().toISOString();
		const updated: Expense = {
			...target,
			status: 'APPROVED',
			approvedBy: 'Admin Percetakan',
			approvedAt: now,
			updatedAt: now
		};
		this.items[index] = updated;
		return Result.ok({ ...updated });
	}

	async cancel(id: string, reason: string): Promise<Result<Expense, AppError>> {
		await new Promise((resolve) => setTimeout(resolve, 180));
		const index = this.items.findIndex((item) => item.id === id);
		if (index === -1) {
			return Result.error(new NotFoundError('Data pengeluaran tidak ditemukan.'));
		}
		if (!reason.trim() || reason.trim().length < 3) {
			return Result.error(new ValidationError('Alasan pembatalan minimal 3 karakter.'));
		}
		const now = new Date().toISOString();
		const updated: Expense = {
			...this.items[index],
			status: 'CANCELLED',
			paymentStatus: 'CANCELLED',
			remainingAmount: 0,
			cancelReason: reason.trim(),
			cancelledAt: now,
			updatedAt: now
		};
		this.items[index] = updated;
		return Result.ok({ ...updated });
	}
}
