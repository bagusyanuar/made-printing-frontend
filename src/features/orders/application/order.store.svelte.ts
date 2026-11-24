import type {
	Order,
	OrderPaymentStatus,
	OrderFulfillmentStatus,
	OrderType,
	OrderStats,
	OrderSettlePaymentInput,
	OrderPickupInput
} from '../domain/order.entity';
import { getOrderRepository } from './order.container';

export class OrderStore {
	private repo = getOrderRepository();

	orders = $state<Order[]>([]);
	stats = $state<OrderStats | null>(null);
	isLoading = $state<boolean>(false);
	error = $state<string | null>(null);

	// Primary Tabs: Nota Aktif vs Nota Selesai
	mainTab = $state<'ACTIVE' | 'COMPLETED'>('ACTIVE');

	// Active Orders Filter State
	activeFulfillmentFilter = $state<OrderFulfillmentStatus | 'ALL'>('ALL');
	activeFulfillmentFilters = $state<OrderFulfillmentStatus[]>([]);
	activePaymentFilter = $state<OrderPaymentStatus | 'ALL' | 'UNSETTLED'>('ALL');
	activePaymentFilters = $state<OrderPaymentStatus[]>([]);
	activeOrderTypeFilter = $state<OrderType | 'ALL'>('ALL');
	activeSearchQuery = $state<string>('');

	// Completed Orders Filter State
	completedStatusFilter = $state<'ALL' | 'PICKED_UP' | 'CANCELLED'>('ALL');
	completedPaymentFilter = $state<OrderPaymentStatus | 'ALL' | 'UNSETTLED'>('ALL');
	completedOrderTypeFilter = $state<OrderType | 'ALL'>('ALL');
	completedSearchQuery = $state<string>('');

	// Backward compatibility filter properties
	statusFilter = $state<OrderPaymentStatus | 'ALL' | 'UNSETTLED'>('ALL');
	fulfillmentFilter = $state<OrderFulfillmentStatus | 'ALL'>('ALL');
	orderTypeFilter = $state<OrderType | 'ALL'>('ALL');
	searchQuery = $state<string>('');
	selectedOrderId = $state<string | null>(null);

	// Derived states
	selectedOrder = $derived.by(() => {
		if (!this.selectedOrderId) return null;
		return this.orders.find((o) => o.id === this.selectedOrderId) ?? null;
	});

	activeOrders = $derived.by(() => {
		return this.orders.filter(
			(o) =>
				o.fulfillmentStatus !== 'PICKED_UP' &&
				o.status !== 'CANCELLED' &&
				o.orderType !== 'RETAIL'
		);
	});

	completedOrders = $derived.by(() => {
		return this.orders.filter(
			(o) => o.fulfillmentStatus === 'PICKED_UP' || o.status === 'CANCELLED'
		);
	});

	activeCount = $derived.by(() => this.activeOrders.length);
	completedCount = $derived.by(() => this.completedOrders.length);

	// Active Orders breakdown
	queuedCount = $derived.by(() => {
		return this.activeOrders.filter((o) => o.fulfillmentStatus === 'QUEUED').length;
	});

	processingCount = $derived.by(() => {
		return this.activeOrders.filter((o) => o.fulfillmentStatus === 'PROCESSING').length;
	});

	readyCount = $derived.by(() => {
		return this.activeOrders.filter((o) => o.fulfillmentStatus === 'READY_FOR_PICKUP').length;
	});

	readyUnpaidCount = $derived.by(() => {
		return this.activeOrders.filter(
			(o) => o.fulfillmentStatus === 'READY_FOR_PICKUP' && o.remainingAmount > 0
		).length;
	});

	prodActiveCount = $derived.by(() => {
		return this.activeOrders.filter((o) => o.orderType === 'PRODUCTION').length;
	});

	retailActiveCount = $derived.by(() => {
		return this.activeOrders.filter((o) => o.orderType === 'RETAIL').length;
	});

