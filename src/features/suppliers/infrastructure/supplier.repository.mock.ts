import type { Result } from '$lib/shared/domain/types/result';
import type { AppError } from '$lib/shared/domain/errors/app-error';
import { Result as ResultClass } from '$lib/shared/domain/types/result';
import { NotFoundError, ConflictError } from '$lib/shared/domain/errors/app-error';
import type { Supplier, SupplierInput } from '../domain/supplier.entity';
import type { SupplierRepository } from '../domain/supplier.repository';
import { generateSupplierCode } from '../domain/supplier.entity';

const INITIAL_SUPPLIERS: Supplier[] = [
	{
		id: 'spl-001',
		code: 'SPL-001',
		name: 'PT Surya Kencana Grafika',
		contactPerson: 'Bambang Sutrisno',
		phone: '081234567890',
		email: 'sales@suryakencana.co.id',
		address: 'Kawasan Industri Pulo Gadung Blok B2 No. 8, Jakarta Timur',
		notes: 'Pemasok utama banner flexy frontlite 280/340/440g, korchin, albatros, dan luster.',
		isActive: true,
		displayOrder: 1,
		createdAt: '2026-01-05T08:00:00.000Z',
		updatedAt: '2026-01-05T08:00:00.000Z'
	},
	{
		id: 'spl-002',
		code: 'SPL-002',
		name: 'CV Bintang Tinta Mandiri',
		contactPerson: 'Agus Pratama',
		phone: '081398765432',
		email: 'order@bintangtinta.com',
		address: 'Jl. Raya Industri Cibitung KM 24, Bekasi',
		notes:
			'Suplier tinta solvent Flora Polaris, eco-solvent Epson DX5/i3200, dan tinta DTF pigment CMYK+W.',
		isActive: true,
		displayOrder: 2,
		createdAt: '2026-01-06T09:00:00.000Z',
		updatedAt: '2026-01-06T09:00:00.000Z'
	},
	{
		id: 'spl-003',
		code: 'SPL-003',
		name: 'PT Paper Prima Sejahtera',
		contactPerson: 'Linda Wijaya',
		phone: '081187654321',
		email: 'linda.wijaya@paperprima.id',
		address: 'Kawasan Pergudangan Margomulyo Permai Blok D-12, Surabaya',
		notes:
			'Kertas lembaran A3+ (Art Paper 120/150g, Art Carton 230/260/310g, Stiker Cromo & Vinyl ritrama).',
		isActive: true,
		displayOrder: 3,
		createdAt: '2026-01-07T10:00:00.000Z',
		updatedAt: '2026-01-07T10:00:00.000Z'
	},
	{
		id: 'spl-004',
		code: 'SPL-004',
		name: 'CV Indo Akrilik Pratama',
		contactPerson: 'Hendra Gunawan',
		phone: '081809876543',
		email: 'info@indoakrilik.co.id',
		address: 'Sentra Bisnis Daan Mogot KM 19, Tangerang',
		notes:
			'Lembaran akrilik MC/Astariglas bening & warna (2mm - 10mm), foam board, impraboard, PVC board.',
		isActive: true,
		displayOrder: 4,
		createdAt: '2026-01-08T11:00:00.000Z',
		updatedAt: '2026-01-08T11:00:00.000Z'
	},
	{
		id: 'spl-005',
		code: 'SPL-005',
		name: 'PT Sinergi Sparepart Mesin',
		contactPerson: 'Reza Rahardian',
		phone: '081765432109',
		email: 'spareparts@sinergiprint.com',
		address: 'Ruko Harco Mangga Dua Blok J No. 15, Jakarta Pusat',
		notes:
			'Printhead Epson i3200-A1/E1, Konica Minolta 512i, damper, capping, selang solvent, encoder strip.',
		isActive: true,
		displayOrder: 5,
		createdAt: '2026-01-09T13:00:00.000Z',
		updatedAt: '2026-01-09T13:00:00.000Z'
	},
	{
		id: 'spl-006',
		code: 'SPL-006',
		name: 'CV Multi Display Promosi',
		contactPerson: 'Siti Nurhaliza',
		phone: '081912345678',
		email: 'cs@multidisplay.co.id',
		address: 'Jl. Soekarno Hatta No. 412, Bandung',
		notes:
			'Stand display portabel: Roll Up Banner aluminium 60/80/85cm, X-Banner fiber, Tripod banner, Door frame.',
		isActive: true,
		displayOrder: 6,
		createdAt: '2026-01-10T14:00:00.000Z',
		updatedAt: '2026-01-10T14:00:00.000Z'
	},
	{
		id: 'spl-007',
		code: 'SPL-007',
		name: 'PT Tekno Lem Percetakan',
		contactPerson: 'Joko Supriyanto',
		phone: '082123456789',
		email: 'joko@teknolem.co.id',
		address: 'Kawasan Industri Candi Blok 8, Semarang',
		notes:
			'Lem panas lem buku (hotmelt glue pellets), double tape foam hijau, lem seaming spanduk banner.',
		isActive: true,
		displayOrder: 7,
		createdAt: '2026-01-11T15:00:00.000Z',
		updatedAt: '2026-01-11T15:00:00.000Z'
	},
	{
		id: 'spl-008',
		code: 'SPL-008',
		name: 'CV Aneka Mata Ayam Logam',
		contactPerson: 'Eko Kurniawan',
		phone: '085678901234',
		email: 'ekokurniawan@anekamataayam.id',
		address: 'Jl. Gatot Subroto KM 7, Padang',
		notes:
			'Ring mata ayam nikel/kuningan 10mm & 12mm, alat plong punch hidrolik manual, pisau cutting Zund.',
		isActive: true,
		displayOrder: 8,
		createdAt: '2026-01-12T16:00:00.000Z',
		updatedAt: '2026-01-12T16:00:00.000Z'
	}
];

