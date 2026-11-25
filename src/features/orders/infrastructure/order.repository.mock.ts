import { Result } from '$lib/shared/domain/types/result';
import { NotFoundError, ValidationError, type AppError } from '$lib/shared/domain/errors/app-error';
import type {
	Order,
	OrderFulfillmentStatus,
	OrderStats,
	OrderSettlePaymentInput,
	OrderPickupInput
} from '../domain/order.entity';
import type { OrderListParams, OrderRepository } from '../domain/order.repository';

export class MockOrderRepository implements OrderRepository {
	private orders: Order[] = [
		{
			id: 'ord-202611-001',
			invoiceNumber: 'INV/202611/0001',
			orderId: 'ord-prod-001',
			jobNumber: 'TKT/20261119/0001',
			orderType: 'PRODUCTION',
			status: 'LUNAS',
			fulfillmentStatus: 'PICKED_UP',
			pickedUpAt: '2026-11-20T14:30:00.000Z',
			pickedUpBy: 'Kasir 1',
			customerType: 'end_user',
			customerName: 'Budi Santoso',
			customerPhone: '081234567890',
			items: [
				{
					id: 'item-ord-001',
					productId: 'prod-001',
					productName: 'Spanduk Fleksi 280gr Outdoor',
					isProduction: true,
					uom: 'm2',
					dimensionText: '3.0 x 1.0 m (3.00 m²)',
					finishingText: 'Mata Ayam 4 Pojok',
					quantity: 2,
					pricePerUnit: 25000,
					subtotal: 150000
				}
			],
			subtotal: 150000,
			totalPaid: 150000,
			remainingAmount: 0,
			dueDate: null,
			paymentHistory: [
				{
					id: 'pay-001',
					paymentDate: '2026-11-19T09:30:00.000Z',
					method: 'QRIS',
					amount: 150000,
					referenceNumber: 'QRIS-992144',
					note: 'Pelunasan awal kasir',
					cashierName: 'Kasir Utama'
				}
			],
			notes: 'Cetak cepat selesai siang',
			issuedAt: '2026-11-19T09:30:00.000Z',
			updatedAt: '2026-11-19T09:30:00.000Z'
		},
		{
			id: 'ord-202611-002',
			invoiceNumber: 'INV/202611/0002',
			orderId: 'ord-prod-002',
			jobNumber: 'TKT/20261119/0002',
			orderType: 'PRODUCTION',
			status: 'PARTIAL_PAID',
			fulfillmentStatus: 'READY_FOR_PICKUP',
			rackLocation: 'Rak A-02',
			customerType: 'end_user',
			customerName: 'Siti Aminah',
			customerPhone: '081398765432',
			items: [
				{
					id: 'item-ord-002',
					productId: 'prod-002',
					productName: 'Brosur Art Paper 150gr A4 (Rim)',
					isProduction: true,
					uom: 'rim',
					dimensionText: '1 Rim (500 Lembar)',
					finishingText: 'Lipat 3 (Z-Fold)',
					quantity: 2,
					pricePerUnit: 175000,
					subtotal: 350000
				}
			],
			subtotal: 350000,
			totalPaid: 175000,
			remainingAmount: 175000,
			dueDate: '2026-11-25T17:00:00.000Z',
			paymentHistory: [
				{
					id: 'pay-002',
					paymentDate: '2026-11-20T10:15:00.000Z',
					method: 'CASH',
					amount: 175000,
					note: 'DP 50% di meja kasir',
					cashierName: 'Kasir 1'
				}
			],
			notes: 'Sisa Rp 175.000 dilunasi saat pengambilan brosur',
			issuedAt: '2026-11-20T10:15:00.000Z',
			updatedAt: '2026-11-20T10:15:00.000Z'
		},
		{
			id: 'ord-202611-003',
			invoiceNumber: 'INV/202611/0003',
			orderId: 'ord-prod-003',
			jobNumber: 'TKT/20261119/0003',
			orderType: 'PRODUCTION',
			status: 'UNPAID',
			fulfillmentStatus: 'PROCESSING',
			customerType: 'reseller',
			customerName: 'Percetakan Anugerah Jaya',
			customerPhone: '081911223344',
			resellerId: 'reseller-001',
			resellerName: 'Percetakan Anugerah Jaya',
			items: [
				{
					id: 'item-ord-003-1',
					productId: 'prod-003',
					productName: 'Stiker Vinyl Ritrama + Cutting Kiss-Cut',
					isProduction: true,
					uom: 'm2',
					dimensionText: '5.0 x 1.0 m (5.00 m²)',
					finishingText: 'Laminasi Doff Dingin',
					quantity: 5,
					pricePerUnit: 85000,
					subtotal: 425000
				},
				{
					id: 'item-ord-003-2',
					productId: 'prod-ret-001',
					productName: 'Standing Roll Up Banner 60x160',
					isProduction: false,
					uom: 'pcs',
					dimensionText: '1 pcs',
					finishingText: '-',
					quantity: 2,
					pricePerUnit: 150000,
					subtotal: 300000
				}
			],
			subtotal: 725000,
			totalPaid: 0,
			remainingAmount: 725000,
			dueDate: '2026-12-04T23:59:59.000Z',
			paymentHistory: [
				{
					id: 'pay-003',
					paymentDate: '2026-11-20T11:00:00.000Z',
					method: 'PIUTANG',
					amount: 0,
					note: 'Tempo 14 Hari (Plafon Terverifikasi)',
					cashierName: 'Kasir Utama'
				}
			],
			notes: 'Termin pembayaran 14 hari',
			issuedAt: '2026-11-20T11:00:00.000Z',
			updatedAt: '2026-11-20T11:00:00.000Z'
		},
		{
			id: 'ord-202611-004',
			invoiceNumber: 'INV/202611/0004',
			orderId: 'ord-prod-004',
			jobNumber: 'TKT/20261115/0010',
			orderType: 'PRODUCTION',
			status: 'UNPAID',
			fulfillmentStatus: 'READY_FOR_PICKUP',
			rackLocation: 'Rak B-01',
			customerType: 'reseller',
			customerName: 'CV Duta Grafika',
			customerPhone: '081755443322',
			resellerId: 'reseller-002',
			resellerName: 'CV Duta Grafika',
			items: [
				{
					id: 'item-ord-004',
					productId: 'prod-004',
					productName: 'Backlit Film Neonbox Duratrans',
					isProduction: true,
					uom: 'm2',
					dimensionText: '4.0 x 1.2 m (4.80 m²)',
					finishingText: 'Potong Pas Gambar',
					quantity: 2,
					pricePerUnit: 120000,
					subtotal: 576000
				}
			],
			subtotal: 576000,
			totalPaid: 0,
			remainingAmount: 576000,
			dueDate: '2026-11-18T23:59:59.000Z',
			paymentHistory: [],
			notes: 'Jatuh tempo terlampaui 5 hari, hubungi kontak PIC finance',
			issuedAt: '2026-11-04T14:20:00.000Z',
			updatedAt: '2026-11-19T08:00:00.000Z'
		},
		{
			id: 'ord-202611-005',
			invoiceNumber: 'INV/202611/0005',
			orderId: 'ord-ret-001',
			jobNumber: 'RTL/20261121/0001',
			orderType: 'RETAIL',
			status: 'LUNAS',
			fulfillmentStatus: 'PICKED_UP',
			pickedUpAt: '2026-11-21T15:45:00.000Z',
			pickedUpBy: 'Kasir 2',
			customerType: 'end_user',
			customerName: 'Pelanggan Walk-in',
			customerPhone: '-',
			items: [
				{
					id: 'item-ord-005-1',
					productId: 'prod-ret-002',
					productName: 'Kertas HVS A4 80gr Sinar Dunia',
					isProduction: false,
					uom: 'rim',
					dimensionText: '1 rim',
					finishingText: '-',
					quantity: 2,
					pricePerUnit: 55000,
					subtotal: 110000
				},
				{
					id: 'item-ord-005-2',
					productId: 'prod-ret-003',
					productName: 'Lakban Coklat Daimaru 2 Inch',
					isProduction: false,
					uom: 'roll',
					dimensionText: '1 roll',
					finishingText: '-',
					quantity: 1,
					pricePerUnit: 15000,
					subtotal: 15000
				}
			],
			subtotal: 125000,
			totalPaid: 125000,
			remainingAmount: 0,
			dueDate: null,
			paymentHistory: [
				{
					id: 'pay-005',
					paymentDate: '2026-11-21T15:45:00.000Z',
					method: 'CASH',
					amount: 125000,
					note: 'Cash & Carry di meja kasir',
					cashierName: 'Kasir 2'
				}
			],
			notes: 'Nota ritel murni selesai di kasir',
			issuedAt: '2026-11-21T15:45:00.000Z',
			updatedAt: '2026-11-21T15:45:00.000Z'
		},
		{
			id: 'ord-202611-006',
			invoiceNumber: 'INV/202611/0006',
			orderId: 'ord-prod-006',
			jobNumber: 'TKT/20261123/0001',
			orderType: 'PRODUCTION',
			status: 'LUNAS',
			fulfillmentStatus: 'PROCESSING',
			customerType: 'end_user',
			customerName: 'Hendra Wijaya',
			customerPhone: '081288990011',
			items: [
				{
					id: 'item-ord-006',
					productId: 'prod-001',
					productName: 'Banner Spanduk Flexy 340gr Higain',
					isProduction: true,
					uom: 'm2',
					dimensionText: '6.0 x 1.5 m (9.00 m²)',
					finishingText: 'Mata Ayam Keliling & Seaming',
					quantity: 2,
					pricePerUnit: 35000,
					subtotal: 630000
				}
			],
			subtotal: 630000,
			totalPaid: 630000,
			remainingAmount: 0,
			dueDate: null,
			paymentHistory: [
				{
					id: 'pay-006',
					paymentDate: '2026-11-23T08:30:00.000Z',
					method: 'TRANSFER',
					amount: 630000,
					referenceNumber: 'BCA-771822',
					note: 'Lunas di awal via transfer BCA',
					cashierName: 'Kasir 1'
				}
			],
			notes: 'Lunas di awal, sedang proses finishing mata ayam di workshop',
			issuedAt: '2026-11-23T08:30:00.000Z',
			updatedAt: '2026-11-23T08:30:00.000Z'
		},
		{
			id: 'ord-202611-007',
			invoiceNumber: 'INV/202611/0007',
			orderId: 'ord-ret-007',
			jobNumber: 'RTL/20261123/0002',
			orderType: 'RETAIL',
			status: 'LUNAS',
			fulfillmentStatus: 'PICKED_UP',
			pickedUpAt: '2026-11-23T09:15:00.000Z',
			pickedUpBy: 'Kasir Utama',
			customerType: 'end_user',
			customerName: 'Toko Buku Maju',
			customerPhone: '085712345678',
			items: [
				{
					id: 'item-ord-007',
					productId: 'prod-ret-001',
					productName: 'Standing Roll Up Banner 60x160 Kosongan',
					isProduction: false,
					uom: 'pcs',
					dimensionText: '1 set lengkap tas',
					finishingText: '-',
					quantity: 1,
					pricePerUnit: 165000,
					subtotal: 165000
				}
			],
			subtotal: 165000,
			totalPaid: 165000,
			remainingAmount: 0,
			dueDate: null,
			paymentHistory: [
				{
					id: 'pay-007',
					paymentDate: '2026-11-23T09:15:00.000Z',
					method: 'QRIS',
					amount: 165000,
					referenceNumber: 'QRIS-552199',
					note: 'Lunas QRIS',
					cashierName: 'Kasir Utama'
				}
			],
			notes: 'Nota ritel murni selesai di kasir',
			issuedAt: '2026-11-23T09:15:00.000Z',
			updatedAt: '2026-11-23T09:15:00.000Z'
		},
		{
			id: 'ord-202611-008',
			invoiceNumber: 'INV/202611/0008',
			orderId: 'ord-prod-008',
			jobNumber: 'TKT/20261123/0003',
			orderType: 'PRODUCTION',
			status: 'UNPAID',
			fulfillmentStatus: 'QUEUED',
			customerType: 'end_user',
			customerName: 'Koperasi Mandiri Sejahtera',
			customerPhone: '081233445566',
			items: [
				{
					id: 'item-ord-008',
					productId: 'prod-002',
					productName: 'Buku Agenda Custom Hardcover Spiral A5',
					isProduction: true,
					uom: 'pcs',
					dimensionText: '50 Pcs (Isi 100 Hal Bookpaper)',
					finishingText: 'Jilid Spiral Kawat + Foil Emas Cover',
					quantity: 50,
					pricePerUnit: 35000,
					subtotal: 1750000
				}
			],
			subtotal: 1750000,
			totalPaid: 0,
			remainingAmount: 1750000,
			dueDate: '2026-11-28T17:00:00.000Z',
			paymentHistory: [],
			notes: 'Waiting list antrean pra-cetak dan plat cetak',
			issuedAt: '2026-11-23T11:00:00.000Z',
			updatedAt: '2026-11-23T11:00:00.000Z'
		},
		{
			id: 'ord-202611-009',
			invoiceNumber: 'INV/202611/0009',
			orderId: 'ord-prod-009',
			jobNumber: 'TKT/20261118/0005',
			orderType: 'PRODUCTION',
			status: 'CANCELLED',
			fulfillmentStatus: 'QUEUED',
			customerType: 'end_user',
			customerName: 'Ahmad Fauzi',
			customerPhone: '085699887766',
			items: [
				{
					id: 'item-ord-009',
					productId: 'prod-001',
					productName: 'Spanduk Banner Pecel Lele 280gr',
					isProduction: true,
					uom: 'm2',
					dimensionText: '3.0 x 1.0 m (3.00 m²)',
					finishingText: 'Mata Ayam 4 Pojok',
					quantity: 1,
					pricePerUnit: 25000,
					subtotal: 75000
				}
			],
			subtotal: 75000,
			totalPaid: 0,
			remainingAmount: 75000,
			dueDate: null,
			paymentHistory: [],
			notes: 'Dibatalkan sebelum masuk antrean mesin cetak',
			cancelReason: 'Permintaan pelanggan (salah ukuran materi desain banner)',
			cancelledAt: '2026-11-18T16:00:00.000Z',
			issuedAt: '2026-11-18T15:20:00.000Z',
			updatedAt: '2026-11-18T16:00:00.000Z'
		},
		{
			id: 'ord-202611-010',
			invoiceNumber: 'INV/202611/0010',
			orderId: 'ord-prod-010',
			jobNumber: 'TKT/20261124/0001',
			orderType: 'PRODUCTION',
			status: 'PARTIAL_PAID',
			fulfillmentStatus: 'CREATED',
			customerType: 'end_user',
			customerName: 'CV Cahaya Abadi',
			customerPhone: '081399881122',
			items: [
				{
					id: 'item-ord-010',
					productId: 'prod-004',
					productName: 'Stiker Vinyl Glossy Meteran',
					isProduction: true,
					uom: 'm2',
					dimensionText: '2.0 x 1.0 m (2.00 m²)',
					finishingText: 'Kiss Cut',
					quantity: 3,
					pricePerUnit: 85000,
					subtotal: 510000
				}
			],
			subtotal: 510000,
			totalPaid: 255000,
			remainingAmount: 255000,
			dueDate: '2026-11-26T17:00:00.000Z',
			paymentHistory: [
				{
					id: 'pay-010',
					paymentDate: '2026-11-24T10:00:00.000Z',
					method: 'TRANSFER',
					amount: 255000,
					referenceNumber: 'TRF-BCA-98112',
					note: 'DP 50%',
					cashierName: 'Kasir Utama'
				}
			],
			notes: 'Nota baru dibuat, belum dikirim ke antrean produksi',
			issuedAt: '2026-11-24T10:00:00.000Z',
			updatedAt: '2026-11-24T10:00:00.000Z'
		},
		{
			id: 'ord-202611-011',
			invoiceNumber: 'INV/202611/0011',
			orderId: 'ord-prod-011',
			jobNumber: 'TKT/20261117/0002',
			orderType: 'PRODUCTION',
			status: 'REFUND',
			fulfillmentStatus: 'QUEUED',
			customerType: 'end_user',
			customerName: 'Hendro Wijaya',
			customerPhone: '081288990011',
			items: [
				{
					id: 'item-ord-011',
					productId: 'prod-002',
					productName: 'Brosur Art Paper 150gr A4 (Rim)',
					isProduction: true,
					uom: 'rim',
					dimensionText: '1 Rim (500 Lembar)',
					finishingText: 'Lipat 3 (Z-Fold)',
					quantity: 1,
					pricePerUnit: 175000,
					subtotal: 175000
				}
			],
			subtotal: 175000,
			totalPaid: 0,
			remainingAmount: 0,
			dueDate: null,
			paymentHistory: [
				{
					id: 'pay-011',
					paymentDate: '2026-11-17T11:00:00.000Z',
					method: 'TRANSFER',
					amount: 175000,
					referenceNumber: 'TRF-BCA-REFUND',
					note: 'Dana dikembalikan penuh ke pelanggan (salah cetak)',
					cashierName: 'Kasir Utama'
				}
			],
			notes: 'Pesanan di-refund karena cacat cetak bahan art paper',
			cancelReason: 'Cacat cetak bahan art paper, dana dikembalikan penuh',
			cancelledAt: '2026-11-17T14:30:00.000Z',
			issuedAt: '2026-11-17T10:00:00.000Z',
			updatedAt: '2026-11-17T14:30:00.000Z'
		},
		{
			id: 'ord-202611-012',
			invoiceNumber: 'INV/202611/0012',
			orderId: 'ord-prod-012',
			jobNumber: 'TKT/20261119/0004',
			orderType: 'PRODUCTION',
			status: 'UNPAID',
			fulfillmentStatus: 'PICKED_UP',
			pickedUpAt: '2026-11-19T16:20:00.000Z',
			pickedUpBy: 'Kasir 1',
			customerType: 'reseller',
			customerName: 'CV Kreasi Media Print',
			customerPhone: '081277665544',
			resellerId: 'reseller-003',
			resellerName: 'CV Kreasi Media Print',
			items: [
				{
					id: 'item-ord-012',
					productId: 'prod-002',
					productName: 'Kartu Nama Art Carton 260gr (2 Sisi)',
					isProduction: true,
					uom: 'box',
					dimensionText: '9.0 x 5.5 cm (Isi 100 Lembar/Box)',
					finishingText: 'Laminasi Doff 2 Sisi',
					quantity: 10,
					pricePerUnit: 45000,
					subtotal: 450000
				}
			],
			subtotal: 450000,
			totalPaid: 0,
			remainingAmount: 450000,
			dueDate: '2026-12-03T23:59:59.000Z',
			paymentHistory: [
				{
					id: 'pay-012',
					paymentDate: '2026-11-19T16:20:00.000Z',
					method: 'PIUTANG',
					amount: 0,
					note: 'Diambil lebih dulu, tempo piutang 14 hari',
					cashierName: 'Kasir 1'
				}
			],
			notes: 'Pesanan sudah diambil pelanggan dengan skema piutang (Belum DiBayar)',
			issuedAt: '2026-11-19T08:00:00.000Z',
			updatedAt: '2026-11-19T16:20:00.000Z'
		}
	];

