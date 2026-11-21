import type {
	CashierOrder,
	CashierPaymentMethod,
	CashierRetailCatalogItem,
	CashierCreateRetailOrderInput
} from '../domain/cashier.entity';
import { getCashierRepository } from './cashier.container';

export class CashierStore {
	private repo = getCashierRepository();

	activeTab = $state<'PRODUCTION' | 'RETAIL'>('PRODUCTION');
	searchQuery = $state<string>('');
	selectedOrderId = $state<string | null>('ord-prod-001');

	orders = $state<CashierOrder[]>([]);
	retailCatalog = $state<CashierRetailCatalogItem[]>([]);
	isLoading = $state<boolean>(false);
	errorMessage = $state<string | null>(null);

	// Checkout Payment form state
	isSplitPayment = $state<boolean>(false);
	paymentMethod = $state<CashierPaymentMethod>('CASH');
	singleAmount = $state<number | null | undefined>(null);
	splitAmounts = $state<{ cash?: number; transfer?: number; qris?: number }>({
		cash: 0,
		transfer: 0,
		qris: 0
	});

	// Receipt Dialog state
	isReceiptOpen = $state<boolean>(false);
	lastCompletedOrder = $state<CashierOrder | null>(null);
	isTemporaryReceipt = $state<boolean>(false);

	// Derived state
	activeOrder = $derived.by(() => {
		if (!this.selectedOrderId) return null;
		return this.orders.find((o) => o.id === this.selectedOrderId) ?? null;
	});

	pendingQueueCount = $derived.by(() => {
		return this.orders.filter((o) => o.status === 'PENDING_PAYMENT').length;
	});

	productionQueueCount = $derived.by(() => {
		return this.orders.filter(
			(o) => o.orderType === 'PRODUCTION' && o.status === 'PENDING_PAYMENT'
		).length;
	});

	retailQueueCount = $derived.by(() => {
		return this.orders.filter(
			(o) => o.orderType === 'RETAIL' && o.status === 'PENDING_PAYMENT'
		).length;
	});

	filteredQueue = $derived.by(() => {
		let list = this.orders.filter((o) => o.orderType === this.activeTab);
		if (this.searchQuery.trim()) {
			const q = this.searchQuery.toLowerCase();
			list = list.filter(
				(o) =>
					o.jobNumber.toLowerCase().includes(q) ||
					o.customerName.toLowerCase().includes(q) ||
					(o.designerName && o.designerName.toLowerCase().includes(q))
			);
		}
		return list;
	});

	subtotal = $derived.by(() => {
		return this.activeOrder ? this.activeOrder.subtotal : 0;
	});

	grandTotal = $derived.by(() => {
		return this.activeOrder ? this.activeOrder.subtotal : 0;
	});

	totalPayingAmount = $derived.by(() => {
		if (this.isSplitPayment) {
			return (
				(this.splitAmounts.cash ?? 0) +
				(this.splitAmounts.transfer ?? 0) +
				(this.splitAmounts.qris ?? 0)
			);
		}
		if (this.paymentMethod === 'PIUTANG') {
			return 0;
		}
		return this.singleAmount !== null && this.singleAmount !== undefined
			? this.singleAmount
			: this.grandTotal;
	});

	remainingAmount = $derived.by(() => {
		if (this.paymentMethod === 'PIUTANG' && !this.isSplitPayment) {
			return this.grandTotal;
		}
		return Math.max(0, this.grandTotal - this.totalPayingAmount);
	});

	changeAmount = $derived.by(() => {
		if (this.paymentMethod === 'PIUTANG' && !this.isSplitPayment) {
			return 0;
		}
		return Math.max(0, this.totalPayingAmount - this.grandTotal);
	});

	async load() {
		this.isLoading = true;
		this.errorMessage = null;
		try {
			const [ordersRes, catalogRes] = await Promise.all([
				this.repo.getCashierOrders(),
				this.repo.getRetailCatalog()
			]);

			if (ordersRes.success) {
				this.orders = ordersRes.data;
				if (
					(!this.selectedOrderId || !this.orders.some((o) => o.id === this.selectedOrderId)) &&
					this.orders.length > 0
				) {
					this.selectedOrderId = this.orders[0].id;
				}
			} else {
				this.errorMessage = ordersRes.error.message;
			}

			if (catalogRes.success) {
				this.retailCatalog = catalogRes.data;
			}
		} finally {
			this.isLoading = false;
		}
	}

	selectOrder(id: string) {
		this.selectedOrderId = id;
		this.singleAmount = null;
		this.isSplitPayment = false;
		this.paymentMethod = 'CASH';
		this.splitAmounts = { cash: 0, transfer: 0, qris: 0 };
	}

	setTab(tab: 'PRODUCTION' | 'RETAIL') {
		this.activeTab = tab;
	}

	setSearch(q: string) {
		this.searchQuery = q;
	}

	async updateItemPrice(orderId: string, itemId: string, newPrice: number) {
		const res = await this.repo.updateItemPrice(orderId, itemId, newPrice);
		if (res.success) {
			const updated = res.data;
			const idx = this.orders.findIndex((o) => o.id === orderId);
			if (idx !== -1) {
				this.orders[idx] = updated;
			}
			return true;
		}
		return false;
	}

