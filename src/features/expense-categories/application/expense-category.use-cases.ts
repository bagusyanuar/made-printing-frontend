import type { Result } from '$lib/shared/domain/types/result';
import type { AppError } from '$lib/shared/domain/errors/app-error';
import type { ExpenseCategory, ExpenseCategoryInput } from '../domain/expense-category.entity';
import type { ExpenseCategoryRepository } from '../domain/expense-category.repository';
import { expenseCategoryRepositoryInstance } from './expense-category.container';

export interface ExpenseCategoryUseCases {
	list(): Promise<Result<ExpenseCategory[], AppError>>;
	getById(id: string): Promise<Result<ExpenseCategory, AppError>>;
	create(input: ExpenseCategoryInput): Promise<Result<ExpenseCategory, AppError>>;
	update(id: string, input: ExpenseCategoryInput): Promise<Result<ExpenseCategory, AppError>>;
	delete(id: string): Promise<Result<void, AppError>>;
	reorder(orders: { id: string; displayOrder: number }[]): Promise<Result<void, AppError>>;
}

export function createExpenseCategoryUseCases(
	repository: ExpenseCategoryRepository
): ExpenseCategoryUseCases {
	return {
		list: () => repository.list(),
		getById: (id: string) => repository.getById(id),
		create: (input: ExpenseCategoryInput) => repository.create(input),
		update: (id: string, input: ExpenseCategoryInput) => repository.update(id, input),
		delete: (id: string) => repository.delete(id),
		reorder: (orders: { id: string; displayOrder: number }[]) => repository.reorder(orders)
	};
}

export const expenseCategoryUseCases = createExpenseCategoryUseCases(
	expenseCategoryRepositoryInstance
);
