export type ExpenseGroup = 'production' | 'operational';

export type ExpenseReceiptGroup = ExpenseGroup | 'mixed';

export type ExpenseStatus = 'APPROVED' | 'PENDING' | 'CANCELLED';

export type ExpensePaymentStatus = 'LUNAS' | 'PARTIAL_PAID' | 'UNPAID' | 'CANCELLED';

export type ExpenseAccountName = 'Kas Kecil' | 'Kas Besar' | 'Transfer';

export const EXPENSE_ACCOUNTS: readonly ExpenseAccountName[] = [
	'Kas Kecil',
	'Kas Besar',
	'Transfer'
] as const;

export interface ExpensePaymentLine {
	accountName: string;
	amount: number;
}

export interface ExpensePaymentRecord {
	id: string;
	paymentDate: string;
	accountName: string;
	amount: number;
	referenceNumber?: string | null;
	note?: string | null;
	recordedBy?: string | null;
}

export interface ExpenseItem {
	id: string;
	group: ExpenseGroup;
	categoryId: string;
	categoryName: string;
	productCategoryName?: string | null;
	description: string;
	amount: number;
	notes?: string | null;
}

export interface ExpenseItemInput {
	group: ExpenseGroup;
	categoryId: string;
	categoryName: string;
	productCategoryName?: string | null;
	description: string;
	amount: number;
	notes?: string | null;
}

export interface Expense {
	id: string;
	code: string;
	expenseDate: string;
	group: ExpenseReceiptGroup;
	items: ExpenseItem[];
	vendorId?: string | null;
	vendorName?: string | null;
	accountName: string;
	paymentLines: ExpensePaymentLine[];
	paymentHistory: ExpensePaymentRecord[];
	subtotal: number;
	discountAmount: number;
	amount: number;
	totalPaid: number;
	remainingAmount: number;
	paymentStatus: ExpensePaymentStatus;
	status: ExpenseStatus;
	recordedBy: string;
	approvedBy?: string | null;
	approvedAt?: string | null;
	cancelReason?: string | null;
	cancelledAt?: string | null;
	referenceNumber?: string | null;
	notes?: string | null;
	createdAt: string;
	updatedAt: string;
}

export interface ExpenseInput {
	expenseDate?: string;
	items: ExpenseItemInput[];
	discountAmount?: number;
	vendorId?: string | null;
	vendorName?: string | null;
	paymentLines: ExpensePaymentLine[];
	status?: ExpenseStatus;
	referenceNumber?: string | null;
	notes?: string | null;
}

export interface ExpenseSettlePaymentInput {
	amount: number;
	accountName: ExpenseAccountName;
	referenceNumber?: string;
	note?: string;
}

export function resolveExpenseReceiptGroup(
	items: readonly { group: ExpenseGroup }[]
): ExpenseReceiptGroup {
	const hasProduction = items.some((item) => item.group === 'production');
	const hasOperational = items.some((item) => item.group === 'operational');
	if (hasProduction && hasOperational) return 'mixed';
	if (hasProduction) return 'production';
	return 'operational';
}

export function resolveExpensePaymentStatus(
	status: ExpenseStatus,
	totalPaid: number,
	totalAmount: number
): ExpensePaymentStatus {
	if (status === 'CANCELLED') return 'CANCELLED';
	if (totalAmount <= 0 || totalPaid >= totalAmount) return 'LUNAS';
	if (totalPaid > 0) return 'PARTIAL_PAID';
	return 'UNPAID';
}

export function formatExpenseAccountsSummary(lines: readonly ExpensePaymentLine[]): string {
	const active = lines.filter((line) => line.amount > 0);
	if (active.length === 0) return 'Tempo (Hutang Usaha)';
	if (active.length === 1) return active[0].accountName;
	return `Split (${active.map((line) => line.accountName).join(' + ')})`;
}

export function computeExpenseGroupAmount(expense: Expense, group: ExpenseGroup): number {
	const rawGroupTotal = expense.items
		.filter((item) => item.group === group)
		.reduce((sum, item) => sum + item.amount, 0);

	if (rawGroupTotal === 0) return 0;
	if (expense.discountAmount <= 0 || expense.subtotal <= 0) return rawGroupTotal;

	// Allocate note-level discount proportionally so production + operational === expense.amount
	const prodRaw = expense.items
		.filter((item) => item.group === 'production')
		.reduce((sum, item) => sum + item.amount, 0);
	const prodNet = Math.round((prodRaw / expense.subtotal) * expense.amount);
	return group === 'production' ? prodNet : Math.max(0, expense.amount - prodNet);
}

export function formatCurrency(amount: number): string {
	return `Rp ${amount.toLocaleString('id-ID')}`;
}

export function formatExpenseDateTime(isoString: string): string {
	if (!isoString) return '-';
	const d = new Date(isoString);
	if (Number.isNaN(d.getTime())) return isoString;
	return new Intl.DateTimeFormat('id-ID', {
		day: '2-digit',
		month: 'short',
		year: 'numeric',
		hour: '2-digit',
		minute: '2-digit'
	}).format(d);
}
