import type { Result } from '$lib/shared/domain/types/result';
import type { AppError } from '$lib/shared/domain/errors/app-error';
import type {
	Order,
	OrderFulfillmentStatus,
	OrderStats,
	OrderSettlePaymentInput,
	OrderPickupInput
} from '../domain/order.entity';
import type { OrderListParams, OrderRepository } from '../domain/order.repository';
import { MockOrderRepository } from './order.repository.mock';

export class OrderRepositoryImpl implements OrderRepository {
	private mock = new MockOrderRepository();

	async getOrders(params?: OrderListParams): Promise<Result<Order[], AppError>> {
		return this.mock.getOrders(params);
	}

	async getOrderById(id: string): Promise<Result<Order, AppError>> {
		return this.mock.getOrderById(id);
	}

	async getOrderStats(): Promise<Result<OrderStats, AppError>> {
		return this.mock.getOrderStats();
	}

	async updateFulfillmentStatus(
		orderId: string,
		status: OrderFulfillmentStatus
	): Promise<Result<Order, AppError>> {
		return this.mock.updateFulfillmentStatus(orderId, status);
	}

	async settlePayment(
		orderId: string,
		input: OrderSettlePaymentInput
	): Promise<Result<Order, AppError>> {
		return this.mock.settlePayment(orderId, input);
	}

	async markAsPickedUp(orderId: string, input?: OrderPickupInput): Promise<Result<Order, AppError>> {
		return this.mock.markAsPickedUp(orderId, input);
	}

	async cancelOrder(orderId: string, reason: string): Promise<Result<Order, AppError>> {
		return this.mock.cancelOrder(orderId, reason);
	}
}