export class SupplierRepositoryMock implements SupplierRepository {
	private suppliers: Supplier[] = [...INITIAL_SUPPLIERS];

	async list(): Promise<Result<Supplier[], AppError>> {
		await new Promise((resolve) => setTimeout(resolve, 150));
		return ResultClass.ok([...this.suppliers].sort((a, b) => a.displayOrder - b.displayOrder));
	}

	async getById(id: string): Promise<Result<Supplier, AppError>> {
		await new Promise((resolve) => setTimeout(resolve, 80));
		const found = this.suppliers.find((s) => s.id === id);
		if (!found) {
			return ResultClass.error(new NotFoundError('Supplier tidak ditemukan'));
		}
		return ResultClass.ok({ ...found });
	}

	async create(input: SupplierInput): Promise<Result<Supplier, AppError>> {
		await new Promise((resolve) => setTimeout(resolve, 150));

		const code = input.code || generateSupplierCode(input.name, this.suppliers.length + 1);

		const exists = this.suppliers.some(
			(s) =>
				s.code.toLowerCase() === code.toLowerCase() ||
				s.name.toLowerCase() === input.name.trim().toLowerCase()
		);
		if (exists) {
			return ResultClass.error(
				new ConflictError(`Supplier dengan nama atau kode "${input.name.trim()}" sudah terdaftar`)
			);
		}

		const now = new Date().toISOString();
		const maxDisplayOrder = this.suppliers.reduce((max, s) => Math.max(max, s.displayOrder), 0);

		const newSupplier: Supplier = {
			id: `spl-${Date.now()}`,
			code,
			name: input.name.trim(),
			contactPerson: input.contactPerson?.trim() || null,
			phone: input.phone?.trim() || '-',
			email: input.email?.trim() || null,
			address: input.address?.trim() || null,
			notes: input.notes?.trim() || null,
			isActive: input.isActive ?? true,
			displayOrder: input.displayOrder ?? maxDisplayOrder + 1,
			createdAt: now,
			updatedAt: now
		};

		this.suppliers.push(newSupplier);
		return ResultClass.ok({ ...newSupplier });
	}

	async update(id: string, input: SupplierInput): Promise<Result<Supplier, AppError>> {
		await new Promise((resolve) => setTimeout(resolve, 150));

		const index = this.suppliers.findIndex((s) => s.id === id);
		if (index === -1) {
			return ResultClass.error(new NotFoundError('Supplier tidak ditemukan'));
		}

		const existing = this.suppliers[index];

		const duplicateName = this.suppliers.some(
			(s) => s.id !== id && s.name.toLowerCase() === input.name.trim().toLowerCase()
		);
		if (duplicateName) {
			return ResultClass.error(
				new ConflictError(`Supplier dengan nama "${input.name.trim()}" sudah terdaftar`)
			);
		}

		const now = new Date().toISOString();
		const updated: Supplier = {
			...existing,
			name: input.name.trim(),
			contactPerson: input.contactPerson?.trim() ?? existing.contactPerson,
			phone: input.phone?.trim() ?? existing.phone,
			email: input.email?.trim() ?? existing.email,
			address: input.address?.trim() ?? existing.address,
			notes: input.notes?.trim() ?? existing.notes,
			isActive: input.isActive ?? existing.isActive,
			displayOrder: input.displayOrder ?? existing.displayOrder,
			updatedAt: now
		};

		this.suppliers[index] = updated;
		return ResultClass.ok({ ...updated });
	}

	async delete(id: string): Promise<Result<void, AppError>> {
		await new Promise((resolve) => setTimeout(resolve, 150));

		const index = this.suppliers.findIndex((s) => s.id === id);
		if (index === -1) {
			return ResultClass.error(new NotFoundError('Supplier tidak ditemukan'));
		}

		this.suppliers.splice(index, 1);
		return ResultClass.ok(undefined);
	}

	async reorder(orders: { id: string; displayOrder: number }[]): Promise<Result<void, AppError>> {
		await new Promise((resolve) => setTimeout(resolve, 100));

		for (const order of orders) {
			const item = this.suppliers.find((s) => s.id === order.id);
			if (item) {
				item.displayOrder = order.displayOrder;
				item.updatedAt = new Date().toISOString();
			}
		}

		return ResultClass.ok(undefined);
	}
}
