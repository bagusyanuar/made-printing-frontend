import type { ExpenseInput, ExpenseSettlePaymentInput } from '../domain/expense.entity';
import type { ExpenseRepository } from '../domain/expense.repository';
import { getExpenseRepository } from './expense.container';

export function createExpenseUseCases(repository: ExpenseRepository) {
	return {
		list: () => repository.list(),
		getById: (id: string) => repository.getById(id),
		create: (input: ExpenseInput) => repository.create(input),
		settlePayment: (id: string, input: ExpenseSettlePaymentInput) =>
			repository.settlePayment(id, input),
		approve: (id: string) => repository.approve(id),
		cancel: (id: string, reason: string) => repository.cancel(id, reason)
	};
}

export const expenseUseCases = createExpenseUseCases(getExpenseRepository());
