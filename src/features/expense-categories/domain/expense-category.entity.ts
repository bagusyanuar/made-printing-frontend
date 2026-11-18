export type ExpenseGroup = 'production' | 'operational';

export interface ExpenseGroupOption {
	value: ExpenseGroup;
	label: string;
	description: string;
}

export const EXPENSE_GROUPS: readonly ExpenseGroupOption[] = [
	{
		value: 'production',
		label: 'Produksi',
		description: 'Pengeluaran untuk bahan baku, tinta, consumable, dan proses mesin cetak.'
	},
	{
		value: 'operational',
		label: 'Operasional',
		description: 'Pengeluaran umum, utilitas workshop (listrik/air), gaji, sewa, dan konsumsi.'
	}
] as const;

export interface ExpenseCategory {
	id: string;
	code: string;
	name: string;
	group: ExpenseGroup;
	productCategoryId: string | null;
	productCategoryName?: string | null;
	displayOrder: number;
	isActive: boolean;
	createdAt: string;
	updatedAt: string;
}

export interface ExpenseCategoryInput {
	code?: string;
	name: string;
	group: ExpenseGroup;
	productCategoryId?: string | null;
	productCategoryName?: string | null;
	displayOrder?: number;
	isActive?: boolean;
}

export function generateExpenseCategoryCode(
	name: string,
	group: ExpenseGroup,
	seq?: number
): string {
	const prefix = group === 'production' ? 'EXP-PRD' : 'EXP-OPS';
	if (seq !== undefined) {
		return `${prefix}-${String(seq).padStart(3, '0')}`;
	}
	const random = Math.floor(100 + Math.random() * 900);
	return `${prefix}-${random}`;
}
