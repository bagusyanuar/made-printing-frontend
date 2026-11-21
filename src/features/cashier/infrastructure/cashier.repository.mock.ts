import type { Result } from '$lib/shared/domain/types/result';
import type { AppError } from '$lib/shared/domain/errors/app-error';
import { Result as ResultClass } from '$lib/shared/domain/types/result';
import { NotFoundError, ValidationError } from '$lib/shared/domain/errors/app-error';
import type {
	CashierOrder,
	CashierOrderItem,
	CashierRetailCatalogItem,
	CashierProcessPaymentInput,
	CashierCreateRetailOrderInput,
	CashierSplitPaymentDetail
} from '../domain/cashier.entity';
import { calculateCashierItemSubtotal, calculateCashierSubtotal } from '../domain/cashier.entity';
import type { CashierListParams, CashierRepository } from '../domain/cashier.repository';

const INITIAL_RETAIL_CATALOG: CashierRetailCatalogItem[] = [
	{
		id: 'ret-cat-01',
		name: 'Air Mineral Le Minerale 600ml',
		categoryName: 'Minuman Dingin',
		price: 4000,
		uom: 'pcs',
		stock: 48,
		isProduction: false
	},
	{
		id: 'ret-cat-02',
		name: 'Kopi Good Day Botol 250ml',
		categoryName: 'Minuman Dingin',
		price: 7000,
		uom: 'pcs',
		stock: 24,
		isProduction: false
	},
	{
		id: 'ret-cat-03',
		name: 'Roll-Up Banner Stand Alumunium 60x160cm',
		categoryName: 'Display Hardware',
		price: 85000,
		uom: 'pcs',
		stock: 15,
		isProduction: false
	},
	{
		id: 'ret-cat-04',
		name: 'X-Banner Stand Fiber Hitam 60x160cm',
		categoryName: 'Display Hardware',
		price: 35000,
		uom: 'pcs',
		stock: 30,
		isProduction: false
	},
	{
		id: 'ret-cat-05',
		name: 'Pigura Frame Minimalis A3 Kayu Hitam',
		categoryName: 'Pigura & Frame',
		price: 45000,
		uom: 'pcs',
		stock: 20,
		isProduction: false
	},
	{
		id: 'ret-cat-06',
		name: 'Double Tape Foam 3M Hijau Tebal',
		categoryName: 'Aksesoris & ATK',
		price: 15000,
		uom: 'pcs',
		stock: 50,
		isProduction: false
	},
	{
		id: 'ret-cat-07',
		name: 'Paper Bag Polos Kraft Coklat L',
		categoryName: 'Packaging',
		price: 5000,
		uom: 'pcs',
		stock: 100,
		isProduction: false
	}
];

