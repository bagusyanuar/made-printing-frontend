import type { Result } from '$lib/shared/domain/types/result';
import type { AppError } from '$lib/shared/domain/errors/app-error';
import { Result as ResultClass } from '$lib/shared/domain/types/result';
import { NotFoundError, ConflictError } from '$lib/shared/domain/errors/app-error';
import type { Product, ProductInput } from '../domain/product.entity';
import type { ProductRepository } from '../domain/product.repository';
import { generateProductCode } from '../domain/product.entity';

const INITIAL_PRODUCTS: Product[] = [
	{
		id: 'prod-001',
		code: 'PRD-LGF-001',
		name: 'Banner Flexy Outdoor Standar',
		categoryId: 'cat-001',
		categoryName: 'Large Format',
		baseMaterial: 'Flexy 280 gsm',
		calculationType: 'square_meter',
		basePrice: 18000,
		tierPricing: {
			retailPrice: 18000,
			resellerPrice: 15000,
			silverPrice: 17000,
			goldPrice: 16000
		},
		assignedAttributes: [
			{
				attributeId: 'attr-1',
				attributeName: 'Sisi Cetak',
				selectedVariantIds: ['var-1-1'],
				isRequired: true
			}
		],
		minOrderQty: 1,
		leadTimeHours: 2,
		description: 'Banner outdoor standar tahan cuaca untuk spanduk, baliho, dan event.',
		isActive: true,
		createdAt: '2026-01-10T08:00:00.000Z',
		updatedAt: '2026-01-10T08:00:00.000Z'
	},
	{
		id: 'prod-002',
		code: 'PRD-LGF-002',
		name: 'Spanduk Flexy Korea Tebal',
		categoryId: 'cat-001',
		categoryName: 'Large Format',
		baseMaterial: 'Korcin 440 gsm',
		calculationType: 'square_meter',
		basePrice: 35000,
		tierPricing: {
			retailPrice: 35000,
			resellerPrice: 30000,
			silverPrice: 33000,
			goldPrice: 31500
		},
		assignedAttributes: [],
		minOrderQty: 1,
		leadTimeHours: 3,
		description: 'Bahan spanduk tebal serat halus, tahan angin kencang dan tidak mudah sobek.',
		isActive: true,
		createdAt: '2026-01-11T09:00:00.000Z',
		updatedAt: '2026-01-11T09:00:00.000Z'
	},
	{
		id: 'prod-003',
		code: 'PRD-LGF-003',
		name: 'Banner Albatros Indoor Resolusi Tinggi',
		categoryId: 'cat-001',
		categoryName: 'Large Format',
		baseMaterial: 'Albatros 180 gsm',
		calculationType: 'square_meter',
		basePrice: 45000,
		tierPricing: {
			retailPrice: 45000,
			resellerPrice: 38000,
			silverPrice: 42000,
			goldPrice: 40000
		},
		assignedAttributes: [],
		minOrderQty: 1,
		leadTimeHours: 4,
		description: 'Media indoor tanpa pori, hasil cetak tajam untuk Roll Up Banner & X-Banner.',
		isActive: true,
		createdAt: '2026-01-12T10:00:00.000Z',
		updatedAt: '2026-01-12T10:00:00.000Z'
	},
	{
		id: 'prod-004',
		code: 'PRD-A3-010',
		name: 'Sticker Vinyl Glossy A3+ Kiss Cut',
		categoryId: 'cat-002',
		categoryName: 'Digital A3+',
		baseMaterial: 'Vinyl Putih A3+',
		calculationType: 'sheet',
		basePrice: 12500,
		tierPricing: {
			retailPrice: 12500,
			resellerPrice: 9500,
			silverPrice: 11500,
			goldPrice: 10500
		},
		assignedAttributes: [
			{
				attributeId: 'attr-2',
				attributeName: 'Finishing Laminasi',
				selectedVariantIds: ['var-2-1', 'var-2-2'],
				isRequired: false
			}
		],
		minOrderQty: 1,
		leadTimeHours: 2,
		description: 'Stiker anti-air laminasi glossy dengan pemotongan setengah putus (kiss cut).',
		isActive: true,
		createdAt: '2026-01-13T11:00:00.000Z',
		updatedAt: '2026-01-13T11:00:00.000Z'
	},
	{
		id: 'prod-005',
		code: 'PRD-A3-011',
		name: 'Kartu Nama Art Carton 260g (2 Sisi)',
		categoryId: 'cat-002',
		categoryName: 'Digital A3+',
		baseMaterial: 'Art Carton 260 gsm',
		calculationType: 'sheet',
		basePrice: 35000,
		tierPricing: {
			retailPrice: 35000,
			resellerPrice: 28000,
			silverPrice: 32000,
			goldPrice: 30000
		},
		assignedAttributes: [],
		minOrderQty: 1,
		leadTimeHours: 3,
		description: 'Paket box kartu nama 100 pcs cetak bolak-balik full color termasuk box mika.',
		isActive: true,
		createdAt: '2026-01-14T13:00:00.000Z',
		updatedAt: '2026-01-14T13:00:00.000Z'
	},
	{
		id: 'prod-006',
		code: 'PRD-A3-012',
		name: 'Brosur Art Paper 150g A4 Lipat 3',
		categoryId: 'cat-002',
		categoryName: 'Digital A3+',
		baseMaterial: 'Art Paper 150 gsm',
		calculationType: 'sheet',
		basePrice: 4500,
		tierPricing: {
			retailPrice: 4500,
			resellerPrice: 3200,
			silverPrice: 4000,
			goldPrice: 3600
		},
		assignedAttributes: [],
		minOrderQty: 25,
		leadTimeHours: 4,
		description: 'Brosur promosi glossy cetak 2 sisi full color dengan rel lipat 3 presisi.',
		isActive: true,
		createdAt: '2026-01-15T14:00:00.000Z',
		updatedAt: '2026-01-15T14:00:00.000Z'
	},
	{
		id: 'prod-007',
		code: 'PRD-DTF-001',
		name: 'Sablon DTF Meteran Premium',
		categoryId: 'cat-003',
		categoryName: 'DTF Printing',
		baseMaterial: 'PET Film 60cm + Powder TPU',
		calculationType: 'meter_run',
		basePrice: 45000,
		tierPricing: {
			retailPrice: 45000,
			resellerPrice: 36000,
			silverPrice: 42000,
			goldPrice: 39000
		},
		assignedAttributes: [],
		minOrderQty: 1,
		leadTimeHours: 2,
		description: 'Print sablon film lebar cetak 58cm, tepung TPU elastis anti retak.',
		isActive: true,
		createdAt: '2026-01-16T15:00:00.000Z',
		updatedAt: '2026-01-16T15:00:00.000Z'
	},
	{
		id: 'prod-008',
		code: 'PRD-UV-001',
		name: 'Gantungan Kunci Akrilik UV Print Custom',
		categoryId: 'cat-004',
		categoryName: 'Merchandise',
		baseMaterial: 'Akrilik Bening 3mm',
		calculationType: 'piece',
		basePrice: 7500,
		tierPricing: {
			retailPrice: 7500,
			resellerPrice: 5500,
			silverPrice: 6800,
			goldPrice: 6200
		},
		assignedAttributes: [],
		minOrderQty: 10,
		leadTimeHours: 6,
		description: 'Gantungan kunci potong laser sesuai pola desain dengan cetak tinta UV timbul.',
		isActive: true,
		createdAt: '2026-01-17T16:00:00.000Z',
		updatedAt: '2026-01-17T16:00:00.000Z'
	}
];

