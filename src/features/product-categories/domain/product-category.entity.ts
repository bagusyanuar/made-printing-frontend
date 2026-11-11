export type CalculationType = 'square_meter' | 'sheet' | 'meter_run' | 'piece';
export type CategoryType = 'production' | 'non_production';

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

export interface ProductCategory {
	id: string;
	code: string;
	name: string;
	type: CategoryType;
	spkCategory: string | null;
	displayOrder: number;
	calculationType: CalculationType;
	description: string | null;
	isActive: boolean;
	createdAt: string;
	updatedAt: string;
}

export interface ProductCategoryInput {
	code: string;
	name: string;
	type: CategoryType;
	spkCategory?: string | null;
	displayOrder: number;
	calculationType: CalculationType;
	description?: string | null;
	isActive: boolean;
}
