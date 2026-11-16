import { MOCK_FLAGS } from '$lib/shared/infrastructure/di/mock-config';
import type { ProductRepository } from '../domain/product.repository';
import { ProductRepositoryImpl } from '../infrastructure/product.repository.impl';
import { ProductRepositoryMock } from '../infrastructure/product.repository.mock';

const productRepositoryImpl = new ProductRepositoryImpl();
const productRepositoryMock = new ProductRepositoryMock();

export const productRepositoryInstance: ProductRepository = MOCK_FLAGS.products
	? productRepositoryMock
	: productRepositoryImpl;