export class ProductRepositoryMock implements ProductRepository {
	private items: Product[] = [...INITIAL_PRODUCTS];

	async list(): Promise<Result<Product[], AppError>> {
		await new Promise((r) => setTimeout(r, 120));
		return ResultClass.ok([...this.items]);
	}

	async getById(id: string): Promise<Result<Product, AppError>> {
		await new Promise((r) => setTimeout(r, 80));
		const item = this.items.find((p) => p.id === id);
		if (!item) {
			return ResultClass.error(new NotFoundError(`Produk dengan ID "${id}" tidak ditemukan.`));
		}
		return ResultClass.ok({ ...item });
	}

	async create(input: ProductInput): Promise<Result<Product, AppError>> {
		await new Promise((r) => setTimeout(r, 150));
		const code = input.code?.trim() || generateProductCode(input.name);
		const existing = this.items.find((p) => p.code.toLowerCase() === code.toLowerCase());
		if (existing) {
			return ResultClass.error(new ConflictError(`Kode produk "${code}" sudah digunakan.`));
		}

		const now = new Date().toISOString();
		const newProduct: Product = {
			id: `prod-${Date.now()}`,
			code,
			name: input.name.trim(),
			categoryId: input.categoryId,
			categoryName: input.categoryName || 'Tanpa Kategori',
			baseMaterial: input.baseMaterial?.trim() || null,
			calculationType: input.calculationType,
			basePrice: input.basePrice,
			tierPricing: input.tierPricing ?? null,
			assignedAttributes: input.assignedAttributes ?? null,
			minOrderQty: input.minOrderQty ?? 1,
			leadTimeHours: input.leadTimeHours ?? null,
			description: input.description?.trim() || null,
			isActive: input.isActive ?? true,
			createdAt: now,
			updatedAt: now
		};

		this.items.unshift(newProduct);
		return ResultClass.ok({ ...newProduct });
	}

