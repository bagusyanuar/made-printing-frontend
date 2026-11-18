import { z } from 'zod';
import { axiosClient } from '$lib/shared/infrastructure/api/axios-client';
import { parseApiResponse } from '$lib/shared/infrastructure/api/api-schema';
import { safeApiCall } from '$lib/shared/infrastructure/api/safe-api-call';
import type { Result } from '$lib/shared/domain/types/result';
import type { AppError } from '$lib/shared/domain/errors/app-error';
import type { ExpenseCategory, ExpenseCategoryInput } from '../domain/expense-category.entity';
import type { ExpenseCategoryRepository } from '../domain/expense-category.repository';
import { expenseCategoryDtoSchema } from './expense-category.validator';
import {
	mapExpenseCategoryDtoToEntity,
	mapExpenseCategoryInputToDto
} from './expense-category.mapper';

export class ExpenseCategoryRepositoryImpl implements ExpenseCategoryRepository {
	async list(): Promise<Result<ExpenseCategory[], AppError>> {
		return safeApiCall(async () => {
			const response = await axiosClient.get('/expense-categories');
			const dtos = parseApiResponse(z.array(expenseCategoryDtoSchema), response.data);
			return dtos.map(mapExpenseCategoryDtoToEntity);
		});
	}

	async getById(id: string): Promise<Result<ExpenseCategory, AppError>> {
		return safeApiCall(async () => {
			const response = await axiosClient.get(`/expense-categories/${id}`);
			const dto = parseApiResponse(expenseCategoryDtoSchema, response.data);
			return mapExpenseCategoryDtoToEntity(dto);
		});
	}

	async create(input: ExpenseCategoryInput): Promise<Result<ExpenseCategory, AppError>> {
		return safeApiCall(async () => {
			const payload = mapExpenseCategoryInputToDto(input);
			const response = await axiosClient.post('/expense-categories', payload);
			const dto = parseApiResponse(expenseCategoryDtoSchema, response.data);
			return mapExpenseCategoryDtoToEntity(dto);
		});
	}

	async update(
		id: string,
		input: ExpenseCategoryInput
	): Promise<Result<ExpenseCategory, AppError>> {
		return safeApiCall(async () => {
			const payload = mapExpenseCategoryInputToDto(input);
			const response = await axiosClient.put(`/expense-categories/${id}`, payload);
			const dto = parseApiResponse(expenseCategoryDtoSchema, response.data);
			return mapExpenseCategoryDtoToEntity(dto);
		});
	}

	async delete(id: string): Promise<Result<void, AppError>> {
		return safeApiCall(async () => {
			await axiosClient.delete(`/expense-categories/${id}`);
		});
	}

	async reorder(orders: { id: string; displayOrder: number }[]): Promise<Result<void, AppError>> {
		return safeApiCall(async () => {
			await axiosClient.post('/expense-categories/reorder', {
				orders: orders.map((o) => ({ id: o.id, display_order: o.displayOrder }))
			});
		});
	}
}
