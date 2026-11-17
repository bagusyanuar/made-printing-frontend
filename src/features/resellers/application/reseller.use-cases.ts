import type { Result } from '$lib/shared/domain/types/result';
import type { AppError } from '$lib/shared/domain/errors/app-error';
import type { Reseller, ResellerInput } from '../domain/reseller.entity';
import type { ResellerRepository } from '../domain/reseller.repository';
import { resellerRepositoryInstance } from './reseller.container';

export interface ResellerUseCases {
	list(): Promise<Result<Reseller[], AppError>>;
	getById(id: string): Promise<Result<Reseller, AppError>>;
	create(input: ResellerInput): Promise<Result<Reseller, AppError>>;
	update(id: string, input: ResellerInput): Promise<Result<Reseller, AppError>>;
	delete(id: string): Promise<Result<void, AppError>>;
	adjustDeposit(id: string, amount: number, note?: string): Promise<Result<Reseller, AppError>>;
	reorder(orders: { id: string; displayOrder: number }[]): Promise<Result<void, AppError>>;
}

export function createResellerUseCases(repository: ResellerRepository): ResellerUseCases {
	return {
		list: () => repository.list(),
		getById: (id: string) => repository.getById(id),
		create: (input: ResellerInput) => repository.create(input),
		update: (id: string, input: ResellerInput) => repository.update(id, input),
		delete: (id: string) => repository.delete(id),
		adjustDeposit: (id: string, amount: number, note?: string) =>
			repository.adjustDeposit(id, amount, note),
		reorder: (orders: { id: string; displayOrder: number }[]) => repository.reorder(orders)
	};
}

export const resellerUseCases = createResellerUseCases(resellerRepositoryInstance);
