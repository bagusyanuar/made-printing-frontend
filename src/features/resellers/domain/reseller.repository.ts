import type { Result } from '$lib/shared/domain/types/result';
import type { AppError } from '$lib/shared/domain/errors/app-error';
import type { Reseller, ResellerInput } from './reseller.entity';

export interface ResellerRepository {
	list(): Promise<Result<Reseller[], AppError>>;
	getById(id: string): Promise<Result<Reseller, AppError>>;
	create(input: ResellerInput): Promise<Result<Reseller, AppError>>;
	update(id: string, input: ResellerInput): Promise<Result<Reseller, AppError>>;
	delete(id: string): Promise<Result<void, AppError>>;
	adjustDeposit(id: string, amount: number, note?: string): Promise<Result<Reseller, AppError>>;
	reorder(orders: { id: string; displayOrder: number }[]): Promise<Result<void, AppError>>;
}