	async addRetailItem(
		orderId: string,
		item: { catalogItemId?: string; name: string; price: number; quantity: number; uom: string }
	) {
		const res = await this.repo.addRetailItem(orderId, item);
		if (res.success) {
			const updated = res.data;
			const idx = this.orders.findIndex((o) => o.id === orderId);
			if (idx !== -1) {
				this.orders[idx] = updated;
			}
			return true;
		}
		return false;
	}

	async addRetailItemsBatch(
		orderId: string,
		items: Array<{ catalogItemId?: string; name: string; price: number; quantity: number; uom: string }>
	) {
		for (const item of items) {
			const res = await this.repo.addRetailItem(orderId, item);
			if (res.success) {
				const updated = res.data;
				const idx = this.orders.findIndex((o) => o.id === orderId);
				if (idx !== -1) {
					this.orders[idx] = updated;
				}
			}
		}
		return true;
	}

	async removeItem(orderId: string, itemId: string) {
		const res = await this.repo.removeItem(orderId, itemId);
		if (res.success) {
			const updated = res.data;
			const idx = this.orders.findIndex((o) => o.id === orderId);
			if (idx !== -1) {
				this.orders[idx] = updated;
			}
			return true;
		}
		return false;
	}

	async splitItemToNewRetailOrder(orderId: string, itemId: string) {
		const res = await this.repo.splitItemToNewRetailOrder(orderId, itemId);
		if (res.success) {
			const { sourceOrder, newRetailOrder } = res.data;
			const idx = this.orders.findIndex((o) => o.id === orderId);
			if (idx !== -1) {
				this.orders[idx] = sourceOrder;
			}
			this.orders.unshift(newRetailOrder);
			return true;
		}
		return false;
	}

	async splitRetailItemsBatch(orderId: string, itemIds?: string[]) {
		const res = await this.repo.splitRetailItemsBatch(orderId, itemIds);
		if (res.success) {
			const { sourceOrder, newRetailOrder } = res.data;
			const idx = this.orders.findIndex((o) => o.id === orderId);
			if (idx !== -1) {
				this.orders[idx] = sourceOrder;
			}
			this.orders.unshift(newRetailOrder);
			return true;
		}
		return false;
	}

	async processPayment() {
		if (!this.selectedOrderId || !this.activeOrder) return false;

		const orderId = this.selectedOrderId;
		const input = {
			isSplit: this.isSplitPayment,
			method: this.paymentMethod,
			singleAmount:
				this.singleAmount !== null && this.singleAmount !== undefined
					? this.singleAmount
					: this.grandTotal,
			splitAmounts: this.isSplitPayment
				? {
						cash: this.splitAmounts.cash ?? 0,
						transfer: this.splitAmounts.transfer ?? 0,
						qris: this.splitAmounts.qris ?? 0
					}
				: undefined
		};

		const res = await this.repo.processPayment(orderId, input);
		if (res.success) {
			const updated = res.data;
			const idx = this.orders.findIndex((o) => o.id === orderId);
			if (idx !== -1) {
				this.orders[idx] = updated;
			}
			this.lastCompletedOrder = updated;
			this.isTemporaryReceipt = false;
			this.isReceiptOpen = true;
			return true;
		}
		return false;
	}

	async cancelOrder(orderId: string, reason: string) {
		const res = await this.repo.cancelOrder(orderId, reason);
		if (res.success) {
			const updated = res.data;
			const idx = this.orders.findIndex((o) => o.id === orderId);
			if (idx !== -1) {
				this.orders[idx] = updated;
			}
			return true;
		}
		return false;
	}

	async sendToDraft(orderId: string) {
		const res = await this.repo.sendToDraft(orderId);
		if (res.success) {
			const updated = res.data;
			const idx = this.orders.findIndex((o) => o.id === orderId);
			if (idx !== -1) {
				this.orders[idx] = updated;
			}
			return true;
		}
		return false;
	}

	async createRetailOrder(input: CashierCreateRetailOrderInput) {
		const res = await this.repo.createRetailOrder(input);
		if (res.success) {
			const newOrder = res.data;
			this.orders.unshift(newOrder);
			this.activeTab = 'RETAIL';
			this.selectedOrderId = newOrder.id;
			return true;
		}
		return false;
	}

	async mergeToProduction(retailOrderId: string, targetOrderId: string) {
		const res = await this.repo.mergeToProductionTicket(retailOrderId, targetOrderId);
		if (res.success) {
			const targetOrder = res.data;
			this.orders = this.orders.filter((o) => o.id !== retailOrderId);
			const idx = this.orders.findIndex((o) => o.id === targetOrderId);
			if (idx !== -1) {
				this.orders[idx] = targetOrder;
			}
			this.activeTab = 'PRODUCTION';
			this.selectedOrderId = targetOrderId;
			return true;
		}
		return false;
	}
}

export const cashierStore = new CashierStore();