	async getOrders(params?: OrderListParams): Promise<Result<Order[], AppError>> {
		let list = [...this.orders];

		if (params?.status && params.status !== 'ALL') {
			if (params.status === 'UNSETTLED') {
				list = list.filter(
					(o) => o.status === 'PARTIAL_PAID' || o.status === 'UNPAID' || o.status === 'OVERDUE'
				);
			} else {
				list = list.filter((o) => o.status === params.status);
			}
		}

		if (params?.fulfillmentStatus && params.fulfillmentStatus !== 'ALL') {
			list = list.filter((o) => o.fulfillmentStatus === params.fulfillmentStatus);
		}

		if (params?.orderType && params.orderType !== 'ALL') {
			list = list.filter((o) => o.orderType === params.orderType);
		}

		if (params?.customerType && params.customerType !== 'ALL') {
			list = list.filter((o) => o.customerType === params.customerType);
		}

		if (params?.search && params.search.trim()) {
			const q = params.search.toLowerCase().trim();
			list = list.filter(
				(o) =>
					o.invoiceNumber.toLowerCase().includes(q) ||
					o.jobNumber.toLowerCase().includes(q) ||
					o.customerName.toLowerCase().includes(q) ||
					(o.resellerName && o.resellerName.toLowerCase().includes(q))
			);
		}

		// Sort latest issued first
		list.sort((a, b) => new Date(b.issuedAt).getTime() - new Date(a.issuedAt).getTime());

		return Result.ok(JSON.parse(JSON.stringify(list)));
	}

