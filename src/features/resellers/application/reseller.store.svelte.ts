import type { Reseller, ResellerInput, ResellerTier, ResellerStatus } from '../domain/reseller.entity';
import type { ResellerUseCases } from './reseller.use-cases';
import { resellerUseCases } from './reseller.use-cases';

export class ResellerStore {
	#useCases: ResellerUseCases;

	items = $state<Reseller[]>([]);
	isLoading = $state(false);
	error = $state<string | null>(null);

	searchQuery = $state('');
	selectedTier = $state<ResellerTier | 'all'>('all');
	selectedStatus = $state<ResellerStatus | 'all'>('all');

	filteredItems = $derived.by(() => {
		const q = this.searchQuery.trim().toLowerCase();
		return this.items
			.filter((item) => {
				const matchesSearch =
					!q ||
					item.name.toLowerCase().includes(q) ||
					item.code.toLowerCase().includes(q) ||
					item.ownerName.toLowerCase().includes(q) ||
					item.phone.toLowerCase().includes(q) ||
					(item.address && item.address.toLowerCase().includes(q)) ||
					(item.email && item.email.toLowerCase().includes(q)) ||
					(item.notes && item.notes.toLowerCase().includes(q));

				const matchesTier = this.selectedTier === 'all' || item.tier === this.selectedTier;

				const matchesStatus =
					this.selectedStatus === 'all' || item.status === this.selectedStatus;

				return matchesSearch && matchesTier && matchesStatus;
			})
			.sort((a, b) => a.displayOrder - b.displayOrder);
	});

	// Metrics derived for KPI cards or summary
	totalResellers = $derived(this.items.length);
	activeResellers = $derived(this.items.filter((r) => r.status === 'active').length);
	totalDepositBalance = $derived(this.items.reduce((sum, r) => sum + r.depositBalance, 0));
	totalUsedCredit = $derived(this.items.reduce((sum, r) => sum + r.usedCredit, 0));
	totalCreditLimit = $derived(this.items.reduce((sum, r) => sum + r.creditLimit, 0));
	autoHoldCount = $derived(this.items.filter((r) => r.status === 'auto_hold').length);

	constructor(useCases: ResellerUseCases = resellerUseCases) {
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

	async create(input: ResellerInput): Promise<boolean> {
		this.isLoading = true;
		this.error = null;
		const result = await this.#useCases.create(input);
		this.isLoading = false;

		if (result.success) {
			this.items = [result.data, ...this.items];
			return true;
		} else {
			this.error = result.error.message;
			return false;
		}
	}

	async update(id: string, input: ResellerInput): Promise<boolean> {
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

	async adjustDeposit(id: string, amount: number, note?: string): Promise<boolean> {
		this.isLoading = true;
		this.error = null;
		const result = await this.#useCases.adjustDeposit(id, amount, note);
		this.isLoading = false;

		if (result.success) {
			this.items = this.items.map((item) => (item.id === id ? result.data : item));
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

		const target = sorted[idx];
		const prev = sorted[idx - 1];

		const temp = target.displayOrder;
		target.displayOrder = prev.displayOrder;
		prev.displayOrder = temp;

		sorted.sort((a, b) => a.displayOrder - b.displayOrder);
		sorted.forEach((item, i) => {
			item.displayOrder = i + 1;
		});

		this.items = [...sorted];
		const result = await this.#useCases.reorder(
			sorted.map((item) => ({ id: item.id, displayOrder: item.displayOrder }))
		);
		return result.success;
	}

	async moveDown(id: string): Promise<boolean> {
		const sorted = [...this.items].sort((a, b) => a.displayOrder - b.displayOrder);
		const idx = sorted.findIndex((i) => i.id === id);
		if (idx === -1 || idx >= sorted.length - 1) return false;

		const target = sorted[idx];
		const next = sorted[idx + 1];

		const temp = target.displayOrder;
		target.displayOrder = next.displayOrder;
		next.displayOrder = temp;

		sorted.sort((a, b) => a.displayOrder - b.displayOrder);
		sorted.forEach((item, i) => {
			item.displayOrder = i + 1;
		});

		this.items = [...sorted];
		const result = await this.#useCases.reorder(
			sorted.map((item) => ({ id: item.id, displayOrder: item.displayOrder }))
		);
		return result.success;
	}

	async changeOrder(id: string, newOrder: number): Promise<boolean> {
		const sorted = [...this.items].sort((a, b) => a.displayOrder - b.displayOrder);
		const idx = sorted.findIndex((i) => i.id === id);
		if (idx === -1) return false;

		const [item] = sorted.splice(idx, 1);
		const targetIdx = Math.max(0, Math.min(newOrder - 1, sorted.length));
		sorted.splice(targetIdx, 0, item);

		sorted.forEach((it, i) => {
			it.displayOrder = i + 1;
		});

		this.items = [...sorted];
		const result = await this.#useCases.reorder(
			sorted.map((it) => ({ id: it.id, displayOrder: it.displayOrder }))
		);
		return result.success;
	}
}

export const resellerStore = new ResellerStore();