const INITIAL_ORDERS: CashierOrder[] = [
	{
		id: 'ord-prod-001',
		jobNumber: 'JOB/20261119/0001',
		invoiceNumber: null,
		orderType: 'PRODUCTION',
		status: 'PENDING_PAYMENT',
		customerType: 'end_user',
		customerName: 'budi',
		customerPhone: '-',
		resellerId: null,
		resellerName: null,
		designerId: 'usr-admin',
		designerName: 'administrator',
		items: [
			{
				id: 'ord-item-01',
				productId: 'prod-ap120',
				productName: 'AP120 (2 Sisi)',
				variantName: '2 Sisi Full Color',
				isProduction: true,
				uom: 'pcs',
				lengthM: null,
				widthM: null,
				dimensionText: 'Pcs',
				finishingText: 'deskripsi',
				quantity: 1,
				pricePerUnit: 6000,
				subtotal: 6000
			},
			{
				id: 'ord-item-02',
				productId: 'prod-mmt280',
				productName: 'MMT 280 GR (SPGK)',
				variantName: 'Outdoor Standard',
				isProduction: true,
				uom: 'm2',
				lengthM: 2,
				widthM: 1,
				dimensionText: '2 x 1 m (m²)',
				finishingText: '-',
				quantity: 2,
				pricePerUnit: 17000,
				subtotal: 68000
			}
		],
		subtotal: 74000,
		totalPaid: 0,
		remainingAmount: 74000,
		changeAmount: 0,
		createdAt: '2026-11-19 12:00:18',
		updatedAt: '2026-11-19 12:00:18'
	},
	{
		id: 'ord-prod-002',
		jobNumber: 'JOB/20261119/0002',
		invoiceNumber: null,
		orderType: 'PRODUCTION',
		status: 'PENDING_PAYMENT',
		customerType: 'reseller',
		customerName: 'CV Berkah Mandiri',
		customerPhone: '081298765432',
		resellerId: 'res-01',
		resellerName: 'CV Berkah Mandiri',
		designerId: 'des-01',
		designerName: 'Bagus (Meja 1)',
		items: [
			{
				id: 'ord-item-03',
				productId: 'prod-flexy340',
				productName: 'Banner Flexy Outdoor 340g',
				variantName: 'Standar Outdoor',
				isProduction: true,
				uom: 'm2',
				lengthM: 3,
				widthM: 1,
				dimensionText: '3 x 1 m (3.00 m²)',
				finishingText: 'Mata ayam 4 sudut',
				quantity: 2,
				pricePerUnit: 25000,
				subtotal: 150000
			}
		],
		subtotal: 150000,
		totalPaid: 0,
		remainingAmount: 150000,
		changeAmount: 0,
		createdAt: '2026-11-19 13:45:00',
		updatedAt: '2026-11-19 13:45:00'
	},
	{
		id: 'ord-ret-001',
		jobNumber: 'RTL/20261119/0001',
		invoiceNumber: null,
		orderType: 'RETAIL',
		status: 'PENDING_PAYMENT',
		customerType: 'end_user',
		customerName: 'Pak Joko (Walk-in)',
		customerPhone: '085712349999',
		resellerId: null,
		resellerName: null,
		designerId: null,
		designerName: null,
		items: [
			{
				id: 'ord-item-04',
				productId: 'ret-cat-03',
				productName: 'Roll-Up Banner Stand Alumunium 60x160cm',
				isProduction: false,
				uom: 'pcs',
				dimensionText: '1 Pcs',
				finishingText: 'Ready Stock',
				quantity: 1,
				pricePerUnit: 85000,
				subtotal: 85000
			},
			{
				id: 'ord-item-05',
				productId: 'ret-cat-01',
				productName: 'Air Mineral Le Minerale 600ml',
				isProduction: false,
				uom: 'pcs',
				dimensionText: '2 Botol',
				finishingText: 'Dingin',
				quantity: 2,
				pricePerUnit: 4000,
				subtotal: 8000
			}
		],
		subtotal: 93000,
		totalPaid: 0,
		remainingAmount: 93000,
		changeAmount: 0,
		createdAt: '2026-11-19 14:10:00',
		updatedAt: '2026-11-19 14:10:00'
	}
];

export class MockCashierRepository implements CashierRepository {
	private orders: CashierOrder[] = JSON.parse(JSON.stringify(INITIAL_ORDERS));
	private retailCatalog: CashierRetailCatalogItem[] = JSON.parse(
		JSON.stringify(INITIAL_RETAIL_CATALOG)
	);

	async getCashierOrders(params?: CashierListParams): Promise<Result<CashierOrder[], AppError>> {
		let list = [...this.orders];

		if (params?.type) {
			list = list.filter((o) => o.orderType === params.type);
		}

		if (params?.status) {
			list = list.filter((o) => o.status === params.status);
		}

		if (params?.search) {
			const q = params.search.toLowerCase();
			list = list.filter(
				(o) =>
					o.jobNumber.toLowerCase().includes(q) ||
					o.customerName.toLowerCase().includes(q) ||
					(o.designerName && o.designerName.toLowerCase().includes(q))
			);
		}

		return ResultClass.ok(list);
	}

	async getCashierOrderById(id: string): Promise<Result<CashierOrder, AppError>> {
		const order = this.orders.find((o) => o.id === id);
		if (!order) {
			return ResultClass.error(new NotFoundError(`Pesanan dengan ID ${id} tidak ditemukan`));
		}
		return ResultClass.ok(JSON.parse(JSON.stringify(order)));
	}

