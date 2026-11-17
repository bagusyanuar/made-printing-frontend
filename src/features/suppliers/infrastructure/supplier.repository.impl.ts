import { z } from 'zod';
import { axiosClient } from '$lib/shared/infrastructure/api/axios-client';
import { parseApiResponse } from '$lib/shared/infrastructure/api/api-schema';
import { safeApiCall } from '$lib/shared/infrastructure/api/safe-api-call';
import type { Result } from '$lib/shared/domain/types/result';
import type { AppError } from '$lib/shared/domain/errors/app-error';
import type { Supplier, SupplierInput } from '../domain/supplier.entity';
import type { SupplierRepository } from '../domain/supplier.repository';
import { supplierDtoSchema } from './supplier.validator';
import { mapSupplierDtoToEntity, mapSupplierInputToDto } from './supplier.mapper';

export class SupplierRepositoryImpl implements SupplierRepository {
	async list(): Promise<Result<Supplier[], AppError>> {
		return safeApiCall(async () => {
			const response = await axiosClient.get('/suppliers');
			const dtos = parseApiResponse(z.array(supplierDtoSchema), response.data);
			return dtos.map(mapSupplierDtoToEntity);
		});
	}

	async getById(id: string): Promise<Result<Supplier, AppError>> {
		return safeApiCall(async () => {
			const response = await axiosClient.get(`/suppliers/${id}`);
			const dto = parseApiResponse(supplierDtoSchema, response.data);
			return mapSupplierDtoToEntity(dto);
		});
	}

	async create(input: SupplierInput): Promise<Result<Supplier, AppError>> {
		return safeApiCall(async () => {
			const payload = mapSupplierInputToDto(input);
			const response = await axiosClient.post('/suppliers', payload);
			const dto = parseApiResponse(supplierDtoSchema, response.data);
			return mapSupplierDtoToEntity(dto);
		});
	}

	async update(id: string, input: SupplierInput): Promise<Result<Supplier, AppError>> {
		return safeApiCall(async () => {
			const payload = mapSupplierInputToDto(input);
			const response = await axiosClient.put(`/suppliers/${id}`, payload);
			const dto = parseApiResponse(supplierDtoSchema, response.data);
			return mapSupplierDtoToEntity(dto);
		});
	}

	async delete(id: string): Promise<Result<void, AppError>> {
		return safeApiCall(async () => {
			await axiosClient.delete(`/suppliers/${id}`);
		});
	}

	async reorder(orders: { id: string; displayOrder: number }[]): Promise<Result<void, AppError>> {
		return safeApiCall(async () => {
			await axiosClient.post('/suppliers/reorder', {
				orders: orders.map((o) => ({ id: o.id, display_order: o.displayOrder }))
			});
		});
	}
}