	async getOrderById(id: string): Promise<Result<Order, AppError>> {
		const found = this.orders.find((o) => o.id === id);
		if (!found) {
			return Result.error(new NotFoundError(`Pesanan "${id}" tidak ditemukan.`));
		}
		return Result.ok(JSON.parse(JSON.stringify(found)));
	}

	async getOrderStats(): Promise<Result<OrderStats, AppError>> {
		const activeOrders = this.orders.filter((o) => o.status !== 'CANCELLED');
		const totalInvoiced = activeOrders.reduce((sum, o) => sum + o.subtotal, 0);
		const totalPaid = activeOrders.reduce((sum, o) => sum + o.totalPaid, 0);
		const totalRemaining = activeOrders.reduce((sum, o) => sum + o.remainingAmount, 0);
		const overdueCount = activeOrders.filter((o) => o.status === 'OVERDUE').length;
		const partialCount = activeOrders.filter((o) => o.status === 'PARTIAL_PAID').length;
		const paidCount = activeOrders.filter((o) => o.status === 'LUNAS').length;

		return Result.ok({
			totalInvoiced,
			totalPaid,
			totalRemaining,
			overdueCount,
			partialCount,
			paidCount
		});
	}

	async settlePayment(
		orderId: string,
		input: OrderSettlePaymentInput
	): Promise<Result<Order, AppError>> {
		const order = this.orders.find((o) => o.id === orderId);
		if (!order) {
			return Result.error(new NotFoundError(`Pesanan "${orderId}" tidak ditemukan.`));
		}

		if (order.status === 'LUNAS') {
			return Result.error(new ValidationError('Pesanan ini sudah lunas sepenuhnya.'));
		}

		if (order.status === 'CANCELLED') {
			return Result.error(new ValidationError('Pesanan yang dibatalkan tidak dapat dilunasi.'));
		}

		const payAmount = Math.min(input.amount, order.remainingAmount);
		order.totalPaid += payAmount;
		order.remainingAmount = Math.max(0, order.subtotal - order.totalPaid);

		if (order.remainingAmount === 0) {
			order.status = 'LUNAS';
		} else {
			order.status = 'PARTIAL_PAID';
		}

		order.paymentHistory.push({
			id: `pay-${Date.now()}`,
			paymentDate: new Date().toISOString(),
			method: input.method,
			amount: payAmount,
			referenceNumber: input.referenceNumber,
			note: input.note || 'Pelunasan pesanan kasir',
			cashierName: 'Kasir Utama'
		});

		order.updatedAt = new Date().toISOString();

		return Result.ok(JSON.parse(JSON.stringify(order)));
	}

