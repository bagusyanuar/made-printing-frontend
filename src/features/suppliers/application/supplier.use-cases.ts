import type { Result } from '$lib/shared/domain/types/result';
import type { AppError } from '$lib/shared/domain/errors/app-error';
import type { Supplier, SupplierInput } from '../domain/supplier.entity';
import type { SupplierRepository } from '../domain/supplier.repository';
import { supplierRepositoryInstance } from './supplier.container';

export interface SupplierUseCases {
	list(): Promise<Result<Supplier[], AppError>>;
	getById(id: string): Promise<Result<Supplier, AppError>>;
	create(input: SupplierInput): Promise<Result<Supplier, AppError>>;
	update(id: string, input: SupplierInput): Promise<Result<Supplier, AppError>>;
	delete(id: string): Promise<Result<void, AppError>>;
	reorder(orders: { id: string; displayOrder: number }[]): Promise<Result<void, AppError>>;
}

export function createSupplierUseCases(repository: SupplierRepository): SupplierUseCases {
	return {
		list: () => repository.list(),
		getById: (id: string) => repository.getById(id),
		create: (input: SupplierInput) => repository.create(input),
		update: (id: string, input: SupplierInput) => repository.update(id, input),
		delete: (id: string) => repository.delete(id),
		reorder: (orders: { id: string; displayOrder: number }[]) => repository.reorder(orders)
	};
}

export const supplierUseCases = createSupplierUseCases(supplierRepositoryInstance);