	async update(id: string, input: ProductInput): Promise<Result<Product, AppError>> {
		await new Promise((r) => setTimeout(r, 150));
		const index = this.items.findIndex((p) => p.id === id);
		if (index === -1) {
			return ResultClass.error(new NotFoundError(`Produk dengan ID "${id}" tidak ditemukan.`));
		}

		if (input.code) {
			const duplicate = this.items.find(
				(p) => p.id !== id && p.code.toLowerCase() === input.code!.toLowerCase()
			);
			if (duplicate) {
				return ResultClass.error(new ConflictError(`Kode produk "${input.code}" sudah digunakan.`));
			}
		}

		const current = this.items[index];
		const updated: Product = {
			...current,
			code: input.code?.trim() || current.code,
			name: input.name.trim(),
			categoryId: input.categoryId,
			categoryName: input.categoryName || current.categoryName,
			baseMaterial: input.baseMaterial?.trim() || null,
			calculationType: input.calculationType,
			basePrice: input.basePrice,
			tierPricing: input.tierPricing !== undefined ? input.tierPricing : current.tierPricing,
			assignedAttributes:
				input.assignedAttributes !== undefined
					? input.assignedAttributes
					: current.assignedAttributes,
			minOrderQty: input.minOrderQty ?? current.minOrderQty,
			leadTimeHours:
				input.leadTimeHours !== undefined ? input.leadTimeHours : current.leadTimeHours,
			description: input.description?.trim() || null,
			isActive: input.isActive !== undefined ? input.isActive : current.isActive,
			updatedAt: new Date().toISOString()
		};

		this.items[index] = updated;
		return ResultClass.ok({ ...updated });
	}

	async delete(id: string): Promise<Result<void, AppError>> {
		await new Promise((r) => setTimeout(r, 120));
		const index = this.items.findIndex((p) => p.id === id);
		if (index === -1) {
			return ResultClass.error(new NotFoundError(`Produk dengan ID "${id}" tidak ditemukan.`));
		}
		this.items.splice(index, 1);
		return ResultClass.ok(undefined);
	}
}
