import type { Result } from '$lib/shared/domain/types/result';
import type { AppError } from '$lib/shared/domain/errors/app-error';
import { Result as ResultClass } from '$lib/shared/domain/types/result';
import { NotFoundError, ConflictError } from '$lib/shared/domain/errors/app-error';
import type { Reseller, ResellerInput } from '../domain/reseller.entity';
import type { ResellerRepository } from '../domain/reseller.repository';
import { generateResellerCode } from '../domain/reseller.entity';

const INITIAL_RESELLERS: Reseller[] = [
	{
		id: 'rsl-001',
		code: 'RSL-MAHA-001',
		name: 'Biro Iklan Mahakarya',
		ownerName: 'Hendra Setiawan',
		phone: '081298765432',
		email: 'hendra@mahakarya.id',
		address: 'Jl. Sudirman No. 45, Padang',
		tier: 'gold',
		creditLimit: 15000000,
		usedCredit: 6200000,
		depositBalance: 2500000,
		termOfPaymentDays: 30,
		status: 'active',
		notes: 'Mitra langganan pemda dan korporat perhotelan.',
		isActive: true,
		displayOrder: 1,
		createdAt: '2026-01-10T08:00:00.000Z',
		updatedAt: '2026-01-10T08:00:00.000Z'
	},
	{
		id: 'rsl-002',
		code: 'RSL-SUMB-002',
		name: 'Percetakan Sumber Rejeki',
		ownerName: 'Ahmad Fauzi',
		phone: '081345678901',
		email: 'fauzi.print@gmail.com',
		address: 'Jl. Hamka No. 88, Tabing',
		tier: 'silver',
		creditLimit: 5000000,
		usedCredit: 4800000,
		depositBalance: 0,
		termOfPaymentDays: 14,
		status: 'near_limit',
		notes: 'Sering lempar job A3+ dan stiker lembaran.',
		isActive: true,
		displayOrder: 2,
		createdAt: '2026-01-11T09:00:00.000Z',
		updatedAt: '2026-01-11T09:00:00.000Z'
	},
	{
		id: 'rsl-003',
		code: 'RSL-KREA-003',
		name: 'Kreatif Visual Media',
		ownerName: 'Dian Anggraini',
		phone: '081122334455',
		email: 'order@kreatifvisual.com',
		address: 'Jl. Khatib Sulaiman No. 12, Padang',
		tier: 'gold',
		creditLimit: 10000000,
		usedCredit: 7500000,
		depositBalance: 1000000,
		termOfPaymentDays: 14,
		status: 'auto_hold',
		notes: 'Ada 1 faktur overdue melewati jatuh tempo 14 hari.',
		isActive: true,
		displayOrder: 3,
		createdAt: '2026-01-12T10:00:00.000Z',
		updatedAt: '2026-01-12T10:00:00.000Z'
	},
	{
		id: 'rsl-004',
		code: 'RSL-DUTA-004',
		name: 'Duta Printing & Advertising',
		ownerName: 'Budi Prasetyo',
		phone: '081801234567',
		email: 'budi.duta@yahoo.co.id',
		address: 'Jl. Proklamasi No. 23, Padang Timur',
		tier: 'platinum',
		creditLimit: 30000000,
		usedCredit: 12000000,
		depositBalance: 8500000,
		termOfPaymentDays: 30,
		status: 'active',
		notes: 'Volume cetak banner outdoor rata-rata 800m2/bulan.',
		isActive: true,
		displayOrder: 4,
		createdAt: '2026-01-15T11:00:00.000Z',
		updatedAt: '2026-01-15T11:00:00.000Z'
	},
	{
		id: 'rsl-005',
		code: 'RSL-GLOW-005',
		name: 'Glow Neon & Cutting Stiker',
		ownerName: 'Rian Hidayat',
		phone: '085278901234',
		email: 'glownc@gmail.com',
		address: 'Jl. Gajah Mada No. 15, Gn. Pangilun',
		tier: 'silver',
		creditLimit: 3000000,
		usedCredit: 800000,
		depositBalance: 500000,
		termOfPaymentDays: 7,
		status: 'active',
		notes: 'Fokus di media UV Flatbed akrilik & stiker cutting.',
		isActive: true,
		displayOrder: 5,
		createdAt: '2026-01-18T14:00:00.000Z',
		updatedAt: '2026-01-18T14:00:00.000Z'
	},
	{
		id: 'rsl-006',
		code: 'RSL-ARTH-006',
		name: 'Artha Jaya Grafika',
		ownerName: 'Siti Rahmawati',
		phone: '082156789012',
		email: 'arthajaya@gmail.com',
		address: 'Jl. Veteran No. 34, Padang Barat',
		tier: 'gold',
		creditLimit: 20000000,
		usedCredit: 18500000,
		depositBalance: 3200000,
		termOfPaymentDays: 30,
		status: 'near_limit',
		notes: 'Plafon kredit mendekati batas, perlu konfirmasi pembayaran invoice.',
		isActive: true,
		displayOrder: 6,
		createdAt: '2026-01-20T13:00:00.000Z',
		updatedAt: '2026-01-20T13:00:00.000Z'
	},
	{
		id: 'rsl-007',
		code: 'RSL-PRIM-007',
		name: 'Prima Signage Padang',
		ownerName: 'Doni Saputra',
		phone: '081267890123',
		email: 'primasignage@gmail.com',
		address: 'Jl. Pemuda No. 70, Padang',
		tier: 'silver',
		creditLimit: 5000000,
		usedCredit: 5200000,
		depositBalance: 0,
		termOfPaymentDays: 14,
		status: 'auto_hold',
		notes: 'Order di-hold otomatis karena piutang melampaui plafon kredit.',
		isActive: true,
		displayOrder: 7,
		createdAt: '2026-01-22T15:00:00.000Z',
		updatedAt: '2026-01-22T15:00:00.000Z'
	},
	{
		id: 'rsl-008',
		code: 'RSL-STAR-008',
		name: 'Star Media Production',
		ownerName: 'Kevin Tan',
		phone: '081987654321',
		email: 'kevin@starmediagroup.com',
		address: 'Jl. Nipah No. 5, Padang Selatan',
		tier: 'platinum',
		creditLimit: 40000000,
		usedCredit: 5000000,
		depositBalance: 15000000,
		termOfPaymentDays: 45,
		status: 'active',
		notes: 'Deposit saldo besar, pembayaran selalu tepat waktu.',
		isActive: true,
		displayOrder: 8,
		createdAt: '2026-01-25T16:00:00.000Z',
		updatedAt: '2026-01-25T16:00:00.000Z'
	}
];

