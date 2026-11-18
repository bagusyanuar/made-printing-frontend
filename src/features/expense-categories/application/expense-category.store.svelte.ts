import type {
	ExpenseCategory,
	ExpenseCategoryInput,
	ExpenseGroup
} from '../domain/expense-category.entity';
import type { ExpenseCategoryUseCases } from './expense-category.use-cases';
import { expenseCategoryUseCases } from './expense-category.use-cases';

export class ExpenseCategoryStore {
	#useCases: ExpenseCategoryUseCases;

	items = $state<ExpenseCategory[]>([]);
	isLoading = $state(false);
	error = $state<string | null>(null);

	searchQuery = $state('');
	selectedGroup = $state<ExpenseGroup | 'all'>('all');
	statusFilter = $state<'all' | 'active' | 'inactive'>('all');

	filteredItems = $derived.by(() => {
		const q = this.searchQuery.trim().toLowerCase();
		return this.items
			.filter((item) => {
				const matchesSearch =
					!q ||
					item.name.toLowerCase().includes(q) ||
					item.code.toLowerCase().includes(q) ||
					(item.productCategoryName && item.productCategoryName.toLowerCase().includes(q));

				const matchesGroup = this.selectedGroup === 'all' || item.group === this.selectedGroup;

				const matchesStatus =
					this.statusFilter === 'all' ||
					(this.statusFilter === 'active' ? item.isActive : !item.isActive);

				return matchesSearch && matchesGroup && matchesStatus;
			})
			.sort((a, b) => a.displayOrder - b.displayOrder);
	});

	totalCategories = $derived(this.items.length);
	productionCategories = $derived(this.items.filter((c) => c.group === 'production').length);
	operationalCategories = $derived(this.items.filter((c) => c.group === 'operational').length);

	constructor(useCases: ExpenseCategoryUseCases = expenseCategoryUseCases) {
		this.#useCases = useCases;
	}

	async load(): Promise<void> {
		this.isLoading = true;
		this.error = null;
		const result = await this.#useCases.list();
		this.isLoading = false;

		if (result.success) {
			this.items = result.data;
		} else {
			this.error = result.error.message;
		}
	}

	async create(input: ExpenseCategoryInput): Promise<boolean> {
		this.isLoading = true;
		this.error = null;
		const result = await this.#useCases.create(input);
		this.isLoading = false;

		if (result.success) {
			this.items = [...this.items, result.data].sort((a, b) => a.displayOrder - b.displayOrder);
			return true;
		} else {
			this.error = result.error.message;
			return false;
		}
	}

	async update(id: string, input: ExpenseCategoryInput): Promise<boolean> {
		this.isLoading = true;
		this.error = null;
		const result = await this.#useCases.update(id, input);
		this.isLoading = false;

		if (result.success) {
			this.items = this.items.map((item) => (item.id === id ? result.data : item));
			return true;
		} else {
			this.error = result.error.message;
			return false;
		}
	}

	async delete(id: string): Promise<boolean> {
		this.isLoading = true;
		this.error = null;
		const result = await this.#useCases.delete(id);
		this.isLoading = false;

		if (result.success) {
			this.items = this.items.filter((item) => item.id !== id);
			return true;
		} else {
			this.error = result.error.message;
			return false;
		}
	}

	async moveUp(id: string): Promise<boolean> {
		const sorted = [...this.items].sort((a, b) => a.displayOrder - b.displayOrder);
		const idx = sorted.findIndex((i) => i.id === id);
		if (idx <= 0) return false;

		const current = sorted[idx];
		const above = sorted[idx - 1];

		const oldCurrentOrder = current.displayOrder;
		const oldAboveOrder = above.displayOrder;

		const newCurrentOrder = oldAboveOrder;
		const newAboveOrder = oldCurrentOrder === oldAboveOrder ? oldAboveOrder + 1 : oldCurrentOrder;

		current.displayOrder = newCurrentOrder;
		above.displayOrder = newAboveOrder;

		this.items = [...this.items].sort((a, b) => a.displayOrder - b.displayOrder);

		const result = await this.#useCases.reorder([
			{ id: current.id, displayOrder: newCurrentOrder },
			{ id: above.id, displayOrder: newAboveOrder }
		]);

		return result.success;
	}

	async moveDown(id: string): Promise<boolean> {
		const sorted = [...this.items].sort((a, b) => a.displayOrder - b.displayOrder);
		const idx = sorted.findIndex((i) => i.id === id);
		if (idx === -1 || idx >= sorted.length - 1) return false;

		const current = sorted[idx];
		const below = sorted[idx + 1];

		const oldCurrentOrder = current.displayOrder;
		const oldBelowOrder = below.displayOrder;

		const newCurrentOrder = oldBelowOrder;
		const newBelowOrder = oldCurrentOrder === oldBelowOrder ? oldCurrentOrder - 1 : oldCurrentOrder;

		current.displayOrder = newCurrentOrder;
		below.displayOrder = newBelowOrder;

		this.items = [...this.items].sort((a, b) => a.displayOrder - b.displayOrder);

		const result = await this.#useCases.reorder([
			{ id: current.id, displayOrder: newCurrentOrder },
			{ id: below.id, displayOrder: newBelowOrder }
		]);

		return result.success;
	}

	async changeOrder(id: string, targetOrder: number): Promise<boolean> {
		const sorted = [...this.items].sort((a, b) => a.displayOrder - b.displayOrder);
		const targetIndex = sorted.findIndex((i) => i.id === id);
		if (targetIndex === -1) return false;

		const [targetItem] = sorted.splice(targetIndex, 1);
		const insertIdx = Math.max(0, Math.min(targetOrder - 1, sorted.length));
		sorted.splice(insertIdx, 0, targetItem);

		const updates: { id: string; displayOrder: number }[] = [];
		sorted.forEach((item, index) => {
			const newOrder = index + 1;
			if (item.displayOrder !== newOrder) {
				item.displayOrder = newOrder;
				updates.push({ id: item.id, displayOrder: newOrder });
			}
		});

		this.items = [...sorted];

		if (updates.length > 0) {
			const result = await this.#useCases.reorder(updates);
			return result.success;
		}

		return true;
	}
}

export const expenseCategoryStore = new ExpenseCategoryStore();