	activeUnsettledCount = $derived.by(() => {
		return this.activeOrders.filter(
			(o) => o.status === 'PARTIAL_PAID' || o.status === 'UNPAID' || o.status === 'OVERDUE'
		).length;
	});

	activePaidCount = $derived.by(() => {
		return this.activeOrders.filter((o) => o.status === 'LUNAS').length;
	});

	// Completed Orders breakdown
	pickedUpCount = $derived.by(() => {
		return this.orders.filter((o) => o.fulfillmentStatus === 'PICKED_UP').length;
	});

	cancelledCount = $derived.by(() => {
		return this.orders.filter((o) => o.status === 'CANCELLED').length;
	});

	prodCompletedCount = $derived.by(() => {
		return this.completedOrders.filter((o) => o.orderType === 'PRODUCTION').length;
	});

	retailCompletedCount = $derived.by(() => {
		return this.completedOrders.filter((o) => o.orderType === 'RETAIL').length;
	});

	// Global legacy counts
	unsettledCount = $derived.by(() => {
		return this.orders.filter(
			(o) => o.status === 'PARTIAL_PAID' || o.status === 'UNPAID' || o.status === 'OVERDUE'
		).length;
	});

	overdueCount = $derived.by(() => {
		return this.orders.filter((o) => o.status === 'OVERDUE').length;
	});

	paidCount = $derived.by(() => {
		return this.orders.filter((o) => o.status === 'LUNAS').length;
	});

	// Filtered Active Orders
	filteredActiveOrders = $derived.by(() => {
		let list = [...this.activeOrders];

		if (this.activeFulfillmentFilters.length > 0) {
			list = list.filter((o) => this.activeFulfillmentFilters.includes(o.fulfillmentStatus));
		} else if (this.activeFulfillmentFilter !== 'ALL') {
			list = list.filter((o) => o.fulfillmentStatus === this.activeFulfillmentFilter);
		}

		if (this.activeOrderTypeFilter !== 'ALL') {
			list = list.filter((o) => o.orderType === this.activeOrderTypeFilter);
		}

		if (this.activePaymentFilters.length > 0) {
			list = list.filter((o) => {
				return this.activePaymentFilters.some((status) => {
					if (status === 'UNPAID') {
						return o.status === 'UNPAID' || o.status === 'OVERDUE';
					}
					return o.status === status;
				});
			});
		} else if (this.activePaymentFilter !== 'ALL') {
			if (this.activePaymentFilter === 'UNSETTLED') {
				list = list.filter(
					(o) => o.status === 'PARTIAL_PAID' || o.status === 'UNPAID' || o.status === 'OVERDUE'
				);
			} else {
				list = list.filter((o) => o.status === this.activePaymentFilter);
			}
		}

		if (this.activeSearchQuery.trim()) {
			const q = this.activeSearchQuery.toLowerCase().trim();
			list = list.filter(
				(o) =>
					o.invoiceNumber.toLowerCase().includes(q) ||
					o.jobNumber.toLowerCase().includes(q) ||
					o.customerName.toLowerCase().includes(q) ||
					(o.resellerName && o.resellerName.toLowerCase().includes(q)) ||
					(o.rackLocation && o.rackLocation.toLowerCase().includes(q))
			);
		}

		return list;
	});

