import { MOCK_FLAGS } from '$lib/shared/infrastructure/di/mock-config';
import type { ExpenseRepository } from '../domain/expense.repository';
import { MockExpenseRepository } from '../infrastructure/expense.repository.mock';
import { ExpenseRepositoryImpl } from '../infrastructure/expense.repository.impl';

let expenseRepositoryInstance: ExpenseRepository | null = null;

export function getExpenseRepository(): ExpenseRepository {
	if (!expenseRepositoryInstance) {
		if (MOCK_FLAGS.expenses) {
			expenseRepositoryInstance = new MockExpenseRepository();
		} else {
			expenseRepositoryInstance = new ExpenseRepositoryImpl();
		}
	}
	return expenseRepositoryInstance;
}
