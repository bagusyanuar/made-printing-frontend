import { MOCK_FLAGS } from '$lib/shared/infrastructure/di/mock-config';
import type { ProductCategoryRepository } from '../domain/product-category.repository';
import { productCategoryRepository } from '../infrastructure/product-category.repository.impl';
import { productCategoryRepositoryMock } from '../infrastructure/product-category.repository.mock';

export const productCategoryRepositoryInstance: ProductCategoryRepository =
	MOCK_FLAGS.productCategories ? productCategoryRepositoryMock : productCategoryRepository;
