import { z } from 'zod';
import { axiosClient } from '$lib/shared/infrastructure/api/axios-client';
import { parseApiResponse } from '$lib/shared/infrastructure/api/api-schema';
import { safeApiCall } from '$lib/shared/infrastructure/api/safe-api-call';
import type { Result } from '$lib/shared/domain/types/result';
import type { AppError } from '$lib/shared/domain/errors/app-error';
import type { Expense, ExpenseInput, ExpenseSettlePaymentInput } from '../domain/expense.entity';
import type { ExpenseRepository } from '../domain/expense.repository';
import { expenseDtoSchema, expenseListResponseDtoSchema } from './expense.validator';
import {
	mapExpenseDtoToEntity,
	mapExpenseInputToDto,
	mapSettlePaymentInputToDto
} from './expense.mapper';

export class ExpenseRepositoryImpl implements ExpenseRepository {
	async list(): Promise<Result<Expense[], AppError>> {
		return safeApiCall(async () => {
			const response = await axiosClient.get('/expenses');
			const dtos = parseApiResponse(expenseListResponseDtoSchema, response.data);
			return dtos.map(mapExpenseDtoToEntity);
		});
	}

	async getById(id: string): Promise<Result<Expense, AppError>> {
		return safeApiCall(async () => {
			const response = await axiosClient.get(`/expenses/${id}`);
			const dto = parseApiResponse(expenseDtoSchema, response.data);
			return mapExpenseDtoToEntity(dto);
		});
	}

	async create(input: ExpenseInput): Promise<Result<Expense, AppError>> {
		return safeApiCall(async () => {
			const payload = mapExpenseInputToDto(input);
			const response = await axiosClient.post('/expenses', payload);
			const dto = parseApiResponse(expenseDtoSchema, response.data);
			return mapExpenseDtoToEntity(dto);
		});
	}

	async settlePayment(
		id: string,
		input: ExpenseSettlePaymentInput
	): Promise<Result<Expense, AppError>> {
		return safeApiCall(async () => {
			const payload = mapSettlePaymentInputToDto(input);
			const response = await axiosClient.post(`/expenses/${id}/payments`, payload);
			const dto = parseApiResponse(expenseDtoSchema, response.data);
			return mapExpenseDtoToEntity(dto);
		});
	}

	async approve(id: string): Promise<Result<Expense, AppError>> {
		return safeApiCall(async () => {
			const response = await axiosClient.patch(`/expenses/${id}/approve`);
			const dto = parseApiResponse(expenseDtoSchema, response.data);
			return mapExpenseDtoToEntity(dto);
		});
	}

	async cancel(id: string, reason: string): Promise<Result<Expense, AppError>> {
		return safeApiCall(async () => {
			const response = await axiosClient.post(`/expenses/${id}/cancel`, {
				cancel_reason: z.string().parse(reason)
			});
			const dto = parseApiResponse(expenseDtoSchema, response.data);
			return mapExpenseDtoToEntity(dto);
		});
	}
}