	// Filtered Completed Orders
	filteredCompletedOrders = $derived.by(() => {
		let list = [...this.completedOrders];

		if (this.completedStatusFilter !== 'ALL') {
			if (this.completedStatusFilter === 'PICKED_UP') {
				list = list.filter((o) => o.fulfillmentStatus === 'PICKED_UP');
			} else if (this.completedStatusFilter === 'CANCELLED') {
				list = list.filter((o) => o.status === 'CANCELLED');
			}
		}

		if (this.completedOrderTypeFilter !== 'ALL') {
			list = list.filter((o) => o.orderType === this.completedOrderTypeFilter);
		}

		if (this.completedPaymentFilter !== 'ALL') {
			if (this.completedPaymentFilter === 'UNSETTLED') {
				list = list.filter(
					(o) => o.status === 'PARTIAL_PAID' || o.status === 'UNPAID' || o.status === 'OVERDUE'
				);
			} else {
				list = list.filter((o) => o.status === this.completedPaymentFilter);
			}
		}

		if (this.completedSearchQuery.trim()) {
			const q = this.completedSearchQuery.toLowerCase().trim();
			list = list.filter(
				(o) =>
					o.invoiceNumber.toLowerCase().includes(q) ||
					o.jobNumber.toLowerCase().includes(q) ||
					o.customerName.toLowerCase().includes(q) ||
					(o.resellerName && o.resellerName.toLowerCase().includes(q)) ||
					(o.pickedUpBy && o.pickedUpBy.toLowerCase().includes(q)) ||
					(o.cancelReason && o.cancelReason.toLowerCase().includes(q))
			);
		}

		return list;
	});

	// Active tab's current filtered orders
	filteredOrders = $derived.by(() => {
		if (this.mainTab === 'ACTIVE') {
			return this.filteredActiveOrders;
		}
		return this.filteredCompletedOrders;
	});

	async load() {
		this.isLoading = true;
		this.error = null;
		try {
			const [ordersRes, statsRes] = await Promise.all([
				this.repo.getOrders(),
				this.repo.getOrderStats()
			]);

			if (ordersRes.success) {
				this.orders = ordersRes.data;
			} else {
				this.error = ordersRes.error.message;
			}

			if (statsRes.success) {
				this.stats = statsRes.data;
			}
		} finally {
			this.isLoading = false;
		}
	}

	async refresh() {
		await this.load();
	}

	setMainTab(tab: 'ACTIVE' | 'COMPLETED') {
		this.mainTab = tab;
	}

	setActiveFulfillmentFilter(status: OrderFulfillmentStatus | 'ALL') {
		this.activeFulfillmentFilter = status;
		if (status === 'ALL') {
			this.activeFulfillmentFilters = [];
		} else {
			this.activeFulfillmentFilters = [status];
		}
	}

	toggleActiveFulfillmentFilter(status: OrderFulfillmentStatus) {
		if (this.activeFulfillmentFilters.includes(status)) {
			this.activeFulfillmentFilters = this.activeFulfillmentFilters.filter((s) => s !== status);
		} else {
			this.activeFulfillmentFilters = [...this.activeFulfillmentFilters, status];
		}
		if (this.activeFulfillmentFilters.length === 1) {
			this.activeFulfillmentFilter = this.activeFulfillmentFilters[0];
		} else if (this.activeFulfillmentFilters.length === 0) {
			this.activeFulfillmentFilter = 'ALL';
		} else {
			this.activeFulfillmentFilter = 'ALL';
		}
	}

	toggleActivePaymentFilter(status: OrderPaymentStatus) {
		if (this.activePaymentFilters.includes(status)) {
			this.activePaymentFilters = this.activePaymentFilters.filter((s) => s !== status);
		} else {
			this.activePaymentFilters = [...this.activePaymentFilters, status];
		}
	}

	clearActiveFulfillmentFilters() {
		this.activeFulfillmentFilters = [];
		this.activeFulfillmentFilter = 'ALL';
	}

	clearActivePaymentFilters() {
		this.activePaymentFilters = [];
		this.activePaymentFilter = 'ALL';
	}

	setActivePaymentFilter(status: OrderPaymentStatus | 'ALL' | 'UNSETTLED') {
		this.activePaymentFilter = status;
		if (status === 'ALL') {
			this.activePaymentFilters = [];
		}
	}

	setActiveOrderTypeFilter(type: OrderType | 'ALL') {
		this.activeOrderTypeFilter = type;
	}

	setActiveSearch(q: string) {
		this.activeSearchQuery = q;
	}

