import type { Result } from '$lib/shared/domain/types/result';
import type { AppError } from '$lib/shared/domain/errors/app-error';
import { Result as ResultClass } from '$lib/shared/domain/types/result';
import { NotFoundError, ConflictError } from '$lib/shared/domain/errors/app-error';
import type { ExpenseCategory, ExpenseCategoryInput } from '../domain/expense-category.entity';
import type { ExpenseCategoryRepository } from '../domain/expense-category.repository';
import { generateExpenseCategoryCode } from '../domain/expense-category.entity';

const INITIAL_EXPENSE_CATEGORIES: ExpenseCategory[] = [
	{
		id: 'exp-cat-001',
		code: 'EXP-PRD-001',
		name: 'Pembelian Bahan Baku Flexy & Spanduk',
		group: 'production',
		productCategoryId: 'cat-1',
		productCategoryName: 'Large Format Outdoor',
		displayOrder: 1,
		isActive: true,
		createdAt: '2026-01-05T08:00:00.000Z',
		updatedAt: '2026-01-05T08:00:00.000Z'
	},
	{
		id: 'exp-cat-002',
		code: 'EXP-PRD-002',
		name: 'Pembelian Kertas A3+ & Plano',
		group: 'production',
		productCategoryId: 'cat-3',
		productCategoryName: 'Digital Printing A3+ Lembaran',
		displayOrder: 2,
		isActive: true,
		createdAt: '2026-01-06T09:00:00.000Z',
		updatedAt: '2026-01-06T09:00:00.000Z'
	},
	{
		id: 'exp-cat-003',
		code: 'EXP-PRD-003',
		name: 'Tinta Cetak Solvent & Ecosolvent',
		group: 'production',
		productCategoryId: 'cat-1',
		productCategoryName: 'Large Format Outdoor',
		displayOrder: 3,
		isActive: true,
		createdAt: '2026-01-07T10:00:00.000Z',
		updatedAt: '2026-01-07T10:00:00.000Z'
	},
	{
		id: 'exp-cat-004',
		code: 'EXP-PRD-004',
		name: 'Bahan DTF & Bubuk Lem Kristal Powder',
		group: 'production',
		productCategoryId: 'cat-4',
		productCategoryName: 'Sablon Digital DTF & Sublimasi',
		displayOrder: 4,
		isActive: true,
		createdAt: '2026-01-08T11:00:00.000Z',
		updatedAt: '2026-01-08T11:00:00.000Z'
	},
	{
		id: 'exp-cat-005',
		code: 'EXP-PRD-005',
		name: 'Bahan Display Indoor (Albatros, Luster, X-Banner)',
		group: 'production',
		productCategoryId: 'cat-2',
		productCategoryName: 'Large Format Indoor & Display',
		displayOrder: 5,
		isActive: true,
		createdAt: '2026-01-09T13:00:00.000Z',
		updatedAt: '2026-01-09T13:00:00.000Z'
	},
	{
		id: 'exp-cat-006',
		code: 'EXP-OPS-001',
		name: 'Tagihan Listrik Daya 3-Phase Workshop',
		group: 'operational',
		productCategoryId: null,
		productCategoryName: null,
		displayOrder: 6,
		isActive: true,
		createdAt: '2026-01-10T14:00:00.000Z',
		updatedAt: '2026-01-10T14:00:00.000Z'
	},
	{
		id: 'exp-cat-007',
		code: 'EXP-OPS-002',
		name: 'Gaji & Uang Lembur Operator Produksi',
		group: 'operational',
		productCategoryId: null,
		productCategoryName: null,
		displayOrder: 7,
		isActive: true,
		createdAt: '2026-01-11T15:00:00.000Z',
		updatedAt: '2026-01-11T15:00:00.000Z'
	},
	{
		id: 'exp-cat-008',
		code: 'EXP-OPS-003',
		name: 'Perawatan Berkala Mesin Cetak & Sparepart',
		group: 'operational',
		productCategoryId: null,
		productCategoryName: null,
		displayOrder: 8,
		isActive: true,
		createdAt: '2026-01-12T16:00:00.000Z',
		updatedAt: '2026-01-12T16:00:00.000Z'
	},
	{
		id: 'exp-cat-009',
		code: 'EXP-OPS-004',
		name: 'Konsumsi & Perlengkapan Operasional Toko',
		group: 'operational',
		productCategoryId: null,
		productCategoryName: null,
		displayOrder: 9,
		isActive: true,
		createdAt: '2026-01-13T17:00:00.000Z',
		updatedAt: '2026-01-13T17:00:00.000Z'
	},
	{
		id: 'exp-cat-010',
		code: 'EXP-OPS-005',
		name: 'Sewa Bangunan & Workshop Percetakan',
		group: 'operational',
		productCategoryId: null,
		productCategoryName: null,
		displayOrder: 10,
		isActive: true,
		createdAt: '2026-01-14T09:00:00.000Z',
		updatedAt: '2026-01-14T09:00:00.000Z'
	}
];

