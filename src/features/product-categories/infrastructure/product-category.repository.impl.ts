import { z } from 'zod';
import { axiosClient } from '$lib/shared/infrastructure/api/axios-client';
import { parseApiResponse } from '$lib/shared/infrastructure/api/api-schema';
import { safeApiCall } from '$lib/shared/infrastructure/api/safe-api-call';
import type { Result } from '$lib/shared/domain/types/result';
import type { ProductCategory, ProductCategoryInput } from '../domain/product-category.entity';
import type { ProductCategoryRepository } from '../domain/product-category.repository';
import { productCategoryDtoSchema } from './product-category.validator';
import {
	mapProductCategoryDtoToEntity,
	mapProductCategoryInputToDto
} from './product-category.mapper';

export class ProductCategoryRepositoryImpl implements ProductCategoryRepository {
	async list(): Promise<Result<ProductCategory[]>> {
		return safeApiCall(async () => {
			const response = await axiosClient.get('/product-categories');
			const dtos = parseApiResponse(z.array(productCategoryDtoSchema), response.data);
			return dtos.map(mapProductCategoryDtoToEntity);
		});
	}

	async getById(id: string): Promise<Result<ProductCategory>> {
		return safeApiCall(async () => {
			const response = await axiosClient.get(`/product-categories/${id}`);
			const dto = parseApiResponse(productCategoryDtoSchema, response.data);
			return mapProductCategoryDtoToEntity(dto);
		});
	}

	async create(input: ProductCategoryInput): Promise<Result<ProductCategory>> {
		return safeApiCall(async () => {
			const payload = mapProductCategoryInputToDto(input);
			const response = await axiosClient.post('/product-categories', payload);
			const dto = parseApiResponse(productCategoryDtoSchema, response.data);
			return mapProductCategoryDtoToEntity(dto);
		});
	}

	async update(id: string, input: ProductCategoryInput): Promise<Result<ProductCategory>> {
		return safeApiCall(async () => {
			const payload = mapProductCategoryInputToDto(input);
			const response = await axiosClient.put(`/product-categories/${id}`, payload);
			const dto = parseApiResponse(productCategoryDtoSchema, response.data);
			return mapProductCategoryDtoToEntity(dto);
		});
	}

	async delete(id: string): Promise<Result<void>> {
		return safeApiCall(async () => {
			await axiosClient.delete(`/product-categories/${id}`);
		});
	}

	async reorder(orders: { id: string; displayOrder: number }[]): Promise<Result<void>> {
		return safeApiCall(async () => {
			await axiosClient.post('/product-categories/reorder', {
				orders: orders.map((o) => ({ id: o.id, display_order: o.displayOrder }))
			});
		});
	}
}

export const productCategoryRepository = new ProductCategoryRepositoryImpl();
