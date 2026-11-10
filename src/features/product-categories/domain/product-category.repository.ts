import type { Result } from '$lib/shared/domain/types/result';
import type { ProductCategory, ProductCategoryInput } from './product-category.entity';

export interface ProductCategoryRepository {
	list(): Promise<Result<ProductCategory[]>>;
	getById(id: string): Promise<Result<ProductCategory>>;
	create(input: ProductCategoryInput): Promise<Result<ProductCategory>>;
	update(id: string, input: ProductCategoryInput): Promise<Result<ProductCategory>>;
	delete(id: string): Promise<Result<void>>;
}