	async updateFulfillmentStatus(
		orderId: string,
		status: OrderFulfillmentStatus
	): Promise<Result<Order, AppError>> {
		const order = this.orders.find((o) => o.id === orderId);
		if (!order) {
			return Result.error(new NotFoundError(`Pesanan "${orderId}" tidak ditemukan.`));
		}

		if (order.status === 'CANCELLED') {
			return Result.error(
				new ValidationError('Pesanan yang dibatalkan tidak dapat diubah statusnya.')
			);
		}

		order.fulfillmentStatus = status;
		if (status === 'PICKED_UP' && !order.pickedUpAt) {
			order.pickedUpAt = new Date().toISOString();
			order.pickedUpBy = 'Kasir Utama';
		}
		order.updatedAt = new Date().toISOString();

		return Result.ok(JSON.parse(JSON.stringify(order)));
	}

	async markAsPickedUp(
		orderId: string,
		input?: OrderPickupInput
	): Promise<Result<Order, AppError>> {
		const order = this.orders.find((o) => o.id === orderId);
		if (!order) {
			return Result.error(new NotFoundError(`Pesanan "${orderId}" tidak ditemukan.`));
		}

		if (order.status === 'CANCELLED') {
			return Result.error(new ValidationError('Pesanan yang dibatalkan tidak dapat diserahkan.'));
		}

		if (input?.settlePayment && order.remainingAmount > 0) {
			const settleRes = await this.settlePayment(orderId, input.settlePayment);
			if (!settleRes.success) {
				return settleRes;
			}
		}

		order.fulfillmentStatus = 'PICKED_UP';
		order.pickedUpAt = new Date().toISOString();
		order.pickedUpBy = input?.pickedUpBy || 'Kasir Utama';
		order.updatedAt = new Date().toISOString();

		return Result.ok(JSON.parse(JSON.stringify(order)));
	}

	async cancelOrder(orderId: string, reason: string): Promise<Result<Order, AppError>> {
		const order = this.orders.find((o) => o.id === orderId);
		if (!order) {
			return Result.error(new NotFoundError(`Pesanan "${orderId}" tidak ditemukan.`));
		}

		order.status = 'CANCELLED';
		order.cancelReason = reason;
		order.cancelledAt = new Date().toISOString();
		order.updatedAt = new Date().toISOString();

		return Result.ok(JSON.parse(JSON.stringify(order)));
	}
}
