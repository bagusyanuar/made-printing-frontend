export type ResellerTier = 'silver' | 'gold' | 'platinum';
export type ResellerStatus = 'active' | 'near_limit' | 'auto_hold' | 'inactive';

export interface ResellerTierOption {
	value: ResellerTier;
	label: string;
	description: string;
	discountText: string;
}

export const RESELLER_TIERS: readonly ResellerTierOption[] = [
	{
		value: 'silver',
		label: 'Silver Reseller',
		description: 'Mitra reguler baru dengan kuota transaksi sedang',
		discountText: 'Diskon 5% dari harga retail'
	},
	{
		value: 'gold',
		label: 'Gold Partner',
		description: 'Biro iklan / percetakan rekanan dengan volume cetak tinggi',
		discountText: 'Harga Grosir Khusus B2B'
	},
	{
		value: 'platinum',
		label: 'Platinum Mitra',
		description: 'Mitra strategis prioritas utama dengan plafon kredit fleksibel',
		discountText: 'Harga Modal Spesial & Prioritas Antrian SPK'
	}
] as const;

export interface ResellerStatusOption {
	value: ResellerStatus;
	label: string;
	description: string;
}

export const RESELLER_STATUSES: readonly ResellerStatusOption[] = [
	{
		value: 'active',
		label: 'Aktif',
		description: 'Kemitraan aktif dan lancar bertransaksi'
	},
	{
		value: 'near_limit',
		label: 'Mendekati Limit',
		description: 'Piutang telah mencapai >80% dari plafon kredit'
	},
	{
		value: 'auto_hold',
		label: 'Auto-Hold',
		description: 'Order ditahan otomatis karena over-limit atau tagihan lewat jatuh tempo'
	},
	{
		value: 'inactive',
		label: 'Nonaktif',
		description: 'Akun kemitraan dibekukan sementara'
	}
] as const;

export interface Reseller {
	id: string;
	code: string;
	name: string;
	ownerName: string;
	phone: string;
	email: string | null;
	address: string | null;
	tier: ResellerTier;
	creditLimit: number;
	usedCredit: number;
	depositBalance: number;
	termOfPaymentDays: number;
	status: ResellerStatus;
	notes: string | null;
	isActive: boolean;
	displayOrder: number;
	createdAt: string;
	updatedAt: string;
}

export interface ResellerInput {
	code?: string;
	name: string;
	ownerName: string;
	phone?: string | null;
	email?: string | null;
	address?: string | null;
	tier?: ResellerTier;
	creditLimit?: number;
	usedCredit?: number;
	depositBalance?: number;
	termOfPaymentDays?: number;
	status?: ResellerStatus;
	notes?: string | null;
	isActive?: boolean;
	displayOrder?: number;
}

export function formatCurrency(amount: number): string {
	return new Intl.NumberFormat('id-ID', {
		style: 'currency',
		currency: 'IDR',
		maximumFractionDigits: 0
	}).format(amount);
}

export function getResellerInitial(name: string): string {
	const trimmed = name.trim();
	if (!trimmed) return 'R';
	return trimmed.charAt(0).toUpperCase();
}

export function getTierLabel(tier: ResellerTier): string {
	const found = RESELLER_TIERS.find((t) => t.value === tier);
	return found ? found.label : tier;
}

export function getStatusLabel(status: ResellerStatus): string {
	const found = RESELLER_STATUSES.find((s) => s.value === status);
	return found ? found.label : status;
}

export function generateResellerCode(name: string): string {
	const sanitized = name
		.trim()
		.toUpperCase()
		.replace(/[^A-Z0-9]+/g, '')
		.slice(0, 4);
	const rand = Math.floor(100 + Math.random() * 900);
	return `RSL-${sanitized || 'MITRA'}-${rand}`;
}