	async getRetailCatalog(): Promise<Result<CashierRetailCatalogItem[], AppError>> {
		return ResultClass.ok(JSON.parse(JSON.stringify(this.retailCatalog)));
	}

	async updateItemPrice(
		orderId: string,
		itemId: string,
		newPrice: number
	): Promise<Result<CashierOrder, AppError>> {
		const order = this.orders.find((o) => o.id === orderId);
		if (!order) {
			return ResultClass.error(new NotFoundError(`Pesanan tidak ditemukan`));
		}

		const item = order.items.find((i) => i.id === itemId);
		if (!item) {
			return ResultClass.error(new NotFoundError(`Item tidak ditemukan`));
		}

		item.pricePerUnit = newPrice;
		item.subtotal = calculateCashierItemSubtotal(
			newPrice,
			item.quantity,
			item.uom,
			item.lengthM,
			item.widthM
		);

		order.subtotal = calculateCashierSubtotal(order.items);
		order.remainingAmount = Math.max(0, order.subtotal - order.totalPaid);
		order.updatedAt = new Date().toISOString();

		return ResultClass.ok(JSON.parse(JSON.stringify(order)));
	}

	async addRetailItem(
		orderId: string,
		itemInput: {
			catalogItemId?: string;
			name: string;
			price: number;
			quantity: number;
			uom: string;
		}
	): Promise<Result<CashierOrder, AppError>> {
		const order = this.orders.find((o) => o.id === orderId);
		if (!order) {
			return ResultClass.error(new NotFoundError(`Pesanan tidak ditemukan`));
		}

		const newItem: CashierOrderItem = {
			id: `ret-item-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
			productId: itemInput.catalogItemId,
			productName: itemInput.name,
			isProduction: false,
			uom: itemInput.uom,
			dimensionText: `${itemInput.quantity} ${itemInput.uom}`,
			finishingText: '-',
			quantity: itemInput.quantity,
			pricePerUnit: itemInput.price,
			subtotal: itemInput.price * itemInput.quantity
		};

		order.items.push(newItem);
		order.subtotal = calculateCashierSubtotal(order.items);
		order.remainingAmount = Math.max(0, order.subtotal - order.totalPaid);
		order.updatedAt = new Date().toISOString();

		return ResultClass.ok(JSON.parse(JSON.stringify(order)));
	}

	async removeItem(orderId: string, itemId: string): Promise<Result<CashierOrder, AppError>> {
		const order = this.orders.find((o) => o.id === orderId);
		if (!order) {
			return ResultClass.error(new NotFoundError(`Pesanan tidak ditemukan`));
		}

		order.items = order.items.filter((i) => i.id !== itemId);
		order.subtotal = calculateCashierSubtotal(order.items);
		order.remainingAmount = Math.max(0, order.subtotal - order.totalPaid);
		order.updatedAt = new Date().toISOString();

		return ResultClass.ok(JSON.parse(JSON.stringify(order)));
	}

	async splitItemToNewRetailOrder(
		orderId: string,
		itemId: string
	): Promise<Result<{ sourceOrder: CashierOrder; newRetailOrder: CashierOrder }, AppError>> {
		const order = this.orders.find((o) => o.id === orderId);
		if (!order) {
			return ResultClass.error(new NotFoundError(`Pesanan tidak ditemukan`));
		}

		const itemIndex = order.items.findIndex((i) => i.id === itemId);
		if (itemIndex === -1) {
			return ResultClass.error(new NotFoundError(`Item tidak ditemukan`));
		}

		const [removedItem] = order.items.splice(itemIndex, 1);
		order.subtotal = calculateCashierSubtotal(order.items);
		order.remainingAmount = Math.max(0, order.subtotal - order.totalPaid);
		order.updatedAt = new Date().toISOString();

		const seq = this.orders.filter((o) => o.orderType === 'RETAIL').length + 1;
		const newRetailOrder: CashierOrder = {
			id: `ord-ret-${Date.now()}`,
			jobNumber: `RTL/20261119/${String(seq).padStart(4, '0')}`,
			invoiceNumber: null,
			orderType: 'RETAIL',
			status: 'PENDING_PAYMENT',
			customerType: order.customerType,
			customerName: order.customerName,
			customerPhone: order.customerPhone,
			items: [removedItem],
			subtotal: removedItem.subtotal,
			totalPaid: 0,
			remainingAmount: removedItem.subtotal,
			changeAmount: 0,
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString()
		};

		this.orders.unshift(newRetailOrder);

		return ResultClass.ok({
			sourceOrder: JSON.parse(JSON.stringify(order)),
			newRetailOrder: JSON.parse(JSON.stringify(newRetailOrder))
		});
	}

	async splitRetailItemsBatch(
		orderId: string,
		itemIds?: string[]
	): Promise<Result<{ sourceOrder: CashierOrder; newRetailOrder: CashierOrder }, AppError>> {
		const order = this.orders.find((o) => o.id === orderId);
		if (!order) {
			return ResultClass.error(new NotFoundError(`Pesanan tidak ditemukan`));
		}

		const itemsToSplit = order.items.filter((item) => {
			if (item.isProduction) return false;
			if (itemIds && itemIds.length > 0) {
				return itemIds.includes(item.id);
			}
			return true;
		});

		if (itemsToSplit.length === 0) {
			return ResultClass.error(new ValidationError(`Tidak ada item ritel untuk dipisahkan`));
		}

		// Remove selected retail items from source order
		const splitItemIds = new Set(itemsToSplit.map((i) => i.id));
		order.items = order.items.filter((item) => !splitItemIds.has(item.id));
		order.subtotal = calculateCashierSubtotal(order.items);
		order.remainingAmount = Math.max(0, order.subtotal - order.totalPaid);
		order.updatedAt = new Date().toISOString();

		const seq = this.orders.filter((o) => o.orderType === 'RETAIL').length + 1;
		const totalRetailSubtotal = calculateCashierSubtotal(itemsToSplit);

		const newRetailOrder: CashierOrder = {
			id: `ord-ret-${Date.now()}`,
			jobNumber: `RTL/20261119/${String(seq).padStart(4, '0')}`,
			invoiceNumber: null,
			orderType: 'RETAIL',
			status: 'PENDING_PAYMENT',
			customerType: order.customerType,
			customerName: order.customerName,
			customerPhone: order.customerPhone,
			items: itemsToSplit,
			subtotal: totalRetailSubtotal,
			totalPaid: 0,
			remainingAmount: totalRetailSubtotal,
			changeAmount: 0,
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString()
		};

		this.orders.unshift(newRetailOrder);

		return ResultClass.ok({
			sourceOrder: JSON.parse(JSON.stringify(order)),
			newRetailOrder: JSON.parse(JSON.stringify(newRetailOrder))
		});
	}

	async processPayment(
		orderId: string,
		input: CashierProcessPaymentInput
	): Promise<Result<CashierOrder, AppError>> {
		const order = this.orders.find((o) => o.id === orderId);
		if (!order) {
			return ResultClass.error(new NotFoundError(`Pesanan tidak ditemukan`));
		}

		let paidAmount: number;
		if (input.isSplit && input.splitAmounts) {
			order.paymentMethod = 'SPLIT';
			const details: CashierSplitPaymentDetail[] = [
				{ method: 'CASH', amount: input.splitAmounts.cash },
				{ method: 'TRANSFER', amount: input.splitAmounts.transfer },
				{ method: 'QRIS', amount: input.splitAmounts.qris }
			];
			order.paymentDetails = details.filter((d) => d.amount > 0);
			paidAmount =
				input.splitAmounts.cash + input.splitAmounts.transfer + input.splitAmounts.qris;
		} else {
			order.paymentMethod = input.method || 'CASH';
			paidAmount = input.singleAmount !== undefined ? input.singleAmount : order.subtotal;
			order.paymentDetails = [{ method: input.method || 'CASH', amount: paidAmount }];
		}

		order.totalPaid = paidAmount;
		if (paidAmount >= order.subtotal) {
			order.status = 'LUNAS';
			order.remainingAmount = 0;
			order.changeAmount = paidAmount - order.subtotal;
		} else if (paidAmount > 0) {
			order.status = 'PARTIAL_PAID';
			order.remainingAmount = order.subtotal - paidAmount;
			order.changeAmount = 0;
		} else if (input.method === 'PIUTANG') {
			order.status = 'PARTIAL_PAID';
			order.remainingAmount = order.subtotal;
			order.changeAmount = 0;
		}

		order.paidAt = new Date().toISOString();
		order.invoiceNumber = `INV-${Date.now().toString().slice(-6)}`;
		order.updatedAt = new Date().toISOString();

		return ResultClass.ok(JSON.parse(JSON.stringify(order)));
	}

	async cancelOrder(orderId: string, reason: string): Promise<Result<CashierOrder, AppError>> {
		const order = this.orders.find((o) => o.id === orderId);
		if (!order) {
			return ResultClass.error(new NotFoundError(`Pesanan tidak ditemukan`));
		}

		order.status = 'CANCELLED';
		order.cancelReason = reason;
		order.cancelledAt = new Date().toISOString();
		order.updatedAt = new Date().toISOString();

		return ResultClass.ok(JSON.parse(JSON.stringify(order)));
	}

	async sendToDraft(orderId: string): Promise<Result<CashierOrder, AppError>> {
		const order = this.orders.find((o) => o.id === orderId);
		if (!order) {
			return ResultClass.error(new NotFoundError(`Pesanan tidak ditemukan`));
		}

		order.status = 'DRAFT';
		order.updatedAt = new Date().toISOString();

		return ResultClass.ok(JSON.parse(JSON.stringify(order)));
	}

	async createRetailOrder(
		input: CashierCreateRetailOrderInput
	): Promise<Result<CashierOrder, AppError>> {
		const seq = this.orders.filter((o) => o.orderType === 'RETAIL').length + 1;
		const items: CashierOrderItem[] = input.items.map((it, idx) => ({
			id: `ret-item-${Date.now()}-${idx}`,
			productId: it.catalogItemId,
			productName: it.name,
			isProduction: false,
			uom: it.uom,
			dimensionText: `${it.quantity} ${it.uom}`,
			finishingText: '-',
			quantity: it.quantity,
			pricePerUnit: it.price,
			subtotal: it.price * it.quantity
		}));

		const subtotal = calculateCashierSubtotal(items);
		const newOrder: CashierOrder = {
			id: `ord-ret-${Date.now()}`,
			jobNumber: `RTL/20261119/${String(seq).padStart(4, '0')}`,
			invoiceNumber: null,
			orderType: 'RETAIL',
			status: 'PENDING_PAYMENT',
			customerType: 'end_user',
			customerName: input.customerName,
			customerPhone: input.customerPhone || '-',
			items,
			subtotal,
			totalPaid: 0,
			remainingAmount: subtotal,
			changeAmount: 0,
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString()
		};

		this.orders.unshift(newOrder);

		return ResultClass.ok(JSON.parse(JSON.stringify(newOrder)));
	}

	async mergeToProductionTicket(
		retailOrderId: string,
		targetProductionOrderId: string
	): Promise<Result<CashierOrder, AppError>> {
		const retailOrder = this.orders.find((o) => o.id === retailOrderId);
		if (!retailOrder) {
			return ResultClass.error(new NotFoundError(`Nota ritel tidak ditemukan`));
		}

		const targetOrder = this.orders.find((o) => o.id === targetProductionOrderId);
		if (!targetOrder) {
			return ResultClass.error(new NotFoundError(`Tiket produksi tujuan tidak ditemukan`));
		}

		targetOrder.items.push(...retailOrder.items);
		targetOrder.subtotal = calculateCashierSubtotal(targetOrder.items);
		targetOrder.remainingAmount = Math.max(0, targetOrder.subtotal - targetOrder.totalPaid);
		targetOrder.updatedAt = new Date().toISOString();

		// Remove retail order as it merged into target
		this.orders = this.orders.filter((o) => o.id !== retailOrderId);

		return ResultClass.ok(JSON.parse(JSON.stringify(targetOrder)));
	}
}
