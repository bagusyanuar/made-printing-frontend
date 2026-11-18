import { MOCK_FLAGS } from '$lib/shared/infrastructure/di/mock-config';
import type { ExpenseCategoryRepository } from '../domain/expense-category.repository';
import { ExpenseCategoryRepositoryImpl } from '../infrastructure/expense-category.repository.impl';
import { ExpenseCategoryRepositoryMock } from '../infrastructure/expense-category.repository.mock';

const expenseCategoryRepositoryImpl = new ExpenseCategoryRepositoryImpl();
const expenseCategoryRepositoryMock = new ExpenseCategoryRepositoryMock();

export const expenseCategoryRepositoryInstance: ExpenseCategoryRepository =
	MOCK_FLAGS.expenseCategories ? expenseCategoryRepositoryMock : expenseCategoryRepositoryImpl;
