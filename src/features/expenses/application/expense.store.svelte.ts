import {
	computeExpenseGroupAmount,
	type Expense,
	type ExpenseGroup,
	type ExpenseInput,
	type ExpensePaymentStatus,
	type ExpenseSettlePaymentInput,
	type ExpenseStatus
} from '../domain/expense.entity';
import { expenseUseCases } from './expense.use-cases';

export type ExpenseMainTab = 'ALL' | ExpenseGroup;

function toLocalDateKey(isoString: string): string | null {
	const parsed = new Date(isoString);
	if (Number.isNaN(parsed.getTime())) return null;
	const year = parsed.getFullYear();
	const month = String(parsed.getMonth() + 1).padStart(2, '0');
	const day = String(parsed.getDate()).padStart(2, '0');
	return `${year}-${month}-${day}`;
}

export class ExpenseStore {
	expenses = $state<Expense[]>([]);
	isLoading = $state<boolean>(false);
	error = $state<string | null>(null);

	// Primary Pill Tabs: Semua vs Produksi vs Operasional
	mainTab = $state<ExpenseMainTab>('ALL');

	// Filter State
	searchQuery = $state<string>('');
	statusFilters = $state<ExpenseStatus[]>([]);
	paymentStatusFilters = $state<ExpensePaymentStatus[]>([]);
	accountFilters = $state<string[]>([]);
	dateRange = $state<{ startDate: string | null; endDate: string | null }>({
		startDate: null,
		endDate: null
	});

	// Non-cancelled expenses for KPI counting
	nonCancelledExpenses = $derived.by(() => {
		return this.expenses.filter((e) => e.status !== 'CANCELLED');
	});

	allCount = $derived.by(() => this.expenses.length);

	productionCount = $derived.by(() => {
		return this.expenses.filter((e) => e.items.some((item) => item.group === 'production')).length;
	});

	operationalCount = $derived.by(() => {
		return this.expenses.filter((e) => e.items.some((item) => item.group === 'operational')).length;
	});

	approvedCount = $derived.by(() => {
		return this.expenses.filter((e) => e.status === 'APPROVED').length;
	});

	pendingCount = $derived.by(() => {
		return this.expenses.filter((e) => e.status === 'PENDING').length;
	});

	payableCount = $derived.by(() => {
		return this.nonCancelledExpenses.filter((e) => e.remainingAmount > 0).length;
	});

	totalApprovedAmount = $derived.by(() => {
		return this.nonCancelledExpenses.reduce((sum, item) => sum + item.amount, 0);
	});

	totalPayableAmount = $derived.by(() => {
		return this.nonCancelledExpenses.reduce((sum, item) => sum + item.remainingAmount, 0);
	});

	productionTotalAmount = $derived.by(() => {
		return this.nonCancelledExpenses.reduce(
			(sum, expense) => sum + computeExpenseGroupAmount(expense, 'production'),
			0
		);
	});

	operationalTotalAmount = $derived.by(() => {
		return this.nonCancelledExpenses.reduce(
			(sum, expense) => sum + computeExpenseGroupAmount(expense, 'operational'),
			0
		);
	});

