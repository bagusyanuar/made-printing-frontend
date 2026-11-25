import type { Result } from '$lib/shared/domain/types/result';
import type { AppError } from '$lib/shared/domain/errors/app-error';
import type { Expense, ExpenseInput, ExpenseSettlePaymentInput } from './expense.entity';

export interface ExpenseRepository {
	list(): Promise<Result<Expense[], AppError>>;
	getById(id: string): Promise<Result<Expense, AppError>>;
	create(input: ExpenseInput): Promise<Result<Expense, AppError>>;
	settlePayment(id: string, input: ExpenseSettlePaymentInput): Promise<Result<Expense, AppError>>;
	approve(id: string): Promise<Result<Expense, AppError>>;
	cancel(id: string, reason: string): Promise<Result<Expense, AppError>>;
}
