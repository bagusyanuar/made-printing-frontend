import type { Result } from '$lib/shared/domain/types/result';
import type { AppError } from '$lib/shared/domain/errors/app-error';
import type { Product, ProductInput } from './product.entity';

export interface ProductRepository {
	list(): Promise<Result<Product[], AppError>>;
	getById(id: string): Promise<Result<Product, AppError>>;
	create(input: ProductInput): Promise<Result<Product, AppError>>;
	update(id: string, input: ProductInput): Promise<Result<Product, AppError>>;
	delete(id: string): Promise<Result<void, AppError>>;
	reorder(orders: { id: string; displayOrder: number }[]): Promise<Result<void, AppError>>;
}
