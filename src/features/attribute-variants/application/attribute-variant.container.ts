import { MOCK_FLAGS } from '$lib/shared/infrastructure/di/mock-config';
import type { AttributeVariantRepository } from '../domain/attribute-variant.repository';
import { attributeVariantRepository } from '../infrastructure/attribute-variant.repository.impl';
import { attributeVariantRepositoryMock } from '../infrastructure/attribute-variant.repository.mock';

export const attributeVariantRepositoryInstance: AttributeVariantRepository =
	MOCK_FLAGS.attributeVariants ? attributeVariantRepositoryMock : attributeVariantRepository;
