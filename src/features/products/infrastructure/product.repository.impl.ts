import { z } from 'zod';
import { axiosClient } from '$lib/shared/infrastructure/api/axios-client';
import { parseApiResponse } from '$lib/shared/infrastructure/api/api-schema';
import { safeApiCall } from '$lib/shared/infrastructure/api/safe-api-call';
import type { Result } from '$lib/shared/domain/types/result';
import type { AppError } from '$lib/shared/domain/errors/app-error';
import type { Product, ProductInput } from '../domain/product.entity';
import type { ProductRepository } from '../domain/product.repository';
import { productDtoSchema } from './product.validator';
import { mapProductDtoToEntity, mapProductInputToDto } from './product.mapper';

export class ProductRepositoryImpl implements ProductRepository {
	async list(): Promise<Result<Product[], AppError>> {
		return safeApiCall(async () => {
			const response = await axiosClient.get('/products');
			const dtos = parseApiResponse(z.array(productDtoSchema), response.data);
			return dtos.map(mapProductDtoToEntity);
		});
	}

	async getById(id: string): Promise<Result<Product, AppError>> {
		return safeApiCall(async () => {
			const response = await axiosClient.get(`/products/${id}`);
			const dto = parseApiResponse(productDtoSchema, response.data);
			return mapProductDtoToEntity(dto);
		});
	}

	async create(input: ProductInput): Promise<Result<Product, AppError>> {
		return safeApiCall(async () => {
			const payload = mapProductInputToDto(input);
			const response = await axiosClient.post('/products', payload);
			const dto = parseApiResponse(productDtoSchema, response.data);
			return mapProductDtoToEntity(dto);
		});
	}

	async update(id: string, input: ProductInput): Promise<Result<Product, AppError>> {
		return safeApiCall(async () => {
			const payload = mapProductInputToDto(input);
			const response = await axiosClient.put(`/products/${id}`, payload);
			const dto = parseApiResponse(productDtoSchema, response.data);
			return mapProductDtoToEntity(dto);
		});
	}

	async delete(id: string): Promise<Result<void, AppError>> {
		return safeApiCall(async () => {
			await axiosClient.delete(`/products/${id}`);
		});
	}
}
