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
			(o) => o.fulfillmentStatus !== 'PICKED_UP' && o.status !== 'CANCELLED'
		);
	});

	activeCount = $derived.by(() => this.activeOrders.length);

	prodActiveCount = $derived.by(() => {
		return this.activeOrders.filter((o) => o.orderType === 'PRODUCTION').length;
	});

	retailActiveCount = $derived.by(() => {
		return this.activeOrders.filter((o) => o.orderType === 'RETAIL').length;
	});

	processingCount = $derived.by(() => {
		return this.orders.filter(
			(o) =>
				(o.fulfillmentStatus === 'PROCESSING' || o.fulfillmentStatus === 'QUEUED') &&
				o.status !== 'CANCELLED'
		).length;
	});

	readyCount = $derived.by(() => {
		return this.orders.filter(
			(o) => o.fulfillmentStatus === 'READY_FOR_PICKUP' && o.status !== 'CANCELLED'
		).length;
	});

	readyUnpaidCount = $derived.by(() => {
		return this.orders.filter(
			(o) =>
				o.fulfillmentStatus === 'READY_FOR_PICKUP' &&
				o.remainingAmount > 0 &&
				o.status !== 'CANCELLED'
		).length;
	});

	pickedUpCount = $derived.by(() => {
		return this.orders.filter((o) => o.fulfillmentStatus === 'PICKED_UP').length;
	});

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

	filteredOrders = $derived.by(() => {
		let list = [...this.orders];

		if (this.statusFilter !== 'ALL') {
			if (this.statusFilter === 'UNSETTLED') {
				list = list.filter(
					(o) => o.status === 'PARTIAL_PAID' || o.status === 'UNPAID' || o.status === 'OVERDUE'
				);
			} else {
				list = list.filter((o) => o.status === this.statusFilter);
			}
		}

		if (this.fulfillmentFilter !== 'ALL') {
			list = list.filter((o) => o.fulfillmentStatus === this.fulfillmentFilter);
		}

		if (this.orderTypeFilter !== 'ALL') {
			list = list.filter((o) => o.orderType === this.orderTypeFilter);
		}

		if (this.searchQuery.trim()) {
			const q = this.searchQuery.toLowerCase().trim();
			list = list.filter(
				(o) =>
					o.invoiceNumber.toLowerCase().includes(q) ||
					o.jobNumber.toLowerCase().includes(q) ||
					o.customerName.toLowerCase().includes(q) ||
					(o.resellerName && o.resellerName.toLowerCase().includes(q))
			);
		}

		return list;
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
