import type { Result } from '$lib/shared/domain/types/result';
import type { AppError } from '$lib/shared/domain/errors/app-error';
import type { Product, ProductInput } from '../domain/product.entity';
import type { ProductRepository } from '../domain/product.repository';
import { productRepositoryInstance } from './product.container';

export interface ProductUseCases {
	list(): Promise<Result<Product[], AppError>>;
	getById(id: string): Promise<Result<Product, AppError>>;
	create(input: ProductInput): Promise<Result<Product, AppError>>;
	update(id: string, input: ProductInput): Promise<Result<Product, AppError>>;
	delete(id: string): Promise<Result<void, AppError>>;
	reorder(orders: { id: string; displayOrder: number }[]): Promise<Result<void, AppError>>;
}

export function createProductUseCases(repository: ProductRepository): ProductUseCases {
	return {
		list: () => repository.list(),
		getById: (id: string) => repository.getById(id),
		create: (input: ProductInput) => repository.create(input),
		update: (id: string, input: ProductInput) => repository.update(id, input),
		delete: (id: string) => repository.delete(id),
		reorder: (orders: { id: string; displayOrder: number }[]) => repository.reorder(orders)
	};
}

export const productUseCases = createProductUseCases(productRepositoryInstance);
