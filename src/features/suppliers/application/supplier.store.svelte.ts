import type { Supplier, SupplierInput } from '../domain/supplier.entity';
import type { SupplierUseCases } from './supplier.use-cases';
import { supplierUseCases } from './supplier.use-cases';

export class SupplierStore {
	#useCases: SupplierUseCases;

	items = $state<Supplier[]>([]);
	isLoading = $state(false);
	error = $state<string | null>(null);

	searchQuery = $state('');

	filteredItems = $derived.by(() => {
		const q = this.searchQuery.trim().toLowerCase();
		return this.items
			.filter((item) => {
				if (!q) return true;
				return (
					item.name.toLowerCase().includes(q) ||
					item.code.toLowerCase().includes(q) ||
					(item.contactPerson && item.contactPerson.toLowerCase().includes(q)) ||
					(item.phone && item.phone.toLowerCase().includes(q)) ||
					(item.email && item.email.toLowerCase().includes(q)) ||
					(item.address && item.address.toLowerCase().includes(q)) ||
					(item.notes && item.notes.toLowerCase().includes(q))
				);
			})
			.sort((a, b) => a.displayOrder - b.displayOrder);
	});

	totalSuppliers = $derived(this.items.length);
	activeSuppliers = $derived(this.items.filter((s) => s.isActive).length);

	constructor(useCases: SupplierUseCases = supplierUseCases) {
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

	async create(input: SupplierInput): Promise<boolean> {
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

	async update(id: string, input: SupplierInput): Promise<boolean> {
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

export const supplierStore = new SupplierStore();
