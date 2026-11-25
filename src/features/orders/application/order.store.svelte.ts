import { getLocalTimeZone, today } from '@internationalized/date';
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

function getTodayDateString(): string {
	return today(getLocalTimeZone()).toString();
}

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
	completedStatusFilter = $state<'ALL' | 'PICKED_UP' | 'CANCELLED' | 'REFUND'>('ALL');
	completedStatusFilters = $state<('PICKED_UP' | 'CANCELLED')[]>([]);
	completedPaymentFilter = $state<OrderPaymentStatus | 'ALL' | 'UNSETTLED'>('ALL');
	completedPaymentFilters = $state<OrderPaymentStatus[]>([]);
	completedOrderTypeFilter = $state<OrderType | 'ALL'>('ALL');
	completedOrderTypeFilters = $state<OrderType[]>([]);
	completedSearchQuery = $state<string>('');
	completedDateRange = $state<{ startDate: string | null; endDate: string | null }>({
		startDate: getTodayDateString(),
		endDate: getTodayDateString()
	});

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
				o.status !== 'REFUND' &&
				o.orderType !== 'RETAIL'
		);
	});

	completedOrders = $derived.by(() => {
		return this.orders.filter(
			(o) =>
				o.fulfillmentStatus === 'PICKED_UP' || o.status === 'CANCELLED' || o.status === 'REFUND'
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

		if (this.completedStatusFilters.length > 0) {
			list = list.filter((o) => {
				const isCancelled = o.status === 'CANCELLED' || o.status === 'REFUND';
				return this.completedStatusFilters.some((status) => {
					if (status === 'CANCELLED') return isCancelled;
					if (status === 'PICKED_UP') return !isCancelled && o.fulfillmentStatus === 'PICKED_UP';
					return false;
				});
			});
		} else if (this.completedStatusFilter !== 'ALL') {
			if (this.completedStatusFilter === 'PICKED_UP') {
				list = list.filter((o) => o.fulfillmentStatus === 'PICKED_UP');
			} else if (this.completedStatusFilter === 'CANCELLED') {
				list = list.filter((o) => o.status === 'CANCELLED');
			}
		}

		if (this.completedOrderTypeFilters.length > 0) {
			list = list.filter((o) => this.completedOrderTypeFilters.includes(o.orderType));
		} else if (this.completedOrderTypeFilter !== 'ALL') {
			list = list.filter((o) => o.orderType === this.completedOrderTypeFilter);
		}

		if (this.completedPaymentFilters.length > 0) {
			list = list.filter((o) =>
				this.completedPaymentFilters.some((status) => {
					if (status === 'UNPAID') {
						return o.status === 'UNPAID' || o.status === 'OVERDUE';
					}
					return o.status === status;
				})
			);
		} else if (this.completedPaymentFilter !== 'ALL') {
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

		if (this.completedDateRange.startDate || this.completedDateRange.endDate) {
			const startMs = this.completedDateRange.startDate
				? Date.parse(`${this.completedDateRange.startDate}T00:00:00`)
				: null;
			const endMs = this.completedDateRange.endDate
				? Date.parse(`${this.completedDateRange.endDate}T23:59:59.999`)
				: null;

			list = list.filter((o) => {
				const rawDate = o.pickedUpAt || o.cancelledAt || o.issuedAt;
				const timeMs = Date.parse(rawDate);
				if (Number.isNaN(timeMs)) return false;
				if (startMs !== null && timeMs < startMs) return false;
				if (endMs !== null && timeMs > endMs) return false;
				return true;
			});
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
		if (status === 'ALL') {
			this.completedStatusFilters = [];
		} else {
			this.completedStatusFilters = [status];
		}
	}

	toggleCompletedStatusFilter(status: 'PICKED_UP' | 'CANCELLED') {
		if (this.completedStatusFilters.includes(status)) {
			this.completedStatusFilters = this.completedStatusFilters.filter((s) => s !== status);
		} else {
			this.completedStatusFilters = [...this.completedStatusFilters, status];
		}
		if (this.completedStatusFilters.length === 1) {
			this.completedStatusFilter = this.completedStatusFilters[0];
		} else {
			this.completedStatusFilter = 'ALL';
		}
	}

	toggleCompletedPaymentFilter(status: OrderPaymentStatus) {
		if (this.completedPaymentFilters.includes(status)) {
			this.completedPaymentFilters = this.completedPaymentFilters.filter((s) => s !== status);
		} else {
			this.completedPaymentFilters = [...this.completedPaymentFilters, status];
		}
	}

	clearCompletedStatusFilters() {
		this.completedStatusFilters = [];
		this.completedStatusFilter = 'ALL';
	}

	clearCompletedPaymentFilters() {
		this.completedPaymentFilters = [];
		this.completedPaymentFilter = 'ALL';
	}

	setCompletedPaymentFilter(status: OrderPaymentStatus | 'ALL' | 'UNSETTLED') {
		this.completedPaymentFilter = status;
		if (status === 'ALL') {
			this.completedPaymentFilters = [];
		}
	}

	setCompletedOrderTypeFilter(type: OrderType | 'ALL') {
		this.completedOrderTypeFilter = type;
		if (type === 'ALL') {
			this.completedOrderTypeFilters = [];
		} else {
			this.completedOrderTypeFilters = [type];
		}
	}

	toggleCompletedOrderTypeFilter(type: OrderType) {
		if (this.completedOrderTypeFilters.includes(type)) {
			this.completedOrderTypeFilters = this.completedOrderTypeFilters.filter((t) => t !== type);
		} else {
			this.completedOrderTypeFilters = [...this.completedOrderTypeFilters, type];
		}
		if (this.completedOrderTypeFilters.length === 1) {
			this.completedOrderTypeFilter = this.completedOrderTypeFilters[0];
		} else {
			this.completedOrderTypeFilter = 'ALL';
		}
	}

	clearCompletedOrderTypeFilters() {
		this.completedOrderTypeFilters = [];
		this.completedOrderTypeFilter = 'ALL';
	}

	setCompletedSearch(q: string) {
		this.completedSearchQuery = q;
	}

	setCompletedDateRange(startDate: string | null, endDate: string | null) {
		this.completedDateRange = { startDate, endDate };
	}

	resetCompletedFilters() {
		this.completedStatusFilter = 'ALL';
		this.completedStatusFilters = [];
		this.completedPaymentFilter = 'ALL';
		this.completedPaymentFilters = [];
		this.completedOrderTypeFilter = 'ALL';
		this.completedOrderTypeFilters = [];
		this.completedSearchQuery = '';
		this.completedDateRange = { startDate: null, endDate: null };
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

	async updateFulfillmentStatus(orderId: string, status: OrderFulfillmentStatus): Promise<boolean> {
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
