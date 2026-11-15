import type { Result } from '$lib/shared/domain/types/result';
import type { AppError } from '$lib/shared/domain/errors/app-error';
import type {
	ProductAttribute,
	ProductAttributeInput,
	ProductAttributeVariant,
	ProductAttributeVariantInput
} from '../domain/attribute-variant.entity';
import type { AttributeVariantRepository } from '../domain/attribute-variant.repository';
import { attributeVariantRepositoryInstance } from './attribute-variant.container';

export interface AttributeVariantUseCases {
	list(): Promise<Result<ProductAttribute[], AppError>>;
	getById(id: string): Promise<Result<ProductAttribute, AppError>>;
	createAttribute(input: ProductAttributeInput): Promise<Result<ProductAttribute, AppError>>;
	updateAttribute(
		id: string,
		input: ProductAttributeInput
	): Promise<Result<ProductAttribute, AppError>>;
	deleteAttribute(id: string): Promise<Result<void, AppError>>;
	createVariant(
		attributeId: string,
		input: ProductAttributeVariantInput
	): Promise<Result<ProductAttributeVariant, AppError>>;
	updateVariant(
		id: string,
		input: ProductAttributeVariantInput
	): Promise<Result<ProductAttributeVariant, AppError>>;
	deleteVariant(id: string): Promise<Result<void, AppError>>;
	reorderVariants(
		attributeId: string,
		variantIds: string[]
	): Promise<Result<ProductAttributeVariant[], AppError>>;
}

export function createAttributeVariantUseCases(
	repository: AttributeVariantRepository
): AttributeVariantUseCases {
	return {
		list: () => repository.list(),
		getById: (id: string) => repository.getById(id),
		createAttribute: (input: ProductAttributeInput) => repository.createAttribute(input),
		updateAttribute: (id: string, input: ProductAttributeInput) =>
			repository.updateAttribute(id, input),
		deleteAttribute: (id: string) => repository.deleteAttribute(id),
		createVariant: (attributeId: string, input: ProductAttributeVariantInput) =>
			repository.createVariant(attributeId, input),
		updateVariant: (id: string, input: ProductAttributeVariantInput) =>
			repository.updateVariant(id, input),
		deleteVariant: (id: string) => repository.deleteVariant(id),
		reorderVariants: (attributeId: string, variantIds: string[]) =>
			repository.reorderVariants(attributeId, variantIds)
	};
}

export const attributeVariantUseCases = createAttributeVariantUseCases(
	attributeVariantRepositoryInstance
);
