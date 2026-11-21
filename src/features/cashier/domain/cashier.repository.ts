import type { Result } from '$lib/shared/domain/types/result';
import type { AppError } from '$lib/shared/domain/errors/app-error';
import type {
	CashierOrder,
	CashierOrderType,
	CashierRetailCatalogItem,
	CashierProcessPaymentInput,
	CashierCreateRetailOrderInput
} from './cashier.entity';

export interface CashierListParams {
	type?: CashierOrderType;
	status?: string;
	search?: string;
}

export interface CashierRepository {
	getCashierOrders(params?: CashierListParams): Promise<Result<CashierOrder[], AppError>>;
	getCashierOrderById(id: string): Promise<Result<CashierOrder, AppError>>;
	getRetailCatalog(): Promise<Result<CashierRetailCatalogItem[], AppError>>;
	updateItemPrice(orderId: string, itemId: string, newPrice: number): Promise<Result<CashierOrder, AppError>>;
	addRetailItem(
		orderId: string,
		item: {
			catalogItemId?: string;
			name: string;
			price: number;
			quantity: number;
			uom: string;
		}
	): Promise<Result<CashierOrder, AppError>>;
	removeItem(orderId: string, itemId: string): Promise<Result<CashierOrder, AppError>>;
	splitItemToNewRetailOrder(
		orderId: string,
		itemId: string
	): Promise<Result<{ sourceOrder: CashierOrder; newRetailOrder: CashierOrder }, AppError>>;
	splitRetailItemsBatch(
		orderId: string,
		itemIds?: string[]
	): Promise<Result<{ sourceOrder: CashierOrder; newRetailOrder: CashierOrder }, AppError>>;
	processPayment(orderId: string, input: CashierProcessPaymentInput): Promise<Result<CashierOrder, AppError>>;
	cancelOrder(orderId: string, reason: string): Promise<Result<CashierOrder, AppError>>;
	sendToDraft(orderId: string): Promise<Result<CashierOrder, AppError>>;
	createRetailOrder(input: CashierCreateRetailOrderInput): Promise<Result<CashierOrder, AppError>>;
	mergeToProductionTicket(
		retailOrderId: string,
		targetProductionOrderId: string
	): Promise<Result<CashierOrder, AppError>>;
}
