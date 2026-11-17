import { MOCK_FLAGS } from '$lib/shared/infrastructure/di/mock-config';
import type { ResellerRepository } from '../domain/reseller.repository';
import { ResellerRepositoryImpl } from '../infrastructure/reseller.repository.impl';
import { ResellerRepositoryMock } from '../infrastructure/reseller.repository.mock';

const resellerRepositoryImpl = new ResellerRepositoryImpl();
const resellerRepositoryMock = new ResellerRepositoryMock();

export const resellerRepositoryInstance: ResellerRepository = MOCK_FLAGS.resellers
	? resellerRepositoryMock
	: resellerRepositoryImpl;
