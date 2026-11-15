import type { Result } from '$lib/shared/domain/types/result';
import type { AppError } from '$lib/shared/domain/errors/app-error';
import type {
	ProductAttribute,
	ProductAttributeInput,
	ProductAttributeVariant,
	ProductAttributeVariantInput
} from './attribute-variant.entity';

export interface AttributeVariantRepository {
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
