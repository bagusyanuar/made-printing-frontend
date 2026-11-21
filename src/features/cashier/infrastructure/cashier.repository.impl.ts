import type { Result } from '$lib/shared/domain/types/result';
import type { AppError } from '$lib/shared/domain/errors/app-error';
import type {
	CashierOrder,
	CashierRetailCatalogItem,
	CashierProcessPaymentInput,
	CashierCreateRetailOrderInput
} from '../domain/cashier.entity';
import type { CashierListParams, CashierRepository } from '../domain/cashier.repository';
import { MockCashierRepository } from './cashier.repository.mock';

/**
 * Concrete implementation for the Cashier API.
 * Currently delegates to MockCashierRepository until backend endpoints are wired.
 */
export class CashierRepositoryImpl implements CashierRepository {
	private fallback = new MockCashierRepository();

	async getCashierOrders(params?: CashierListParams): Promise<Result<CashierOrder[], AppError>> {
		return this.fallback.getCashierOrders(params);
	}

	async getCashierOrderById(id: string): Promise<Result<CashierOrder, AppError>> {
		return this.fallback.getCashierOrderById(id);
	}

	async getRetailCatalog(): Promise<Result<CashierRetailCatalogItem[], AppError>> {
		return this.fallback.getRetailCatalog();
	}

	async updateItemPrice(
		orderId: string,
		itemId: string,
		newPrice: number
	): Promise<Result<CashierOrder, AppError>> {
		return this.fallback.updateItemPrice(orderId, itemId, newPrice);
	}

	async addRetailItem(
		orderId: string,
		item: {
			catalogItemId?: string;
			name: string;
			price: number;
			quantity: number;
			uom: string;
		}
	): Promise<Result<CashierOrder, AppError>> {
		return this.fallback.addRetailItem(orderId, item);
	}

	async removeItem(orderId: string, itemId: string): Promise<Result<CashierOrder, AppError>> {
		return this.fallback.removeItem(orderId, itemId);
	}

	async splitItemToNewRetailOrder(
		orderId: string,
		itemId: string
	): Promise<Result<{ sourceOrder: CashierOrder; newRetailOrder: CashierOrder }, AppError>> {
		return this.fallback.splitItemToNewRetailOrder(orderId, itemId);
	}

	async splitRetailItemsBatch(
		orderId: string,
		itemIds?: string[]
	): Promise<Result<{ sourceOrder: CashierOrder; newRetailOrder: CashierOrder }, AppError>> {
		return this.fallback.splitRetailItemsBatch(orderId, itemIds);
	}

	async processPayment(
		orderId: string,
		input: CashierProcessPaymentInput
	): Promise<Result<CashierOrder, AppError>> {
		return this.fallback.processPayment(orderId, input);
	}

	async cancelOrder(orderId: string, reason: string): Promise<Result<CashierOrder, AppError>> {
		return this.fallback.cancelOrder(orderId, reason);
	}

	async sendToDraft(orderId: string): Promise<Result<CashierOrder, AppError>> {
		return this.fallback.sendToDraft(orderId);
	}

	async createRetailOrder(
		input: CashierCreateRetailOrderInput
	): Promise<Result<CashierOrder, AppError>> {
		return this.fallback.createRetailOrder(input);
	}

	async mergeToProductionTicket(
		retailOrderId: string,
		targetProductionOrderId: string
	): Promise<Result<CashierOrder, AppError>> {
		return this.fallback.mergeToProductionTicket(retailOrderId, targetProductionOrderId);
	}
}