export class ExpenseCategoryRepositoryMock implements ExpenseCategoryRepository {
	#items: ExpenseCategory[] = JSON.parse(JSON.stringify(INITIAL_EXPENSE_CATEGORIES));

	async list(): Promise<Result<ExpenseCategory[], AppError>> {
		await new Promise((resolve) => setTimeout(resolve, 150));
		return ResultClass.ok([...this.#items].sort((a, b) => a.displayOrder - b.displayOrder));
	}

	async getById(id: string): Promise<Result<ExpenseCategory, AppError>> {
		await new Promise((resolve) => setTimeout(resolve, 100));
		const item = this.#items.find((i) => i.id === id);
		if (!item) {
			return ResultClass.error(
				new NotFoundError(`Kategori pengeluaran dengan id "${id}" tidak ditemukan`)
			);
		}
		return ResultClass.ok({ ...item });
	}

	async create(input: ExpenseCategoryInput): Promise<Result<ExpenseCategory, AppError>> {
		await new Promise((resolve) => setTimeout(resolve, 200));

		const existing = this.#items.find(
			(i) => i.name.toLowerCase() === input.name.trim().toLowerCase()
		);
		if (existing) {
			return ResultClass.error(
				new ConflictError(`Kategori pengeluaran "${input.name.trim()}" sudah terdaftar`)
			);
		}

		const nextOrder =
			input.displayOrder !== undefined
				? input.displayOrder
				: this.#items.reduce((max, i) => Math.max(max, i.displayOrder), 0) + 1;

		const code =
			input.code ||
			generateExpenseCategoryCode(input.name.trim(), input.group, this.#items.length + 1);

		const now = new Date().toISOString();
		const newItem: ExpenseCategory = {
			id: `exp-cat-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
			code,
			name: input.name.trim(),
			group: input.group,
			productCategoryId:
				input.group === 'production' ? input.productCategoryId?.trim() || null : null,
			productCategoryName:
				input.group === 'production' ? input.productCategoryName?.trim() || null : null,
			displayOrder: nextOrder,
			isActive: input.isActive ?? true,
			createdAt: now,
			updatedAt: now
		};

		this.#items.push(newItem);
		return ResultClass.ok(newItem);
	}

	async update(
		id: string,
		input: ExpenseCategoryInput
	): Promise<Result<ExpenseCategory, AppError>> {
		await new Promise((resolve) => setTimeout(resolve, 200));

		const index = this.#items.findIndex((i) => i.id === id);
		if (index === -1) {
			return ResultClass.error(
				new NotFoundError(`Kategori pengeluaran dengan id "${id}" tidak ditemukan`)
			);
		}

		const duplicate = this.#items.find(
			(i) => i.id !== id && i.name.toLowerCase() === input.name.trim().toLowerCase()
		);
		if (duplicate) {
			return ResultClass.error(
				new ConflictError(`Kategori pengeluaran "${input.name.trim()}" sudah digunakan`)
			);
		}

		const current = this.#items[index];
		const updatedItem: ExpenseCategory = {
			...current,
			code: input.code || current.code,
			name: input.name.trim(),
			group: input.group,
			productCategoryId:
				input.group === 'production' ? input.productCategoryId?.trim() || null : null,
			productCategoryName:
				input.group === 'production'
					? input.productCategoryName !== undefined
						? input.productCategoryName
						: current.productCategoryName
					: null,
			displayOrder: input.displayOrder ?? current.displayOrder,
			isActive: input.isActive ?? current.isActive,
			updatedAt: new Date().toISOString()
		};

		this.#items[index] = updatedItem;
		return ResultClass.ok(updatedItem);
	}

	async delete(id: string): Promise<Result<void, AppError>> {
		await new Promise((resolve) => setTimeout(resolve, 180));
		const index = this.#items.findIndex((i) => i.id === id);
		if (index === -1) {
			return ResultClass.error(
				new NotFoundError(`Kategori pengeluaran dengan id "${id}" tidak ditemukan`)
			);
		}

		this.#items.splice(index, 1);
		return ResultClass.ok(undefined);
	}

	async reorder(orders: { id: string; displayOrder: number }[]): Promise<Result<void, AppError>> {
		await new Promise((resolve) => setTimeout(resolve, 150));

		const orderMap = new Map<string, number>();
		orders.forEach((o) => orderMap.set(o.id, o.displayOrder));

		this.#items = this.#items.map((item) => {
			if (orderMap.has(item.id)) {
				return {
					...item,
					displayOrder: orderMap.get(item.id)!,
					updatedAt: new Date().toISOString()
				};
			}
			return item;
		});

		return ResultClass.ok(undefined);
	}
}
