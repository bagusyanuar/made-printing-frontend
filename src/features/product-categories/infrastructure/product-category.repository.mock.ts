import type { Result } from '$lib/shared/domain/types/result';
import { Result as Res } from '$lib/shared/domain/types/result';
import { NotFoundError, ConflictError } from '$lib/shared/domain/errors/app-error';
import {
	generateCategoryCode,
	type ProductCategory,
	type ProductCategoryInput
} from '../domain/product-category.entity';
import type { ProductCategoryRepository } from '../domain/product-category.repository';

const delay = (ms = 450) => new Promise((resolve) => setTimeout(resolve, ms));

const INITIAL_CATEGORIES: ProductCategory[] = [
	{
		id: 'cat-1',
		code: 'LF-OUT',
		name: 'Large Format Outdoor',
		type: 'production',
		spkCategory: null,
		displayOrder: 1,
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
		type: 'production',
		spkCategory: null,
		displayOrder: 2,
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
		type: 'production',
		spkCategory: null,
		displayOrder: 3,
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
		type: 'production',
		spkCategory: 'Digital Printing A3+',
		displayOrder: 4,
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
		type: 'production',
		spkCategory: null,
		displayOrder: 5,
		calculationType: 'piece',
		description: 'Gantungan kunci akrilik, Tumbler grafir/UV, ID Card PVC, Plakat',
		isActive: true,
		createdAt: '2026-01-14T13:45:00.000Z',
		updatedAt: '2026-01-14T13:45:00.000Z'
	},
	{
		id: 'cat-6',
		code: 'DESIGN-SVC',
		name: 'Jasa Desain & Setting Layout',
		type: 'non_production',
		spkCategory: null,
		displayOrder: 6,
		calculationType: 'piece',
		description: 'Jasa setting layout, edit vektor, dan desain grafis',
		isActive: true,
		createdAt: '2026-01-15T14:00:00.000Z',
		updatedAt: '2026-01-15T14:00:00.000Z'
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
		const baseCode = (input.code?.trim() || generateCategoryCode(input.name)).toUpperCase();
		let normalizedCode = baseCode;
		if (this.#categories.some((c) => c.code === normalizedCode)) {
			let counter = 2;
			while (this.#categories.some((c) => c.code === `${normalizedCode.slice(0, 16)}-${counter}`)) {
				counter++;
			}
			normalizedCode = `${normalizedCode.slice(0, 16)}-${counter}`;
		}

		const nextOrder =
			input.displayOrder ??
			(this.#categories.length > 0
				? Math.max(...this.#categories.map((c) => c.displayOrder)) + 1
				: 1);

		const now = new Date().toISOString();
		const newItem: ProductCategory = {
			id: `cat-${Date.now()}`,
			code: normalizedCode,
			name: input.name.trim(),
			type: input.type,
			spkCategory: input.spkCategory?.trim() || null,
			displayOrder: nextOrder,
			calculationType: input.calculationType,
			description: input.description?.trim() || null,
			isActive: input.isActive ?? true,
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

		const existing = this.#categories[index];
		const normalizedCode = (input.code?.trim() || existing.code).toUpperCase();
		const duplicate = this.#categories.find((c) => c.code === normalizedCode && c.id !== id);
		if (duplicate) {
			return Res.error(new ConflictError(`Kode kategori "${normalizedCode}" sudah digunakan`));
		}

		const updatedItem: ProductCategory = {
			...existing,
			code: normalizedCode,
			name: input.name.trim(),
			type: input.type,
			spkCategory:
				input.spkCategory !== undefined ? input.spkCategory?.trim() || null : existing.spkCategory,
			displayOrder: input.displayOrder ?? existing.displayOrder,
			calculationType: input.calculationType,
			description:
				input.description !== undefined ? input.description?.trim() || null : existing.description,
			isActive: input.isActive ?? existing.isActive,
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

	async reorder(orders: { id: string; displayOrder: number }[]): Promise<Result<void>> {
		await delay(100);
		for (const order of orders) {
			const cat = this.#categories.find((c) => c.id === order.id);
			if (cat) {
				cat.displayOrder = order.displayOrder;
				cat.updatedAt = new Date().toISOString();
			}
		}
		return Res.ok(undefined);
	}
}

export const productCategoryRepositoryMock = new ProductCategoryRepositoryMock();
