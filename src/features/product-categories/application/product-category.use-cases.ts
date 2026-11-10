import type { Result } from '$lib/shared/domain/types/result';
import type { AppError } from '$lib/shared/domain/errors/app-error';
import type { ProductCategory, ProductCategoryInput } from '../domain/product-category.entity';
import type { ProductCategoryRepository } from '../domain/product-category.repository';
import { productCategoryRepositoryInstance } from './product-category.container';

export interface ProductCategoryUseCases {
	list(): Promise<Result<ProductCategory[], AppError>>;
	getById(id: string): Promise<Result<ProductCategory, AppError>>;
	create(input: ProductCategoryInput): Promise<Result<ProductCategory, AppError>>;
	update(id: string, input: ProductCategoryInput): Promise<Result<ProductCategory, AppError>>;
	delete(id: string): Promise<Result<void, AppError>>;
}

export function createProductCategoryUseCases(
	repository: ProductCategoryRepository
): ProductCategoryUseCases {
	return {
		list: () => repository.list(),
		getById: (id: string) => repository.getById(id),
		create: (input: ProductCategoryInput) => repository.create(input),
		update: (id: string, input: ProductCategoryInput) => repository.update(id, input),
		delete: (id: string) => repository.delete(id)
	};
}

export const productCategoryUseCases = createProductCategoryUseCases(
	productCategoryRepositoryInstance
);
