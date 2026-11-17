import { MOCK_FLAGS } from '$lib/shared/infrastructure/di/mock-config';
import type { SupplierRepository } from '../domain/supplier.repository';
import { SupplierRepositoryImpl } from '../infrastructure/supplier.repository.impl';
import { SupplierRepositoryMock } from '../infrastructure/supplier.repository.mock';

const supplierRepositoryImpl = new SupplierRepositoryImpl();
const supplierRepositoryMock = new SupplierRepositoryMock();

export const supplierRepositoryInstance: SupplierRepository = MOCK_FLAGS.suppliers
	? supplierRepositoryMock
	: supplierRepositoryImpl;
