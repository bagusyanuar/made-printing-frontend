import type { Result } from '$lib/shared/domain/types/result';
import type { AppError } from '$lib/shared/domain/errors/app-error';
import type { ExpenseCategory, ExpenseCategoryInput } from './expense-category.entity';

export interface ExpenseCategoryRepository {
	list(): Promise<Result<ExpenseCategory[], AppError>>;
	getById(id: string): Promise<Result<ExpenseCategory, AppError>>;
	create(input: ExpenseCategoryInput): Promise<Result<ExpenseCategory, AppError>>;
	update(id: string, input: ExpenseCategoryInput): Promise<Result<ExpenseCategory, AppError>>;
	delete(id: string): Promise<Result<void, AppError>>;
	reorder(orders: { id: string; displayOrder: number }[]): Promise<Result<void, AppError>>;
}