	resetActiveFilters() {
		this.activeFulfillmentFilter = 'ALL';
		this.activeFulfillmentFilters = [];
		this.activePaymentFilter = 'ALL';
		this.activePaymentFilters = [];
		this.activeOrderTypeFilter = 'ALL';
		this.activeSearchQuery = '';
	}

	setCompletedStatusFilter(status: 'ALL' | 'PICKED_UP' | 'CANCELLED') {
		this.completedStatusFilter = status;
	}

	setCompletedPaymentFilter(status: OrderPaymentStatus | 'ALL' | 'UNSETTLED') {
		this.completedPaymentFilter = status;
	}

	setCompletedOrderTypeFilter(type: OrderType | 'ALL') {
		this.completedOrderTypeFilter = type;
	}

	setCompletedSearch(q: string) {
		this.completedSearchQuery = q;
	}

	resetCompletedFilters() {
		this.completedStatusFilter = 'ALL';
		this.completedPaymentFilter = 'ALL';
		this.completedOrderTypeFilter = 'ALL';
		this.completedSearchQuery = '';
	}

	setStatusFilter(status: OrderPaymentStatus | 'ALL' | 'UNSETTLED') {
		this.statusFilter = status;
	}

	setFulfillmentFilter(status: OrderFulfillmentStatus | 'ALL') {
		this.fulfillmentFilter = status;
	}

	setOrderTypeFilter(type: OrderType | 'ALL') {
		this.orderTypeFilter = type;
	}

	setSearch(q: string) {
		this.searchQuery = q;
	}

	selectOrder(id: string | null) {
		this.selectedOrderId = id;
	}

	async updateFulfillmentStatus(
		orderId: string,
		status: OrderFulfillmentStatus
	): Promise<boolean> {
		const res = await this.repo.updateFulfillmentStatus(orderId, status);
		if (res.success) {
			const updated = res.data;
			const idx = this.orders.findIndex((o) => o.id === orderId);
			if (idx !== -1) {
				this.orders[idx] = updated;
			}
			const statsRes = await this.repo.getOrderStats();
			if (statsRes.success) {
				this.stats = statsRes.data;
			}
			return true;
		}
		this.error = res.error.message;
		return false;
	}

	async settlePayment(orderId: string, input: OrderSettlePaymentInput): Promise<boolean> {
		const res = await this.repo.settlePayment(orderId, input);
		if (res.success) {
			const updated = res.data;
			const idx = this.orders.findIndex((o) => o.id === orderId);
			if (idx !== -1) {
				this.orders[idx] = updated;
			}
			const statsRes = await this.repo.getOrderStats();
			if (statsRes.success) {
				this.stats = statsRes.data;
			}
			return true;
		}
		this.error = res.error.message;
		return false;
	}

	async markAsPickedUp(orderId: string, input?: OrderPickupInput): Promise<boolean> {
		const res = await this.repo.markAsPickedUp(orderId, input);
		if (res.success) {
			const updated = res.data;
			const idx = this.orders.findIndex((o) => o.id === orderId);
			if (idx !== -1) {
				this.orders[idx] = updated;
			}
			const statsRes = await this.repo.getOrderStats();
			if (statsRes.success) {
				this.stats = statsRes.data;
			}
			return true;
		}
		this.error = res.error.message;
		return false;
	}

	async cancelOrder(orderId: string, reason: string): Promise<boolean> {
		const res = await this.repo.cancelOrder(orderId, reason);
		if (res.success) {
			const updated = res.data;
			const idx = this.orders.findIndex((o) => o.id === orderId);
			if (idx !== -1) {
				this.orders[idx] = updated;
			}
			const statsRes = await this.repo.getOrderStats();
			if (statsRes.success) {
				this.stats = statsRes.data;
			}
			return true;
		}
		this.error = res.error.message;
		return false;
	}
}

export const orderStore = new OrderStore();
