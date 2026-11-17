import { z } from 'zod';
import { axiosClient } from '$lib/shared/infrastructure/api/axios-client';
import { parseApiResponse } from '$lib/shared/infrastructure/api/api-schema';
import { safeApiCall } from '$lib/shared/infrastructure/api/safe-api-call';
import type { Result } from '$lib/shared/domain/types/result';
import type { AppError } from '$lib/shared/domain/errors/app-error';
import type { Reseller, ResellerInput } from '../domain/reseller.entity';
import type { ResellerRepository } from '../domain/reseller.repository';
import { resellerDtoSchema } from './reseller.validator';
import { mapResellerDtoToEntity, mapResellerInputToDto } from './reseller.mapper';

export class ResellerRepositoryImpl implements ResellerRepository {
	async list(): Promise<Result<Reseller[], AppError>> {
		return safeApiCall(async () => {
			const response = await axiosClient.get('/resellers');
			const dtos = parseApiResponse(z.array(resellerDtoSchema), response.data);
			return dtos.map(mapResellerDtoToEntity);
		});
	}

	async getById(id: string): Promise<Result<Reseller, AppError>> {
		return safeApiCall(async () => {
			const response = await axiosClient.get(`/resellers/${id}`);
			const dto = parseApiResponse(resellerDtoSchema, response.data);
			return mapResellerDtoToEntity(dto);
		});
	}

	async create(input: ResellerInput): Promise<Result<Reseller, AppError>> {
		return safeApiCall(async () => {
			const payload = mapResellerInputToDto(input);
			const response = await axiosClient.post('/resellers', payload);
			const dto = parseApiResponse(resellerDtoSchema, response.data);
			return mapResellerDtoToEntity(dto);
		});
	}

	async update(id: string, input: ResellerInput): Promise<Result<Reseller, AppError>> {
		return safeApiCall(async () => {
			const payload = mapResellerInputToDto(input);
			const response = await axiosClient.put(`/resellers/${id}`, payload);
			const dto = parseApiResponse(resellerDtoSchema, response.data);
			return mapResellerDtoToEntity(dto);
		});
	}

	async delete(id: string): Promise<Result<void, AppError>> {
		return safeApiCall(async () => {
			await axiosClient.delete(`/resellers/${id}`);
		});
	}

	async adjustDeposit(id: string, amount: number, note?: string): Promise<Result<Reseller, AppError>> {
		return safeApiCall(async () => {
			const response = await axiosClient.post(`/resellers/${id}/deposit`, { amount, note });
			const dto = parseApiResponse(resellerDtoSchema, response.data);
			return mapResellerDtoToEntity(dto);
		});
	}

	async reorder(orders: { id: string; displayOrder: number }[]): Promise<Result<void, AppError>> {
		return safeApiCall(async () => {
			await axiosClient.post('/resellers/reorder', {
				orders: orders.map((o) => ({ id: o.id, display_order: o.displayOrder }))
			});
		});
	}
}