	filteredExpenses = $derived.by(() => {
		const q = this.searchQuery.trim().toLowerCase();

		return this.expenses.filter((expense) => {
			// 1. Tab filter (receipt matches tab if at least one item belongs to that group)
			if (this.mainTab !== 'ALL' && !expense.items.some((item) => item.group === this.mainTab)) {
				return false;
			}

			// 2. Status filter
			if (this.statusFilters.length > 0 && !this.statusFilters.includes(expense.status)) {
				return false;
			}

			// 3. Payment status filter
			if (
				this.paymentStatusFilters.length > 0 &&
				!this.paymentStatusFilters.includes(expense.paymentStatus)
			) {
				return false;
			}

			// 4. Account filter (supports split payment lines)
			if (this.accountFilters.length > 0) {
				const matchesAccount =
					expense.paymentLines.some((line) => this.accountFilters.includes(line.accountName)) ||
					this.accountFilters.includes(expense.accountName);
				if (!matchesAccount) return false;
			}

			// 5. Date range filter
			if (this.dateRange.startDate || this.dateRange.endDate) {
				const itemDay = toLocalDateKey(expense.expenseDate);
				if (!itemDay) return false;
				if (this.dateRange.startDate && itemDay < this.dateRange.startDate) return false;
				if (this.dateRange.endDate && itemDay > this.dateRange.endDate) return false;
			}

			// 6. Search query across receipt & all items
			if (q) {
				const itemsText = expense.items
					.map((item) =>
						[
							item.categoryName,
							item.productCategoryName ?? '',
							item.description,
							item.notes ?? ''
						].join(' ')
					)
					.join(' ');
				const haystack = [
					expense.code,
					expense.vendorName ?? '',
					expense.accountName,
					expense.recordedBy,
					expense.referenceNumber ?? '',
					expense.notes ?? '',
					itemsText
				]
					.join(' ')
					.toLowerCase();
				if (!haystack.includes(q)) return false;
			}

			return true;
		});
	});

	async load(): Promise<void> {
		this.isLoading = true;
		this.error = null;
		const res = await expenseUseCases.list();
		if (res.success) {
			this.expenses = res.data;
		} else {
			this.error = res.error.message;
		}
		this.isLoading = false;
	}

	async refresh(): Promise<void> {
		await this.load();
	}

	async create(input: ExpenseInput): Promise<boolean> {
		const res = await expenseUseCases.create(input);
		if (res.success) {
			this.expenses = [res.data, ...this.expenses];
			return true;
		}
		this.error = res.error.message;
		return false;
	}

	async settlePayment(id: string, input: ExpenseSettlePaymentInput): Promise<boolean> {
		const res = await expenseUseCases.settlePayment(id, input);
		if (res.success) {
			this.expenses = this.expenses.map((item) => (item.id === id ? res.data : item));
			return true;
		}
		this.error = res.error.message;
		return false;
	}

	async approve(id: string): Promise<boolean> {
		const res = await expenseUseCases.approve(id);
		if (res.success) {
			this.expenses = this.expenses.map((item) => (item.id === id ? res.data : item));
			return true;
		}
		this.error = res.error.message;
		return false;
	}

	async cancel(id: string, reason: string): Promise<boolean> {
		const res = await expenseUseCases.cancel(id, reason);
		if (res.success) {
			this.expenses = this.expenses.map((item) => (item.id === id ? res.data : item));
			return true;
		}
		this.error = res.error.message;
		return false;
	}

	setMainTab(tab: ExpenseMainTab) {
		this.mainTab = tab;
	}

	setSearch(query: string) {
		this.searchQuery = query;
	}

	setDateRange(startDate: string | null, endDate: string | null) {
		this.dateRange = { startDate, endDate };
	}

	toggleStatusFilter(status: ExpenseStatus) {
		if (this.statusFilters.includes(status)) {
			this.statusFilters = this.statusFilters.filter((s) => s !== status);
		} else {
			this.statusFilters = [...this.statusFilters, status];
		}
	}

	togglePaymentStatusFilter(status: ExpensePaymentStatus) {
		if (this.paymentStatusFilters.includes(status)) {
			this.paymentStatusFilters = this.paymentStatusFilters.filter((s) => s !== status);
		} else {
			this.paymentStatusFilters = [...this.paymentStatusFilters, status];
		}
	}

	toggleAccountFilter(account: string) {
		if (this.accountFilters.includes(account)) {
			this.accountFilters = this.accountFilters.filter((a) => a !== account);
		} else {
			this.accountFilters = [...this.accountFilters, account];
		}
	}

	clearStatusFilters() {
		this.statusFilters = [];
	}

	clearPaymentStatusFilters() {
		this.paymentStatusFilters = [];
	}

	clearAccountFilters() {
		this.accountFilters = [];
	}

	resetFilters() {
		this.searchQuery = '';
		this.statusFilters = [];
		this.paymentStatusFilters = [];
		this.accountFilters = [];
		this.dateRange = { startDate: null, endDate: null };
	}
}

export const expenseStore = new ExpenseStore();
