export type CalculationType = 'square_meter' | 'sheet' | 'meter_run' | 'piece';

export interface CalculationTypeOption {
	value: CalculationType;
	label: string;
	unit: string;
	description: string;
}

export const CALCULATION_TYPES: readonly CalculationTypeOption[] = [
	{
		value: 'square_meter',
		label: 'Meter Persegi (m²)',
		unit: 'm²',
		description: 'Dihitung per luas cetak (Panjang x Lebar), contoh: Banner Flexy, Baliho, Spanduk'
	},
	{
		value: 'sheet',
		label: 'Lembaran (A3+)',
		unit: 'lembar',
		description: 'Dihitung per lembar plano/A3+, contoh: Brosur, Flyer, Kartu Nama, Stiker A3+'
	},
	{
		value: 'meter_run',
		label: 'Meter Lari (m)',
		unit: 'm lari',
		description: 'Dihitung berdasarkan panjang tarikan roll film, contoh: Sablon DTF, Sublimasi'
	},
	{
		value: 'piece',
		label: 'Pcs / Unit',
		unit: 'pcs',
		description: 'Dihitung per satuan item produk jadi, contoh: Akrilik UV, Plakat, Mug, Pin'
	}
] as const;

export interface PriceTierItem {
	minQty: number;
	maxQty: number;
	price: number;
}

export interface VariantTierPricing {
	variantId: string;
	variantName: string;
	resellerTiers: PriceTierItem[];
	endUserTiers: PriceTierItem[];
}

export interface ProductTierPricing {
	retailPrice: number;
	resellerPrice?: number | null;
	silverPrice?: number | null;
	goldPrice?: number | null;
	variantTiers?: VariantTierPricing[] | null;
}

export interface ProductAttributeSelection {
	attributeId: string;
	attributeName: string;
	selectedVariantIds: string[];
	isRequired?: boolean;
}

export interface Product {
	id: string;
	code: string;
	name: string;
	categoryId: string;
	categoryName: string;
	baseMaterial: string | null;
	calculationType: CalculationType;
	basePrice: number;
	tierPricing?: ProductTierPricing | null;
	assignedAttributes?: ProductAttributeSelection[] | null;
	minOrderQty: number;
	leadTimeHours: number | null;
	description: string | null;
	isActive: boolean;
	displayOrder: number;
	createdAt: string;
	updatedAt: string;
}

export interface ProductInput {
	code?: string;
	name: string;
	categoryId: string;
	categoryName?: string;
	baseMaterial?: string | null;
	calculationType: CalculationType;
	basePrice: number;
	tierPricing?: ProductTierPricing | null;
	assignedAttributes?: ProductAttributeSelection[] | null;
	minOrderQty?: number;
	leadTimeHours?: number | null;
	description?: string | null;
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

export function getCalculationLabel(type: CalculationType): string {
	const found = CALCULATION_TYPES.find((c) => c.value === type);
	return found ? found.label : type;
}

export function getCalculationUnit(type: CalculationType): string {
	const found = CALCULATION_TYPES.find((c) => c.value === type);
	return found ? found.unit : '';
}

export function getProductInitial(name: string): string {
	const trimmed = name.trim();
	if (!trimmed) return 'P';
	return trimmed.charAt(0).toUpperCase();
}

export function generateProductCode(name: string, categoryCode = 'PRD'): string {
	const sanitized = name
		.trim()
		.toUpperCase()
		.replace(/[^A-Z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '')
		.slice(0, 10);
	const rand = Math.floor(100 + Math.random() * 900);
	return `${categoryCode}-${sanitized || 'ITEM'}-${rand}`;
}
