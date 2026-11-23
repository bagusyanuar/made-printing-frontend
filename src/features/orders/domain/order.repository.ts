import type { Result } from '$lib/shared/domain/types/result';
import type { AppError } from '$lib/shared/domain/errors/app-error';
import type {
	Order,
	OrderPaymentStatus,
	OrderFulfillmentStatus,
	OrderType,
	OrderCustomerType,
	OrderStats,
	OrderSettlePaymentInput,
	OrderPickupInput
} from './order.entity';

export interface OrderListParams {
	status?: OrderPaymentStatus | 'ALL' | 'UNSETTLED';
	fulfillmentStatus?: OrderFulfillmentStatus | 'ALL';
	orderType?: OrderType | 'ALL';
	customerType?: OrderCustomerType | 'ALL';
	search?: string;
	dateFrom?: string;
	dateTo?: string;
}

export interface OrderRepository {
	getOrders(params?: OrderListParams): Promise<Result<Order[], AppError>>;
	getOrderById(id: string): Promise<Result<Order, AppError>>;
	getOrderStats(): Promise<Result<OrderStats, AppError>>;
	settlePayment(orderId: string, input: OrderSettlePaymentInput): Promise<Result<Order, AppError>>;
	markAsPickedUp(orderId: string, input?: OrderPickupInput): Promise<Result<Order, AppError>>;
	cancelOrder(orderId: string, reason: string): Promise<Result<Order, AppError>>;
}
