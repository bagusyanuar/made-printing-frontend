import type { Result } from '$lib/shared/domain/types/result';
import type { AppError } from '$lib/shared/domain/errors/app-error';
import type { Supplier, SupplierInput } from './supplier.entity';

export interface SupplierRepository {
	list(): Promise<Result<Supplier[], AppError>>;
	getById(id: string): Promise<Result<Supplier, AppError>>;
	create(input: SupplierInput): Promise<Result<Supplier, AppError>>;
	update(id: string, input: SupplierInput): Promise<Result<Supplier, AppError>>;
	delete(id: string): Promise<Result<void, AppError>>;
	reorder(orders: { id: string; displayOrder: number }[]): Promise<Result<void, AppError>>;
}