export class ResellerRepositoryMock implements ResellerRepository {
	private resellers: Reseller[] = [...INITIAL_RESELLERS];

	async list(): Promise<Result<Reseller[], AppError>> {
		await new Promise((resolve) => setTimeout(resolve, 150));
		return ResultClass.ok([...this.resellers].sort((a, b) => a.displayOrder - b.displayOrder));
	}

	async getById(id: string): Promise<Result<Reseller, AppError>> {
		await new Promise((resolve) => setTimeout(resolve, 80));
		const found = this.resellers.find((r) => r.id === id);
		if (!found) {
			return ResultClass.error(new NotFoundError('Reseller / Biro tidak ditemukan'));
		}
		return ResultClass.ok({ ...found });
	}

	async create(input: ResellerInput): Promise<Result<Reseller, AppError>> {
		await new Promise((resolve) => setTimeout(resolve, 150));

		const code = input.code || generateResellerCode(input.name);

		const exists = this.resellers.some(
			(r) => r.code.toLowerCase() === code.toLowerCase() || r.name.toLowerCase() === input.name.toLowerCase()
		);
		if (exists) {
			return ResultClass.error(new ConflictError(`Reseller dengan nama atau kode "${code}" sudah terdaftar`));
		}

		const now = new Date().toISOString();
		const maxDisplayOrder = this.resellers.reduce((max, r) => Math.max(max, r.displayOrder), 0);

		const newReseller: Reseller = {
			id: `rsl-${Date.now()}`,
			code,
			name: input.name,
			ownerName: input.ownerName,
			phone: input.phone || '-',
			email: input.email ?? null,
			address: input.address ?? null,
			tier: input.tier ?? 'gold',
			creditLimit: input.creditLimit ?? 0,
			usedCredit: input.usedCredit ?? 0,
			depositBalance: input.depositBalance ?? 0,
			termOfPaymentDays: input.termOfPaymentDays ?? 14,
			status: input.status ?? 'active',
			notes: input.notes ?? null,
			isActive: input.isActive ?? true,
			displayOrder: input.displayOrder ?? maxDisplayOrder + 1,
			createdAt: now,
			updatedAt: now
		};

		this.resellers.unshift(newReseller);
		return ResultClass.ok({ ...newReseller });
	}

