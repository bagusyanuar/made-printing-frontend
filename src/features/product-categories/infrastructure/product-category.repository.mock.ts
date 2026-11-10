import type { Result } from '$lib/shared/domain/types/result';
import { Result as Res } from '$lib/shared/domain/types/result';
import { NotFoundError, ConflictError } from '$lib/shared/domain/errors/app-error';
import type { ProductCategory, ProductCategoryInput } from '../domain/product-category.entity';
import type { ProductCategoryRepository } from '../domain/product-category.repository';

const delay = (ms = 200) => new Promise((resolve) => setTimeout(resolve, ms));

const INITIAL_CATEGORIES: ProductCategory[] = [
	{
		id: 'cat-1',
		code: 'LF-OUT',
		name: 'Large Format Outdoor',
		calculationType: 'square_meter',
		description: 'Spanduk, Baliho, Banner Flexy Standard/Korcin tahan cuaca luar ruangan',
		isActive: true,
		createdAt: '2026-01-10T08:00:00.000Z',
		updatedAt: '2026-01-10T08:00:00.000Z'
	},
	{
		id: 'cat-2',
		code: 'LF-IN',
		name: 'Large Format Indoor & Display',
		calculationType: 'square_meter',
		description:
			'Albatros, Luster, Easy Banner untuk X-Banner, Roll Up, Poster Display resolusi tinggi',
		isActive: true,
		createdAt: '2026-01-11T09:30:00.000Z',
		updatedAt: '2026-01-11T09:30:00.000Z'
	},
	{
		id: 'cat-3',
		code: 'A3-SHEET',
		name: 'Digital Printing A3+ Lembaran',
		calculationType: 'sheet',
		description: 'Brosur, Kartu Nama, Flyer, Sertifikat, Stiker A3+ (Chromo & Vinyl)',
		isActive: true,
		createdAt: '2026-01-12T10:15:00.000Z',
		updatedAt: '2026-01-12T10:15:00.000Z'
	},
	{
		id: 'cat-4',
		code: 'DTF-ROLL',
		name: 'Sablon Digital DTF & Sublimasi',
		calculationType: 'meter_run',
		description: 'Cetak film transfer sablon kaos roll 58/60cm full color tinta tekstil',
		isActive: true,
		createdAt: '2026-01-13T11:00:00.000Z',
		updatedAt: '2026-01-13T11:00:00.000Z'
	},
	{
		id: 'cat-5',
		code: 'MERCH-UV',
		name: 'Merchandise & Flatbed UV',
		calculationType: 'piece',
		description: 'Gantungan kunci akrilik, Tumbler grafir/UV, ID Card PVC, Plakat',
		isActive: true,
		createdAt: '2026-01-14T13:45:00.000Z',
		updatedAt: '2026-01-14T13:45:00.000Z'
	}
];

export class ProductCategoryRepositoryMock implements ProductCategoryRepository {
	#categories: ProductCategory[] = [...INITIAL_CATEGORIES];

	async list(): Promise<Result<ProductCategory[]>> {
		await delay();
		return Res.ok([...this.#categories]);
	}

	async getById(id: string): Promise<Result<ProductCategory>> {
		await delay();
		const item = this.#categories.find((c) => c.id === id);
		if (!item) {
			return Res.error(new NotFoundError('Kategori produk tidak ditemukan'));
		}
		return Res.ok({ ...item });
	}

	async create(input: ProductCategoryInput): Promise<Result<ProductCategory>> {
		await delay();
		const normalizedCode = input.code.trim().toUpperCase();
		if (this.#categories.some((c) => c.code === normalizedCode)) {
			return Res.error(new ConflictError(`Kode kategori "${normalizedCode}" sudah digunakan`));
		}

		const now = new Date().toISOString();
		const newItem: ProductCategory = {
			id: `cat-${Date.now()}`,
			code: normalizedCode,
			name: input.name.trim(),
			calculationType: input.calculationType,
			description: input.description?.trim() || null,
			isActive: input.isActive,
			createdAt: now,
			updatedAt: now
		};

		this.#categories = [newItem, ...this.#categories];
		return Res.ok({ ...newItem });
	}

	async update(id: string, input: ProductCategoryInput): Promise<Result<ProductCategory>> {
		await delay();
		const index = this.#categories.findIndex((c) => c.id === id);
		if (index === -1) {
			return Res.error(new NotFoundError('Kategori produk tidak ditemukan'));
		}

		const normalizedCode = input.code.trim().toUpperCase();
		const duplicate = this.#categories.find((c) => c.code === normalizedCode && c.id !== id);
		if (duplicate) {
			return Res.error(new ConflictError(`Kode kategori "${normalizedCode}" sudah digunakan`));
		}

		const existing = this.#categories[index];
		const updatedItem: ProductCategory = {
			...existing,
			code: normalizedCode,
			name: input.name.trim(),
			calculationType: input.calculationType,
			description: input.description?.trim() || null,
			isActive: input.isActive,
			updatedAt: new Date().toISOString()
		};

		this.#categories[index] = updatedItem;
		return Res.ok({ ...updatedItem });
	}

	async delete(id: string): Promise<Result<void>> {
		await delay();
		const exists = this.#categories.some((c) => c.id === id);
		if (!exists) {
			return Res.error(new NotFoundError('Kategori produk tidak ditemukan'));
		}

		this.#categories = this.#categories.filter((c) => c.id !== id);
		return Res.ok(undefined);
	}
}

export const productCategoryRepositoryMock = new ProductCategoryRepositoryMock();
