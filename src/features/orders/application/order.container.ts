import { MOCK_FLAGS } from '$lib/shared/infrastructure/di/mock-config';
import type { OrderRepository } from '../domain/order.repository';
import { MockOrderRepository } from '../infrastructure/order.repository.mock';
import { OrderRepositoryImpl } from '../infrastructure/order.repository.impl';

let orderRepositoryInstance: OrderRepository | null = null;

export function getOrderRepository(): OrderRepository {
	if (!orderRepositoryInstance) {
		if (MOCK_FLAGS.orders) {
			orderRepositoryInstance = new MockOrderRepository();
		} else {
			orderRepositoryInstance = new OrderRepositoryImpl();
		}
	}
	return orderRepositoryInstance;
}