	async update(id: string, input: ResellerInput): Promise<Result<Reseller, AppError>> {
		await new Promise((resolve) => setTimeout(resolve, 150));
		const index = this.resellers.findIndex((r) => r.id === id);
		if (index === -1) {
			return ResultClass.error(new NotFoundError('Reseller / Biro tidak ditemukan'));
		}

		const existing = this.resellers[index];

		// Check name collision with others
		const duplicateName = this.resellers.some(
			(r) => r.id !== id && r.name.toLowerCase() === input.name.toLowerCase()
		);
		if (duplicateName) {
			return ResultClass.error(new ConflictError(`Reseller dengan nama "${input.name}" sudah digunakan`));
		}

		const now = new Date().toISOString();
		const updated: Reseller = {
			...existing,
			code: input.code ?? existing.code,
			name: input.name,
			ownerName: input.ownerName,
			phone: input.phone !== undefined ? (input.phone || '-') : existing.phone,
			email: input.email !== undefined ? input.email : existing.email,
			address: input.address !== undefined ? input.address : existing.address,
			tier: input.tier ?? existing.tier,
			creditLimit: input.creditLimit !== undefined ? input.creditLimit : existing.creditLimit,
			usedCredit: input.usedCredit !== undefined ? input.usedCredit : existing.usedCredit,
			depositBalance:
				input.depositBalance !== undefined ? input.depositBalance : existing.depositBalance,
			termOfPaymentDays:
				input.termOfPaymentDays !== undefined
					? input.termOfPaymentDays
					: existing.termOfPaymentDays,
			status: input.status ?? existing.status,
			notes: input.notes !== undefined ? input.notes : existing.notes,
			isActive: input.isActive !== undefined ? input.isActive : existing.isActive,
			displayOrder: input.displayOrder !== undefined ? input.displayOrder : existing.displayOrder,
			updatedAt: now
		};

		this.resellers[index] = updated;
		return ResultClass.ok({ ...updated });
	}

	async delete(id: string): Promise<Result<void, AppError>> {
		await new Promise((resolve) => setTimeout(resolve, 100));
		const index = this.resellers.findIndex((r) => r.id === id);
		if (index === -1) {
			return ResultClass.error(new NotFoundError('Reseller / Biro tidak ditemukan'));
		}

		const target = this.resellers[index];
		if (target.usedCredit > 0) {
			return ResultClass.error(
				new ConflictError(
					`Tidak dapat menghapus mitra "${target.name}" karena masih memiliki piutang aktif sebesar Rp ${target.usedCredit.toLocaleString('id-ID')}. Selesaikan pelunasan terlebih dahulu.`
				)
			);
		}

		this.resellers.splice(index, 1);
		return ResultClass.ok(undefined);
	}

	async adjustDeposit(id: string, amount: number, note?: string): Promise<Result<Reseller, AppError>> {
		await new Promise((resolve) => setTimeout(resolve, 100));
		const index = this.resellers.findIndex((r) => r.id === id);
		if (index === -1) {
			return ResultClass.error(new NotFoundError('Reseller / Biro tidak ditemukan'));
		}

		const current = this.resellers[index];
		const newBalance = current.depositBalance + amount;
		if (newBalance < 0) {
			return ResultClass.error(new ConflictError('Saldo deposit tidak boleh negatif setelah penyesuaian'));
		}

		const now = new Date().toISOString();
		const updated: Reseller = {
			...current,
			depositBalance: newBalance,
			notes: note ? `${current.notes ? current.notes + ' | ' : ''}Deposit ${amount >= 0 ? '+' : ''}${amount}: ${note}` : current.notes,
			updatedAt: now
		};

		this.resellers[index] = updated;
		return ResultClass.ok({ ...updated });
	}

	async reorder(orders: { id: string; displayOrder: number }[]): Promise<Result<void, AppError>> {
		await new Promise((resolve) => setTimeout(resolve, 80));
		const orderMap = new Map(orders.map((o) => [o.id, o.displayOrder]));

		this.resellers = this.resellers.map((r) => {
			if (orderMap.has(r.id)) {
				return { ...r, displayOrder: orderMap.get(r.id)! };
			}
			return r;
		});

		return ResultClass.ok(undefined);
	}
}
