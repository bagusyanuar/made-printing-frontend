import { z } from 'zod';
import { axiosClient } from '$lib/shared/infrastructure/api/axios-client';
import { parseApiResponse } from '$lib/shared/infrastructure/api/api-schema';
import { safeApiCall } from '$lib/shared/infrastructure/api/safe-api-call';
import type { Result } from '$lib/shared/domain/types/result';
import type { AppError } from '$lib/shared/domain/errors/app-error';
import type {
	ProductAttribute,
	ProductAttributeInput,
	ProductAttributeVariant,
	ProductAttributeVariantInput
} from '../domain/attribute-variant.entity';
import type { AttributeVariantRepository } from '../domain/attribute-variant.repository';
import {
	productAttributeDtoSchema,
	productAttributeVariantDtoSchema
} from './attribute-variant.validator';
import {
	mapAttributeDtoToEntity,
	mapAttributeInputToDto,
	mapVariantDtoToEntity,
	mapVariantInputToDto
} from './attribute-variant.mapper';

export class AttributeVariantRepositoryImpl implements AttributeVariantRepository {
	async list(): Promise<Result<ProductAttribute[], AppError>> {
		return safeApiCall(async () => {
			const response = await axiosClient.get('/product-attributes');
			const dtos = parseApiResponse(z.array(productAttributeDtoSchema), response.data);
			return dtos.map(mapAttributeDtoToEntity);
		});
	}

	async getById(id: string): Promise<Result<ProductAttribute, AppError>> {
		return safeApiCall(async () => {
			const response = await axiosClient.get(`/product-attributes/${id}`);
			const dto = parseApiResponse(productAttributeDtoSchema, response.data);
			return mapAttributeDtoToEntity(dto);
		});
	}

	async createAttribute(
		input: ProductAttributeInput
	): Promise<Result<ProductAttribute, AppError>> {
		return safeApiCall(async () => {
			const payload = mapAttributeInputToDto(input);
			const response = await axiosClient.post('/product-attributes', payload);
			const dto = parseApiResponse(productAttributeDtoSchema, response.data);
			return mapAttributeDtoToEntity(dto);
		});
	}

	async updateAttribute(
		id: string,
		input: ProductAttributeInput
	): Promise<Result<ProductAttribute, AppError>> {
		return safeApiCall(async () => {
			const payload = mapAttributeInputToDto(input);
			const response = await axiosClient.put(`/product-attributes/${id}`, payload);
			const dto = parseApiResponse(productAttributeDtoSchema, response.data);
			return mapAttributeDtoToEntity(dto);
		});
	}

	async deleteAttribute(id: string): Promise<Result<void, AppError>> {
		return safeApiCall(async () => {
			await axiosClient.delete(`/product-attributes/${id}`);
		});
	}

	async createVariant(
		attributeId: string,
		input: ProductAttributeVariantInput
	): Promise<Result<ProductAttributeVariant, AppError>> {
		return safeApiCall(async () => {
			const payload = mapVariantInputToDto(input);
			const response = await axiosClient.post(
				`/product-attributes/${attributeId}/variants`,
				payload
			);
			const dto = parseApiResponse(productAttributeVariantDtoSchema, response.data);
			return mapVariantDtoToEntity(dto);
		});
	}

	async updateVariant(
		id: string,
		input: ProductAttributeVariantInput
	): Promise<Result<ProductAttributeVariant, AppError>> {
		return safeApiCall(async () => {
			const payload = mapVariantInputToDto(input);
			const response = await axiosClient.put(`/product-attribute-variants/${id}`, payload);
			const dto = parseApiResponse(productAttributeVariantDtoSchema, response.data);
			return mapVariantDtoToEntity(dto);
		});
	}

	async deleteVariant(id: string): Promise<Result<void, AppError>> {
		return safeApiCall(async () => {
			await axiosClient.delete(`/product-attribute-variants/${id}`);
		});
	}

	async reorderVariants(
		attributeId: string,
		variantIds: string[]
	): Promise<Result<ProductAttributeVariant[], AppError>> {
		return safeApiCall(async () => {
			const response = await axiosClient.put(
				`/product-attributes/${attributeId}/variants/reorder`,
				{ variant_ids: variantIds }
			);
			const dtos = parseApiResponse(z.array(productAttributeVariantDtoSchema), response.data);
			return dtos.map(mapVariantDtoToEntity);
		});
	}
}

export const attributeVariantRepository = new AttributeVariantRepositoryImpl();
