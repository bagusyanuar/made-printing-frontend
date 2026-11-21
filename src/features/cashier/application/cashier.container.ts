import { MOCK_FLAGS } from '$lib/shared/infrastructure/di/mock-config';
import type { CashierRepository } from '../domain/cashier.repository';
import { MockCashierRepository } from '../infrastructure/cashier.repository.mock';
import { CashierRepositoryImpl } from '../infrastructure/cashier.repository.impl';

let cashierRepositoryInstance: CashierRepository | null = null;

export function getCashierRepository(): CashierRepository {
	if (!cashierRepositoryInstance) {
		cashierRepositoryInstance = MOCK_FLAGS.cashier
			? new MockCashierRepository()
			: new CashierRepositoryImpl();
	}
	return cashierRepositoryInstance;
}
